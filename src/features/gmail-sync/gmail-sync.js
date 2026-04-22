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
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            
            // Check session, global variable, or session storage
            const token = session?.provider_token || window.googleProviderToken || sessionStorage.getItem('google_provider_token');

            if (!token) {
                console.error('[GmailSync] No Google provider token found.');
                throw new Error('GMAIL_AUTH_REQUIRED');
            }

            console.log('[GmailSync] Starting scan with provider token...');

            // 1. Search for messages with subscription keywords
            // We look for common keywords in subjects or body
            const query = 'subject:(receipt OR "billed" OR "renew" OR "subscription" OR "order confirmed" OR "payment received") after:2024/01/01';
            const messages = await this.fetchMessages(token, query);

            if (messages.length === 0) {
                console.log('[GmailSync] No matching emails found.');
                return [];
            }

            // 2. Fetch details for each message (limiting to first 15 for performance)
            const detectedSubs = [];
            const detailsPromises = messages.slice(0, 15).map(msg => this.fetchMessageDetails(token, msg.id));
            const details = await Promise.all(detailsPromises);

            // 3. Parse details into subscription objects
            details.forEach(detail => {
                if (!detail) return;
                const sub = this.parseEmail(detail);
                if (sub) detectedSubs.push(sub);
            });

            // 4. De-duplicate by name
            const uniqueSubs = Array.from(new Map(detectedSubs.map(s => [s.name.toLowerCase(), s])).values());
            
            console.log(`[GmailSync] Scan complete. Found ${uniqueSubs.length} unique potential subscriptions.`);
            return uniqueSubs;

        } catch (err) {
            console.error('[GmailSync] Scan failed:', err);
            throw err;
        } finally {
            this.isSyncing = false;
        }
    },

    /**
     * Fetch message IDs matching the query
     */
    async fetchMessages(token, query) {
        const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=20`;
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

        // If we found plain text, return it. Otherwise, return stripped HTML.
        if (plain.trim()) return plain;
        
        // Strip HTML tags using regex if no plain text available
        return html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') // Remove styles
                   .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Remove scripts
                   .replace(/<[^>]+>/g, ' ') // Remove tags
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
            // Gmail uses base64url encoding
            const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
            return decodeURIComponent(escape(atob(base64)));
        } catch (e) {
            console.warn('[GmailSync] Base64 decode failed:', e);
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
        
        // Combine all searchable text
        const searchableText = `${subject} ${snippet} ${fullBody}`.replace(/\s+/g, ' ');

        // 1. Extract Name and Email Address
        const fromMatch = fromHeader.match(/^(.*?)\s*<([^>]+)>/) || [null, fromHeader, fromHeader];
        let name = fromMatch[1]?.replace(/"/g, '').trim() || '';
        const email = fromMatch[2]?.toLowerCase() || '';
        const domain = email.split('@')[1] || '';

        // 2. REFINEMENT: Domain Detection
        const genericNames = ['no-reply', 'noreply', 'support', 'billing', 'info', 'service', 'notifications', 'order'];
        if (!name || genericNames.some(g => name.toLowerCase().includes(g))) {
            if (domain) {
                const domainParts = domain.split('.');
                name = domainParts[domainParts.length - 2]; 
                if (name === 'co' || name === 'com') name = domainParts[domainParts.length - 3];
            }
        }

        // 3. BRAND SCAN: Search full text for known brands
        const commonBrands = ['Netflix', 'Spotify', 'Apple', 'iCloud', 'Disney+', 'YouTube', 'Prime', 'Adobe', 'Canva', 'LinkedIn', 'ChatGPT', 'Claude', 'Midjourney', 'Hulu', 'Paramount+', 'Peacock', 'Slack', 'Zoom', 'Dropbox'];
        for (const brand of commonBrands) {
            if (searchableText.toLowerCase().includes(brand.toLowerCase())) {
                name = brand;
                break;
            }
        }

        if (name) name = name.charAt(0).toUpperCase() + name.slice(1);

        // 4. PRICE DETECTION (Deep Scan)
        // This regex is now scanning the FULL BODY for prices
        const priceRegex = /([\$£€₹¥]\s?\d+(?:\.\d{2})?|\d+(?:\.\d{2})?\s?(?:USD|GBP|EUR|INR))/gi;
        const allPrices = searchableText.match(priceRegex) || [];
        
        let amount = 0;
        let symbol = '$';
        let currency = 'USD';

        if (allPrices.length > 0) {
            // We usually want the most prominent price (often the first one in a receipt)
            const rawPrice = allPrices[0];
            amount = parseFloat(rawPrice.replace(/[^\d.]/g, '')) || 0;
            symbol = rawPrice.match(/[\$£€₹¥]/)?.[0] || '$';
            
            if (symbol === '₹') currency = 'INR';
            else if (symbol === '£') currency = 'GBP';
            else if (symbol === '€') currency = 'EUR';
        }

        // Failsafe: if amount is 0, skip this email
        if (!name || amount === 0) return null;

        // 5. FREQUENCY DETECTION
        let frequency = 'monthly';
        const annualKeywords = ['annual', 'yearly', '1 year', '12 months', '/year', 'billed every year'];
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
