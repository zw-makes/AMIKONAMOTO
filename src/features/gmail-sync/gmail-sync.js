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
     * Fetch full metadata for a specific message
     */
    async fetchMessageDetails(token, messageId) {
        // We use format=full to get more content, but we'll stick to snippet for speed if possible
        // or use format=metadata with more headers
        const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date&metadataHeaders=Return-Path`;
        const resp = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!resp.ok) return null;
        return await resp.json();
    },

    /**
     * Smart parser to extract Name, Amount, and Date from email metadata
     */
    parseEmail(detail) {
        const headers = detail.payload.headers;
        const subject = headers.find(h => h.name === 'Subject')?.value || '';
        const fromHeader = headers.find(h => h.name === 'From')?.value || '';
        const snippet = detail.snippet || '';

        // 1. Extract Name and Email Address
        // From: "Brand Name <email@domain.com>"
        const fromMatch = fromHeader.match(/^(.*?)\s*<([^>]+)>/) || [null, fromHeader, fromHeader];
        let name = fromMatch[1]?.replace(/"/g, '').trim() || '';
        const email = fromMatch[2]?.toLowerCase() || '';
        const domain = email.split('@')[1] || '';

        // 2. REFINEMENT: If name is generic (no-reply, support, billing, etc.), use the domain or subject
        const genericNames = ['no-reply', 'noreply', 'support', 'billing', 'info', 'service', 'notifications', 'order'];
        if (!name || genericNames.some(g => name.toLowerCase().includes(g))) {
            // Try to extract brand from domain (e.g., "netflix.com" -> "Netflix")
            if (domain) {
                const domainParts = domain.split('.');
                name = domainParts[domainParts.length - 2]; // Get the main part of the domain
                if (name === 'co' || name === 'com') name = domainParts[domainParts.length - 3];
            }
        }

        // 3. SUBJECT SCAN: Look for brand names in subject if name is still messy
        const commonBrands = ['Netflix', 'Spotify', 'Apple', 'iCloud', 'Disney+', 'YouTube', 'Prime', 'Adobe', 'Canva', 'LinkedIn', 'ChatGPT', 'Claude', 'Midjourney'];
        for (const brand of commonBrands) {
            if (subject.toLowerCase().includes(brand.toLowerCase())) {
                name = brand;
                break;
            }
        }

        // Clean up the name (Capitalize)
        if (name) name = name.charAt(0).toUpperCase() + name.slice(1);

        // 4. PRICE DETECTION (Optimized Regex)
        // Looks for things like $9.99, £10, 14.99 USD, etc.
        const priceRegex = /([\$£€₹¥]\s?\d+(?:\.\d{2})?|\d+(?:\.\d{2})?\s?(?:USD|GBP|EUR|INR))/i;
        const priceMatch = (snippet + ' ' + subject).match(priceRegex);
        
        let amount = 0;
        let symbol = '$';
        let currency = 'USD';

        if (priceMatch) {
            const rawPrice = priceMatch[0];
            amount = parseFloat(rawPrice.replace(/[^\d.]/g, '')) || 0;
            symbol = rawPrice.match(/[\$£€₹¥]/)?.[0] || '$';
            // Simple currency guess
            if (symbol === '₹') currency = 'INR';
            else if (symbol === '£') currency = 'GBP';
            else if (symbol === '€') currency = 'EUR';
        }

        // Skip if we couldn't find a name or amount is 0 (likely not a subscription receipt)
        if (!name || name.toLowerCase() === 'no-reply' || amount === 0) return null;

        // 5. FREQUENCY DETECTION
        let frequency = 'monthly';
        const annualKeywords = ['annual', 'yearly', '1 year', '12 months', '/year'];
        if (annualKeywords.some(k => (subject + ' ' + snippet).toLowerCase().includes(k))) {
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
