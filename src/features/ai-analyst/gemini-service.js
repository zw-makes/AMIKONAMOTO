/**
 * Supabase AI Service for SubTrack
 * Safely calls Groq's Llama 3.3 70B through a Supabase Edge Function to avoid leaking keys.
 */

// Import the global supabase client
// Assuming supabase is initialized globally in main.js
const getSupabase = () => window.supabase;

const SUBSCRIPTION_KEYWORDS = [
    'subscription', 'spend', 'spending', 'cost', 'pay', 'paying', 'paid',
    'renew', 'renewal', 'monthly', 'yearly', 'annual', 'trial', 'cancel',
    'money', 'expensive', 'cheap', 'save', 'saving', 'total', 'how much',
    'price', 'dollar', 'budget', 'list', 'what do i', 'my subscriptions',
    'netflix', 'spotify', 'apple', 'amazon', 'youtube', 'disney', 'hulu',
    'grand total', 'active', 'stopped', 'paused', 'cheapest', 'most expensive'
];

function isSubscriptionRelated(prompt) {
    const lower = prompt.toLowerCase();
    return SUBSCRIPTION_KEYWORDS.some(kw => lower.includes(kw));
}

export async function askGroq(userPrompt, subscriptionData = [], selectedSub = null) {
    try {
        const supabase = getSupabase();
        if (!supabase) throw new Error('Supabase client not initialized');

        const needsContext = isSubscriptionRelated(userPrompt) || selectedSub;

        let subContext = '';
        if (needsContext && subscriptionData.length > 0) {
            const report = window.lastReport;

            const trimmedSubs = subscriptionData.map(s => ({
                id: s.id,
                name: s.name,
                price: `${s.symbol || s.currency || ''}${s.price.toFixed(2)}`,
                type: s.type,
                billingDay: s.date,
                status: s.stopped ? 'stopped' : 'active',
                recurring: s.recurring || 'recurring'
            }));

            const grandTotalLine = report
                ? `[CRITICAL RULE] The app's pre-calculated Grand Total for the EXACT CURRENT VIEWED MONTH is: ${report.symbol}${report.total.toFixed(2)} ${report.currency}. You MUST use this exact number if asked about the current total.`
                : '[CRITICAL RULE] No grand total data is currently available.';

            let selectionContext = '';
            if (selectedSub) {
                selectionContext = `\n[LOCKED SUBSCRIPTION] The user has specifically LOCKED the following subscription for focus: ${JSON.stringify(selectedSub)}. 
[ADMIN PERMISSIONS] YOU HAVE 100% PERMISSION TO:
- Change ANY field (price, name, date, currency, symbol, notes).
- Mark as Stopped/Cancelled (set stopped: true).
- Mark as Paid/Unpaid (use TOGGLE_PAID).
- DELETE the subscription entirely (use DELETE_SUB).

[ACTION RULE] Speak in the NEW state (after the change). 
Example: "Netflix is now $15." instead of "I will change Netflix to $15." 
Confirm the action concisely in 1 sentence.

[ACTION TAGS] To edit, output ONLY ONE tag at the end:
<action>{"type": "UPDATE_SUB", "payload": {"id": ${selectedSub.id}, "changes": {"notes": "new note content", "stopped": true}}}</action>
<action>{"type": "TOGGLE_PAID", "payload": {"id": ${selectedSub.id}}}</action>
<action>{"type": "DELETE_SUB", "payload": {"id": ${selectedSub.id}}}</action>`;
            } else {
                selectionContext = `\n[ACTION RESTRICTION] No subscription is currently selected by the user. 
[STRICT RULE] If the user asks to update, edit, delete, mark as paid, or change ANY specific subscription, YOU MUST REFUSE professionally. 
Tell the user: "Please select a target subscription first by tapping it in the preview box so I can perform that update for you." 
DO NOT output any <action> tags if no sub is selected. This is a SAFETY LOCK.`;
            }

            subContext = `\n\n[SUBSCRIPTION DATA]
${grandTotalLine}
${selectionContext}
[CONVERSATION RULE] Be EXTREMELY concise. 1-2 sentences MAX. No filler. No "I see you want to...". Just confirm and DO.
[INTERFACE RULE] Wrap numeric IDs in <sub-preview>[ids]</sub-preview> at end of response.

Subscriptions: ${JSON.stringify(trimmedSubs)}]`;
        }

        // Call the secure Supabase Edge Function
        const { data, error } = await supabase.functions.invoke('chat-groq', {
            body: { userPrompt, subContext }
        });

        if (error) throw new Error(error.message || 'Failed to call Supabase AI function');
        if (data && data.error) throw new Error(data.error);

        return data.reply;

    } catch (error) {
        console.error('Supabase AI Service Error:', error);
        return `Sorry, I ran into an issue: ${error.message}`;
    }
}

export async function generateChatTitle(firstQuery) {
    try {
        const supabase = getSupabase();
        if (!supabase) return "New Chat";

        const titlePrompt = `Based on this user's question, generate a very short 2-4 word title for this chat. DO NOT USE QUOTES. ONLY OUTPUT THE TITLE TEXT.
Question: "${firstQuery}"`;

        const { data, error } = await supabase.functions.invoke('chat-groq', {
            body: { userPrompt: titlePrompt, subContext: " " } 
        });

        if (error || (data && data.error)) return "AI Chat";

        // Clean up quotes if the AI accidentally adds them
        return (data.reply || "AI Chat").replace(/["']/g, '').trim();
    } catch (e) {
        return "AI Chat";
    }
}
