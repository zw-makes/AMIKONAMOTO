import { supabase } from '../../supabase.js';

/**
 * Gmail Sync Feature
 * Scans user's Gmail for subscription-related emails using the Google Provider Token.
 */

export const GmailSync = {
    isSyncing: false,

    /**
     * Main entry point to start a scan
     * @returns {Promise<Array>} List of detected potential subscriptions
     */
    async scanForSubscriptions() {
        if (this.isSyncing) return [];
        this.isSyncing = true;

        try {
            const token = await this.getValidToken();

            console.log('[GmailSync] Starting wide-net scan...');

            // 1. Search for messages - LIMITED TO LAST 3 MONTHS (TIGHTENED QUERY)
            const threeMonthsAgo = new Date();
            threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
            const dateFilter = `${threeMonthsAgo.getFullYear()}/${String(threeMonthsAgo.getMonth() + 1).padStart(2, '0')}/${String(threeMonthsAgo.getDate()).padStart(2, '0')}`;
            
            const query = `subject:("subscription" OR "renewed" OR "renew" OR "billing" OR "billed" OR "your plan" OR "membership" OR "premium plan" OR "receipt") after:${dateFilter}`;
            const messages = await this.fetchMessages(token, query);

            if (messages.length === 0) {
                console.log('[GmailSync] No matching emails found in search.');
                return [];
            }

            // 2. Fetch details (Increased for wider AI coverage)
            const detailsPromises = messages.slice(0, 25).map(msg => this.fetchMessageDetails(token, msg.id));
            const details = await Promise.all(detailsPromises);

            // 3. Prepare text for AI Analysis
            const emailContents = details.map(detail => {
                if (!detail) return '';
                const headers = detail.payload.headers;
                const subject = headers.find(h => h.name === 'Subject')?.value || '';
                const snippet = detail.snippet || '';
                const body = this.getBody(detail.payload);
                return `Subject: ${subject}\nSnippet: ${snippet}\nContent: ${body.substring(0, 500)}\n---`;
            }).join('\n\n');

            if (!emailContents.trim()) return [];

            // 4. Call AI for Extraction
            console.log('[GmailSync] Sending data to AI for extraction...');
            const detectedSubs = await this.callAI(emailContents);
            
            // 5. De-duplicate and Sort
            const uniqueSubs = Array.from(new Map(detectedSubs.map(s => [s.name.toLowerCase(), s])).values());
            
            return uniqueSubs;

        } catch (err) {
            console.error('[GmailSync] Scan failed:', err);
            throw err;
        } finally {
            this.isSyncing = false;
        }
    },

    /**
     * AI Extraction Logic (Mirrors Smart Import)
     */
    async callAI(text) {
        const EXTRACTION_SYSTEM_PROMPT = `You are an exhaustive, row-by-row subscription extraction machine.
Your task is to scan the provided email content and extract EVERY SINGLE subscription entry.

SCANNING PROTOCOL:
1. Identify the BRAND/NAME.
2. Extract the PRICE, CURRENCY, and SYMBOL.
3. Identify the frequency (monthly/yearly/trial).
4. Extract the DATE or billing day.

JSON SCHEMA:
Return a JSON array of objects:
- "name": string
- "domain": string (e.g. spotify.com)
- "price": number
- "currency": string (USD, INR, etc.)
- "symbol": string ($, ₹, etc.)
- "type": "monthly" | "yearly" | "trial"
- "date": string (YYYY-MM-DD)

Return ONLY the raw JSON array. NO code blocks, NO text.`;

        try {
            const { data, error } = await supabase.functions.invoke('sync-groq', {
                body: { 
                    userPrompt: `Extract subscriptions from these emails:\n\n${text}`,
                    systemPrompt: EXTRACTION_SYSTEM_PROMPT 
                }
            });

            if (error || (data && data.error)) throw new Error(error?.message || data?.error || 'AI Sync Error');
            
            const raw = data.reply || '[]';
            let cleaned = raw.trim();
            cleaned = cleaned.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();
            
            const parsed = JSON.parse(cleaned);
            return parsed.map(s => {
                // Robust Date Handling (Extract day for 'date' and full string for 'startDate')
                let billingDay = 1;
                let fullDate = s.date; // AI returns YYYY-MM-DD in the 'date' field

                if (typeof fullDate === 'string' && fullDate.includes('-')) {
                    const parts = fullDate.split('-');
                    billingDay = parseInt(parts[2]) || 1;
                } else if (typeof fullDate === 'number') {
                    billingDay = fullDate;
                    const now = new Date();
                    fullDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(billingDay).padStart(2, '0')}`;
                }

                return {
                    ...s,
                    source: 'Gmail',
                    domain: (s.domain || `${s.name.toLowerCase()}.com`).replace(/^(mail\.|email\.|billing\.|noreply\.)/, ''),
                    amount: parseFloat(s.price) || 0,
                    date: billingDay, // Day of month (1-31)
                    startDate: fullDate // Full YYYY-MM-DD
                };
            });
        } catch (e) {
            console.error('[GmailSync] AI Parsing failed:', e);
            return [];
        }
    },

    /**
     * Retrieves a valid Google Provider Token, refreshing if needed.
     */
    async getValidToken() {
        let token = localStorage.getItem('google_provider_token');

        if (!token) {
            console.error('[GmailSync] No token in localStorage, checking session...');
            const { data: { session } } = await supabase.auth.getSession();
            token = session?.provider_token;
            if (token) localStorage.setItem('google_provider_token', token);
        }

        if (!token) throw new Error('GMAIL_AUTH_REQUIRED');

        // Test token validity
        const testResp = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (testResp.status === 401) {
            console.log('[GmailSync] Token expired, refreshing session...');
            const { data } = await supabase.auth.refreshSession();
            
            // If the refresh gave us a new provider token, update it
            if (data?.session?.provider_token) {
                token = data.session.provider_token;
                localStorage.setItem('google_provider_token', token);
            } else if (!data?.session) {
                // If the whole session refresh failed, then we are truly unauthorized
                throw new Error('GMAIL_AUTH_REQUIRED');
            }
            // If session refreshed but no new provider_token, we'll try the current one 
            // one last time (some Supabase setups persist the token in the session cookie)
        }

        return token;
    },

    /**
     * Fetch message IDs matching the query
     */
    async fetchMessages(token, query) {
        // Increased maxResults to 50 to find more potential subs
        const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=50`;
        const resp = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!resp.ok) throw new Error('Gmail API List Error');
        const data = await resp.json();
        return data.messages || [];
    },

    /**
     * Fetch FULL message details including parts
     */
    async fetchMessageDetails(token, messageId) {
        const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`;
        const resp = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!resp.ok) return null;
        return await resp.json();
    },

    /**
     * Recursive helper to extract the body from Gmail message parts
     * Prioritizes text/plain over text/html
     */
    getBody(payload) {
        let plain = "";
        let html = "";

        const traverse = (part) => {
            if (part.body && part.body.data) {
                const decoded = this.decodeBase64(part.body.data);
                if (part.mimeType === 'text/plain') {
                    plain += decoded;
                } else if (part.mimeType === 'text/html') {
                    html += decoded;
                }
            }
            if (part.parts) {
                part.parts.forEach(traverse);
            }
        };

        traverse(payload);

        if (plain.trim()) return plain;
        
        return html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') 
                   .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') 
                   .replace(/<[^>]+>/g, ' ') 
                   .replace(/&nbsp;/g, ' ')
                   .replace(/\s+/g, ' ')
                   .trim();
    },

    /**
     * Decode base64url string to UTF-8
     */
    decodeBase64(data) {
        if (!data) return "";
        try {
            const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
            return decodeURIComponent(escape(atob(base64)));
        } catch (e) {
            return "";
        }
    }
};
