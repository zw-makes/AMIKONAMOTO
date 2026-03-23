import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const API_KEY = Deno.env.get('VITE_GROQ_API_KEY') || Deno.env.get('GROQ_API_KEY');
    if (!API_KEY) throw new Error('Groq API Key missing in Edge Function secrets');

    const body = await req.json().catch(() => ({}));
    const { userPrompt, subContext } = body;

    if (!userPrompt) throw new Error('userPrompt is required');

    const systemPrompt = `You are SubTrack AI, a smart and friendly personal assistant built into the SubTrack app.
Be natural and conversational. For casual messages, respond warmly.
CRITICAL RULE: NEVER do your own currency conversions. Trust the app's numbers exactly as given.
Analyze subscriptions concisely. Today: ${new Date().toLocaleDateString()}.`;

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
          { role: 'user', content: userPrompt + (subContext || '') }
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
    const reply = data.choices[0].message.content;

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (e) {
    const error = e as Error;
    console.error('Edge Function Error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
