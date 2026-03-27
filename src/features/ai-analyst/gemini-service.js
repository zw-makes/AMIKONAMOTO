/**
 * Supabase AI Service for SubTrack
 * Safely calls Groq's Llama 3.3 70B through a Supabase Edge Function to avoid leaking keys.
 */

// Import the global supabase client
// Assuming supabase is initialized globally in main.js
const getSupabase = () => window.supabase;

export async function askGroq(userPrompt, subscriptionData = [], selectedSub = null, conversationMemory = []) {
    try {
        const supabase = getSupabase();
        if (!supabase) throw new Error('Supabase client not initialized');

        let subContext = '';

        if (subscriptionData && subscriptionData.length > 0) {
            const liveRates = window.lastReport?.rates || null;
            const targetCurrency = window.lastReport?.currency || 'USD';
            const targetSymbol = window.lastReport?.symbol || '$';

            const trimmedSubs = subscriptionData.map(s => {
                const isPaid = window.isSubPaid ? window.isSubPaid(s, window.currentDate || new Date()) : false;
                
                // Calculate if ended
                const { end } = window.calculateSubTimeline ? window.calculateSubTimeline(s) : { end: 'N/A' };
                const todayStr = new Date().toISOString().split('T')[0];
                const isEnded = end !== 'N/A' && todayStr > end;
                
                let subStatus = s.stopped ? 'stopped' : 'active';
                if (isEnded && subStatus === 'active') subStatus = 'ended';

                // Pre-compute the live converted price using the app's own exchange engine
                let convertedPrice = s.price;
                const originalCurrency = s.currency || 'USD';
                if (liveRates && window.getConvertedPrice && originalCurrency !== targetCurrency) {
                    convertedPrice = window.getConvertedPrice(s.price, originalCurrency, targetCurrency, liveRates);
                }

                return {
                    id: s.id,
                    name: s.name,
                    originalPrice: s.price,
                    originalCurrency: originalCurrency,
                    originalSymbol: s.symbol || '$',
                    convertedPrice: parseFloat(convertedPrice.toFixed(2)),
                    convertedCurrency: targetCurrency,
                    convertedSymbol: targetSymbol,
                    type: s.type,
                    billingDay: s.date,
                    status: subStatus,
                    periodStart: s.startDate,
                    periodEnd: end,
                    paymentStatus: isPaid ? 'PAID' : 'UNPAID',
                    recurring: s.recurring || 'recurring'
                };
            });

            const viewDate = window.currentDate || new Date();
            const viewMonth = viewDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });

            const currentReport = window.lastReport;

            // --- Lion Audit Eyes: Patterns & Anomalies ---
            const expensiveApps = [...subscriptionData].sort((a, b) => b.price - a.price).slice(0, 3);
            const trials = subscriptionData.filter(s => s.type === 'trial' && !s.stopped);
            
            // Basic duplicate detection (Music, Streaming, Cloud Storage)
            const categories = {
                music: ['spotify', 'apple', 'amazon', 'youtube'],
                streaming: ['netflix', 'hulu', 'disney', 'max', 'paramount', 'prime'],
                design: ['adobe', 'figma', 'canva']
            };
            let duplicates = [];
            Object.values(categories).forEach(cat => {
                const found = subscriptionData.filter(s => cat.some(word => s.name.toLowerCase().includes(word)));
                if (found.length > 1) {
                    duplicates.push(`${found.map(s => s.name).join(' AND ')} (Potential Duplication)`);
                }
            });

            // --- 3-MONTH CASH FLOW AUDIT (UI-SYNCHRONIZED) ---
            const computeMonthReport = (date) => {
                const active = subscriptionData.filter(s => !s.stopped && window.isSubRelevantToMonth && window.isSubRelevantToMonth(s, date));
                let total = 0;
                let contributingIds = [];
                const rates = currentReport?.rates;
                const targetCurrency = currentReport?.currency || 'USD';
                
                active.forEach(s => {
                    let price = s.price;
                    if (rates && window.getConvertedPrice) {
                        price = window.getConvertedPrice(price, s.currency || 'USD', targetCurrency, rates);
                    }
                    
                    const { start: sD, end: eD } = window.getSubDates ? window.getSubDates(s) : { start: new Date(s.startDate), end: null };
                    const vStart = new Date(date.getFullYear(), date.getMonth(), 1);
                    const isMultiTrial = s.type === 'trial' && parseInt(s.trialMonths) > 0;
                    
                    let skip = false;
                    if (sD < vStart && eD && s.type !== 'yearly' && !isMultiTrial) skip = true;
                    if (s.type === 'yearly' && date.getMonth() !== sD.getMonth()) skip = true;
                    if (isMultiTrial) skip = true;
                    
                    if (!skip) {
                        total += price;
                        contributingIds.push(s.name); // Using names for AI clarity
                    }
                });
                return { total, subs: contributingIds };
            };

            const prevMonthDate = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
            const nextMonthDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
            
            const prevRep = computeMonthReport(prevMonthDate);
            const nextRep = computeMonthReport(nextMonthDate);
            const currentTotal = currentReport ? currentReport.total : computeMonthReport(viewDate).total;
            const currentSubs = currentReport ? currentReport.activeSubs.map(s => s.name) : computeMonthReport(viewDate).subs;
            
            const symbol = currentReport?.symbol || '$';
            const currency = currentReport?.currency || 'USD';

            const auditSummary = `
[FINANCIAL AUDIT SUMMARY - PROACTIVE LION EYES]
- Top 3 Spenders: ${expensiveApps.map(s => `${s.name} (${s.symbol}${s.price})`).join(', ')}
- Upcoming Trials to Guard: ${trials.length > 0 ? trials.map(s => s.name).join(', ') : 'None'}
- Pattern Anomalies: ${duplicates.length > 0 ? duplicates.join(', ') : 'None'}`;

            const grandTotalLine = `
[CASH FLOW TIMELINE - 3 MONTH AUDIT (UI-VERIFIED)]
- PREVIOUS (${prevMonthDate.toLocaleString('en-US', { month: 'short' })}): ${symbol}${prevRep.total.toFixed(2)} ${currency}. [Contributing: ${prevRep.subs.join(', ') || 'None'}]
- CURRENT (${viewMonth}): ${symbol}${currentTotal.toFixed(2)} ${currency}. [Contributing: ${currentSubs.join(', ') || 'None'}]
- NEXT (${nextMonthDate.toLocaleString('en-US', { month: 'short' })}): ${symbol}${nextRep.total.toFixed(2)} ${currency}. [Contributing: ${nextRep.subs.join(', ') || 'None'}]

[CURRENCY ORACLE - LIVE RATES INJECTED]
Base display currency: ${currency} (${symbol})
All subscriptions below already have a pre-computed "convertedPrice" and "convertedSymbol" field.
These conversions were done LIVE by the app's exchange rate engine at the time of this query.
⚠️ CRITICAL MANDATE: You are ABSOLUTELY FORBIDDEN from doing your own currency conversion math.
  - NEVER say "approximately X" by converting from training data.
  - NEVER use your own knowledge of exchange rates.
  - ALWAYS use the "convertedPrice" + "convertedSymbol" field from each subscription object.
  - If a subscription's originalCurrency equals convertedCurrency, display originalPrice with originalSymbol.
  - Otherwise, ALWAYS display convertedPrice with convertedSymbol as the primary amount.
${auditSummary}`;

            let selectionContext = '';
            if (selectedSub) {
                selectionContext = `
[!!! CRITICAL SELECTION !!!]
[USER IS CURRENTLY FOCUSING ON THIS SUBSCRIPTION]:
ID: ${selectedSub.id}
Name: ${selectedSub.name.toUpperCase()}
Status: ${selectedSub.stopped ? 'STOPPED' : 'ACTIVE'}

(IF USER SAYS 'THIS' OR 'THESE', THEY MEAN THE ABOVE RECORD)

[LION ADVISOR PERMISSION]
The user has LOCKED the subscription: "${selectedSub.name}". 
YOU HAVE 100% AUTHORITY TO AUDIT, MODIFY, OR OPTIMIZE THIS ENTRY.

[AVAILABLE TOOLBOX - ATOMIC ACTIONS]
Use these EXACT tags at the end of your response to execute. 
- IMPORTANT: Do NOT mention these tool names (UPDATE_SUB, etc.) to the user. 
- STEALTH: Just say what you are doing in human terms (e.g., "🦁 I've cancelled your Netflix."). 
- NO MARKDOWN: Never wrap the tag in backticks or italics.

1. UPDATE_SUB: Change any field.
   Fields: "name", "price", "currency", "date", "type", "recurring", "notes", "stopped" (Boolean).
   <action>{"type": "UPDATE_SUB", "payload": {"id": ${selectedSub ? selectedSub.id : 'REPLACE_WITH_ID'}, "changes": {"stopped": true}}}</action>

... (other tools) ...

[LION POLICY]
- NEVER mention internal tools (UPDATE_SUB, SHOW_HISTORY, etc.) in your reply.
- Use a stealthy, boss-like tone. ("I'll take care of it.")
- NO SELECTION: If no sub is selected (selectedSub is null), you CANNOT use UPDATE_SUB/DELETE_SUB/TOGGLE_PAID.
- [!!!] SELECTION OVERRIDE: If a sub IS selected, ignore any grammar confusion (like 'this ones') and FOCUS ONLY on the selection. DO NOT ask for clarification if an ID is locked in your context.
- VISUAL MANDATE: ALWAYS append <sub-preview>[ids]</sub-preview> at the bottom.
- [PARITY RULE]: Ensure the IDs in your <sub-preview> match EXACTLY the apps you named in your text. DO NOT show a preview of apps you are not talking about.`;
            } else {
                selectionContext = `
[ACTION RESTRICTION] No subscription is currently selected. 
[LION STRATEGY] Analyze the user's spending habits globally. Offer insights on totals, spikes, or duplications.
[STRICT RULE] If the user wants to Edit/Delete/Toggle a specific app, tell them: "🦁 Tap the app you want me to audit first."`;
            }

            subContext = `

[CORE MANDATE: THE LION]
You are a proactive, elite financial advisor. You don't just answer—you SOLVE.
${grandTotalLine}
${selectionContext}

[INTERFACE RULE] Wrap numeric IDs in <sub-preview>[ids]</sub-preview> at bottom to show relevant app icons.
[DATA] Subscriptions: ${JSON.stringify(trimmedSubs)}]`;
        } else {
            subContext = `\n\n[SUBSCRIPTION DATA]
The user currently has NO DATA AVAILABLE or 0 subscriptions. If the user asks about their spending, tell them they need to track some subscriptions first.`;
        }

        // Call the secure Supabase Edge Function with separated prompt and context
        const { data, error } = await supabase.functions.invoke('chat-groq', {
            body: { userPrompt, subContext, chatHistory: conversationMemory }
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

        // Clean up quotes and XML tags if the AI accidentally adds them
        return (data.reply || "AI Chat")
            .replace(/<.*?>/gs, '') // STRIP XML TAGS
            .replace(/["']/g, '')   // STRIP QUOTES
            .trim();
    } catch (e) {
        return "AI Chat";
    }
}
