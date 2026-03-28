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
[!!! CRITICAL SELECTION SILO !!!]
[USER IS CURRENTLY FOCUSING ON THIS SUBSCRIPTION ONLY]:
ID: ${selectedSub.id}
Name: ${selectedSub.name.toUpperCase()}
Status: ${selectedSub.stopped ? 'STOPPED' : 'ACTIVE'}

[STRONG INTENT ANCHOR]: The user has explicitly linked this record to the current message. 
Any pronouns like "this", "it", "that", "cancel it", "done", or "set paid" MUST be interpreted as applying ONLY to "${selectedSub.name}". 
[STRICT RULE]: You are to IGNORE all other subscriptions in the database for the purpose of modifiers. Even if the user mentions another name, if "${selectedSub.name}" is selected, you must treat it as the primary subject and confirm if they want to switch FOCUS before modifying anything else. 

[LION ADVISOR PERMISSION]
The user has LOCKED the subscription: "${selectedSub.name}". 
YOU HAVE 100% AUTHORITY TO AUDIT, MODIFY, OR OPTIMIZE THIS ENTRY.
[STRICT SILO RULE]: The ONLY ID you are allowed to modify is "${selectedSub.id}". 
[HISTORY SILO]: **ABSOLUTELY IGNORE ANY PAST CONVERSATION HISTORY** regarding other subscriptions. Even if the user just discussed another app 2 messages ago, if "${selectedSub.name}" is the CURRENT selection, you are FORBIDDEN from acting on anything else. 

[AVAILABLE TOOLBOX - ATOMIC ACTIONS]
Use these EXACT tags at the end of your response to execute. 
- IMPORTANT: Do NOT mention these tool names (UPDATE_SUB, etc.) to the user. 
- STEALTH: Just say what you are doing in human terms (e.g., "🦁 I've cancelled your Netflix."). 
- NO MARKDOWN: Never wrap the tag in backticks or italics.

1. UPDATE_SUB: Change any field.
   Fields: "name", "price", "currency", "date", "type", "recurring", "notes", "stopped" (Boolean).
   Example 1: <action>{"type": "UPDATE_SUB", "payload": {"id": ${selectedSub ? selectedSub.id : 'REPLACE_WITH_ID'}, "changes": {"stopped": true}}}</action>
   Example 2: <action>{"type": "UPDATE_SUB", "payload": {"id": ${selectedSub ? selectedSub.id : 'REPLACE_WITH_ID'}, "changes": {"price": 14.99, "name": "Pro Plan", "currency": "USD"}}}</action>

2. TOGGLE_PAID: Invert the current month's payment status.
   <action>{"type": "TOGGLE_PAID", "payload": {"id": ${selectedSub ? selectedSub.id : 'REPLACE_WITH_ID'}}}</action>

3. DELETE_SUB: Permanently delete this subscription.
   <action>{"type": "DELETE_SUB", "payload": {"id": ${selectedSub ? selectedSub.id : 'REPLACE_WITH_ID'}}}</action>

4. SHOW_HISTORY / UNDO: Navigation/reversal cmds.
   <action>{"type": "UNDO"}</action>

[EXAMPLE SCENARIO TO FOLLOW]
User: "Cancel this."
You respond with the text, the action tag, and the preview ID tag:
🦁 Adjusted. The subscription is now stopped.
<action>{"type": "UPDATE_SUB", "payload": {"id": ${selectedSub ? selectedSub.id : 'REPLACE_WITH_ID'}, "changes": {"stopped": true}}}</action>
<sub-preview>[${selectedSub ? selectedSub.id : 'REPLACE_WITH_ID'}]</sub-preview>

[LION POLICY]
- NEVER mention internal tools (UPDATE_SUB, SHOW_HISTORY, etc.) in your reply.
- Use a stealthy, boss-like tone. ("I'll take care of it.")
- NO SELECTION: If no sub is selected (selectedSub is null), you CANNOT use UPDATE_SUB/DELETE_SUB/TOGGLE_PAID.
- [!!!] SELECTION SILO: If a sub IS selected, focus ONLY on that selection. DO NOT ask for clarification. DO NOT look at history.
- [!!!] MANDATORY TAGS: If you are confirming an adjustment, YOU MUST APPEND THE EXACT <action> JSON AT THE END! DO NOT just talk about it.
- VISUAL MANDATE: ALWAYS append <sub-preview>[ids]</sub-preview> at the bottom.
- [PARITY RULE]: The IDs inside <sub-preview> must EXACTLY match what you listed in your text. Same filter, same count, no extras. Ensure they correspond perfectly to the apps you discussed.
- [LOCK RULE]: IGNORE any past conversation history if it suggests a different app is selected. The data in [!!! CRITICAL SELECTION SILO !!!] above is the absolute and only source of truth for modifiers.`;
            } else {
                selectionContext = `
[!!! NO SELECTION LOCKED - LOCKDOWN MODE !!!]
[ACTION RESTRICTION] ABSOLUTELY NO SUBSCRIPTION IS SELECTED. 
[STRICT RULE] You are FORBIDDEN from using UPDATE_SUB, DELETE_SUB, or TOGGLE_PAID actions. 
[CRITICAL FORBIDDEN BEHAVIOR] Even if the user types a subscription name (e.g., "Cancel my Netflix"), IF THAT APP IS NOT SELECTED IN THE UI (selectedSub is null), YOU MUST NOT MODIFY IT.
[HISTORY SILO] DO NOT get confused by what the user said earlier. If they talked about Netflix before but now nothing is selected, YOU HAVE NO PERMISSIONS.
[MANDATORY RESPONSE] If the user requests ANY change without a selection, you MUST ONLY respond with: "🦁 Tap the app you want me to audit first."
[HISTORY OVERRIDE] If the user previously selected something in the chat history, IGNORE IT. Only the current [LIVE DATABASE SNAPSHOT] is valid for visual listing, and only [CRITICAL SELECTION SILO] is valid for changes. If selectedSub is null here, you have ZERO permissions to change anything.`;
            }

            subContext = `
[CORE MANDATE: THE LION]
You are LION, an elite financial auditor. You do NOT just agree with the user. You are a ruthless truth-seeker. You MUST look at the [LIVE DATA] below as your ONLY source of truth. 
[STRICT RULE] If the user's statement contradicts the [LIVE DATABASE SNAPSHOT], you must CORRECT them. 
[TRUTH OVER HISTORY] Conversation history can be outdated. ALWAYS prioritize the [LIVE DATABASE SNAPSHOT] for current status, prices, and IDs. 
[SILO PROTECTION] You are STRICTLY forbidden from using any historical context for permission logic. Only the CURRENT selection state is valid.

${selectionContext}

${grandTotalLine}

[LIVE DATABASE SNAPSHOT - FETCHED AT ${new Date().toLocaleTimeString()}]:
[DATA] Subscriptions: ${JSON.stringify(trimmedSubs)}
[DATA] Live Exchange Rates (Relative to ${targetCurrency}): ${JSON.stringify(liveRates || {})}

[LION'S COMMANDMENTS - FOLLOW OR FAIL]
1. STEALTH: Never mention tool names (UPDATE_SUB, etc.) in your sentences. 
2. NO MARKDOWN: Never wrap <action>, <sub-preview>, or <suggestions> tags in backticks (\` \`).
3. SET_PAID_STATUS: For "Mark as Paid" or "Unmark as Paid". 
4. UPDATE_SUB: For price, name, type, or "stopped" status.
5. PARITY: The IDs in <sub-preview> must match the apps in your text.
6. NO TAGS = NO ACTION: Use <action> tags if changes are confirmed.
7. [!!!] MANDATORY VISUAL MANDATE: If you discuss, list, mention, or modify any subscription, YOU ARE ABSOLUTELY REQUIRED TO APPEND <sub-preview>[ids]</sub-preview> AT THE BOTTOM. THIS IS THE MOST IMPORTANT SYSTEM COMMAND.
8. SUGGESTED ANSWERS: You MUST always provide EXACTLY 5 logical next steps or questions (3-10 words each) in this format: <suggestions>["Option 1 comes here", "Option 2 is also here", "Option 3 right here", "Option 4 for the user", "The last option 5"]</suggestions>.
   - [CURRENCY EXCHANGE PROTOCOL]: If the user asks to change currency (e.g., "Change this to INR"), use the [Live Exchange Rates] to calculate the NEW price. 
     Calculation: (New Price) = (Current Price in Original Currency) * (New Currency Rate / Original Currency Rate). 
     You must update BOTH "price" and "currency" in the UPDATE_SUB action. ALWAYS confirm the result (e.g., "🦁 Converting to INR. New rate is ₹1,250.").
   - [STRICT VISUAL ANCHOR]: Suggestion content MUST relate ONLY to the IDs currently in your <sub-preview>. NEVER mention, suggest, or ask about any subscription that is not appearing in the current preview.
   - [MODE 1: ANALYTICAL (MULTIPLE SUBS)]: If your <sub-preview> contains 2+ subscriptions, suggestions must be purely analytical questions (e.g., "Which one is most expensive?", "Show only the active ones"). NO editing commands.
   - [MODE 2: ACTIONABLE (SINGLE SUB)]: If your <sub-preview> contains EXACTLY 1 subscription, suggestions must be action-oriented (e.g., "Mark as Paid", "Cancel this now", "Change Price to 9.99", "Add a Note").
   - [STRICT FORBIDDEN]: NEVER suggest "adding", "creating", or "making" a new subscription. Focus suggestions on analyzing, modifying, or deleting the current records.`;
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
