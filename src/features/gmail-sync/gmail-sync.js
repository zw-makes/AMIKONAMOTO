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
        const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`;
        const resp = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!resp.ok) return null;
        return await resp.json();
    },

    /**
     * Simple parser to extract Name, Amount, and Date from email metadata
     */
    parseEmail(detail) {
        const headers = detail.payload.headers;
        const subject = headers.find(h => h.name === 'Subject')?.value || '';
        const from = headers.find(h => h.name === 'From')?.value || '';
        const snippet = detail.snippet || '';

        // Extract "Name" from "From" (e.g., "Netflix <info@netflix.com>" -> "Netflix")
        let name = from.split('<')[0].trim().replace(/"/g, '');
        
        // Refine common names
        if (name.toLowerCase().includes('google')) name = 'Google One';
        if (name.toLowerCase().includes('spotify')) name = 'Spotify';
        if (name.toLowerCase().includes('apple')) name = 'iCloud / Apple Music';
        if (name.toLowerCase().includes('netflix')) name = 'Netflix';
        if (name.toLowerCase().includes('adobe')) name = 'Adobe Creative Cloud';
        if (name.toLowerCase().includes('amazon')) name = 'Amazon Prime';

        // Extract potential amount from snippet using regex (e.g., $9.99 or £12.50)
        const amountMatch = snippet.match(/[\$£€¥](\d+\.?\u0020?\d{0,2})/);
        const amount = amountMatch ? parseFloat(amountMatch[1]) : 9.99; // Default fallback

        // Detect frequency
        let frequency = 'monthly';
        if (subject.toLowerCase().includes('annual') || snippet.toLowerCase().includes('annual') || snippet.toLowerCase().includes('year')) {
            frequency = 'yearly';
        }

        return {
            name: name,
            amount: amount,
            currency: amountMatch ? amountMatch[0].charAt(0) : '$',
            frequency: frequency,
            source: 'Gmail',
            emailDate: headers.find(h => h.name === 'Date')?.value,
            id: detail.id // Keep ID for potential "ignore" lists
        };
    }
};
