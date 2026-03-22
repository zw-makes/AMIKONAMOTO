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

export async function askGroq(userPrompt, subscriptionData = []) {
    try {
        const supabase = getSupabase();
        if (!supabase) throw new Error('Supabase client not initialized');

        const needsContext = isSubscriptionRelated(userPrompt);

        let subContext = '';
        if (needsContext && subscriptionData.length > 0) {
            const report = window.lastReport;

            const trimmedSubs = subscriptionData.map(s => ({
                name: s.name,
                price: `${s.symbol || s.currency || ''}${s.price}`,
                type: s.type,
                billingDay: s.date,
                status: s.stopped ? 'stopped' : 'active',
                recurring: s.recurring || 'recurring'
            }));

            const grandTotalLine = report
                ? `[CRITICAL RULE] The app's pre-calculated Grand Total for the EXACT CURRENT VIEWED MONTH is: ${report.symbol}${report.total.toFixed(2)} ${report.currency}. You MUST use this exact number if asked about the current total.`
                : '[CRITICAL RULE] No grand total data is currently available.';

            subContext = `\n\n[SUBSCRIPTION DATA - DO NOT create your own totals or math.]
${grandTotalLine}
If the user asks for the grand total or cost of ANY past or future month, YOU MUST REFUSE TO CALCULATE IT. 
Instead, exactly say: "I only have access to the math for the month you are currently viewing. Please use the calendar arrows at the top of the app to go to that month, and then ask me again!"

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
