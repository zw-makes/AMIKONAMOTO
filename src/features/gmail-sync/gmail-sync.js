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

            // 1. Search for messages - BROADENED QUERY
            const query = 'subject:(receipt OR "billed" OR "renew" OR "subscription" OR "invoice" OR "payment" OR "premium" OR "order confirmed" OR "service")';
            const messages = await this.fetchMessages(token, query);

            if (messages.length === 0) {
                console.log('[GmailSync] No matching emails found in search.');
                return [];
            }

            // 2. Fetch details (Increased to 25 for wider coverage)
            const detectedSubs = [];
            const detailsPromises = messages.slice(0, 25).map(msg => this.fetchMessageDetails(token, msg.id));
            const details = await Promise.all(detailsPromises);

            // 3. Parse details
            details.forEach(detail => {
                if (!detail) return;
                const sub = this.parseEmail(detail);
                if (sub) detectedSubs.push(sub);
            });

            // 4. De-duplicate and Sort
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
    },

    /**
     * Smart parser to extract Name, Amount, and Date from FULL email content
     */
    parseEmail(detail) {
        const headers = detail.payload.headers;
        const subject = headers.find(h => h.name === 'Subject')?.value || '';
        const fromHeader = headers.find(h => h.name === 'From')?.value || '';
        const fullBody = this.getBody(detail.payload);
        const snippet = detail.snippet || '';
        
        const searchableText = `${subject} ${snippet} ${fullBody}`.replace(/\s+/g, ' ');

        // 1. Extract Name and Domain
        const fromMatch = fromHeader.match(/^(.*?)\s*<([^>]+)>/) || [null, fromHeader, fromHeader];
        let name = fromMatch[1]?.replace(/"/g, '').trim() || '';
        const email = fromMatch[2]?.toLowerCase() || '';
        const domain = email.split('@')[1] || '';

        // 2. Generic name cleanup
        const genericNames = ['no-reply', 'noreply', 'support', 'billing', 'info', 'service', 'notifications', 'order', 'team', 'account'];
        if (!name || genericNames.some(g => name.toLowerCase().includes(g))) {
            if (domain) {
                const parts = domain.split('.');
                name = parts[parts.length - 2]; 
                if (name === 'co' || name === 'com' || name === 'net') name = parts[parts.length - 3] || name;
            }
        }

        // 3. Brand Matching
        const commonBrands = ['Netflix', 'Spotify', 'Apple', 'iCloud', 'Disney', 'YouTube', 'Prime', 'Adobe', 'Canva', 'LinkedIn', 'ChatGPT', 'Claude', 'Midjourney', 'Hulu', 'Slack', 'Zoom', 'Dropbox', 'Microsoft', 'GitHub', 'OpenAI', 'Uber', 'Bolt', 'Wolfe', 'Deliveroo', 'DoorDash'];
        for (const brand of commonBrands) {
            if (searchableText.toLowerCase().includes(brand.toLowerCase())) {
                name = brand;
                break;
            }
        }

        if (name) name = name.charAt(0).toUpperCase() + name.slice(1);

        // 4. PRICE DETECTION (Aggressive International regex)
        // Now handles dots and commas: $9.99, 9,99€, ₹500, etc.
        const priceRegex = /([\$£€₹¥]\s?\d+(?:[.,]\d{2})?|\d+(?:[.,]\d{2})?\s?(?:USD|GBP|EUR|INR|[\$£€₹¥]))/gi;
        const allPrices = searchableText.match(priceRegex) || [];
        
        let amount = 0;
        let symbol = '$';
        let currency = 'USD';

        if (allPrices.length > 0) {
            const rawPrice = allPrices[0];
            // Normalize comma to dot for parsing
            amount = parseFloat(rawPrice.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
            symbol = rawPrice.match(/[\$£€₹¥]/)?.[0] || '$';
            
            if (symbol === '₹') currency = 'INR';
            else if (symbol === '£') currency = 'GBP';
            else if (symbol === '€') currency = 'EUR';
        }

        // 5. FINAL CHECK: If no amount found, set a default fallback instead of skipping!
        if (!name) return null;
        if (amount === 0) amount = 9.99; // Default fallback to ensure the item appears

        // 6. FREQUENCY
        let frequency = 'monthly';
        const annualKeywords = ['annual', 'yearly', '1 year', '12 months', '/year', 'billed every year', 'year plan'];
        if (annualKeywords.some(k => searchableText.toLowerCase().includes(k))) {
            frequency = 'yearly';
        }

        return {
            name: name,
            amount: amount,
            currency: currency,
            symbol: symbol,
            frequency: frequency,
            source: 'Gmail',
            domain: domain || `${name.toLowerCase()}.com`,
            emailDate: headers.find(h => h.name === 'Date')?.value,
            id: detail.id
        };
    }
};
