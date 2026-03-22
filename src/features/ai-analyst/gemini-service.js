/**
 * Groq AI Service for SubTrack
 * Uses Groq's Llama 3.3 70B - Natural conversations + real app data
 */
const API_KEY = import.meta.env.VITE_GROQ_API_KEY;

// Keywords that suggest the user is asking about their subscriptions
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
        if (!API_KEY) throw new Error('VITE_GROQ_API_KEY is missing from .env');

        // Only include subscription data if the query seems subscription-related
        const needsContext = isSubscriptionRelated(userPrompt);

        let subContext = '';
        if (needsContext && subscriptionData.length > 0) {
            // Use the app's already-calculated stats (exchange rates already applied)
            const report = window.lastReport; // Set by the app's updateStats()

            const trimmedSubs = subscriptionData.map(s => ({
                name: s.name,
                // Show each price in its original currency (don't re-convert)
                price: `${s.symbol || s.currency || ''}${s.price}`,
                type: s.type,
                billingDay: s.date,
                status: s.stopped ? 'stopped' : 'active',
                recurring: s.recurring || 'recurring'
            }));

            const grandTotalLine = report
                ? `The app already calculated the grand total for this month as: ${report.symbol}${report.total.toFixed(2)} ${report.currency}. Use this exact number.`
                : 'No grand total available yet.';

            subContext = `\n\n[SUBSCRIPTION DATA - Do NOT do your own currency conversions. Use prices as-is.]
${grandTotalLine}
All subscriptions (${subscriptionData.length} total):
${JSON.stringify(trimmedSubs)}
]`;
        }

        const systemPrompt = `You are SubTrack AI, a smart and friendly personal assistant built into the SubTrack app — a subscription manager.
Be natural and conversational, like ChatGPT. For casual messages like "hi", just respond warmly and briefly.
CRITICAL RULE: When subscription data is provided, NEVER do your own currency conversions or exchange rate math. 
Always trust and use the pre-calculated grand total from the app. Report prices exactly as given.
When analyzing subscriptions, be concise and insightful. Today: ${new Date().toLocaleDateString()}.`;

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt + subContext }
                ],
                temperature: 0.7,
                max_tokens: 600
            })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err?.error?.message || `Groq API error (HTTP ${response.status})`);
        }

        const data = await response.json();
        return data.choices[0].message.content;

    } catch (error) {
        console.error('Groq Service Error:', error);
        return `Sorry, I ran into an issue: ${error.message}`;
    }
}
