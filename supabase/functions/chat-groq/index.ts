import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { userPrompt, subContext } = body;

    console.log("Edge Function invoked with prompt:", userPrompt?.substring(0, 50));

    // Support both naming conventions
    const API_KEY = Deno.env.get('VITE_GROQ_API_KEY') || Deno.env.get('GROQ_API_KEY');
    
    if (!API_KEY) {
      console.error("CRITICAL: Groq API Key is MISSING in Supabase Secrets.");
      return new Response(JSON.stringify({ error: "Groq API Key missing in Edge Function secrets." }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200, // Return 200 so the client can read the JSON error
      });
    }

    if (!userPrompt) {
      return new Response(JSON.stringify({ error: "userPrompt is required." }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const systemPrompt = `You are SubTrack AI, a smart and friendly personal assistant built into the SubTrack app.
Analyze subscriptions concisely. Today: ${new Date().toLocaleDateString()}.`;

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
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
        max_tokens: 1024
      })
    });

    if (!groqResponse.ok) {
      const errBody = await groqResponse.json().catch(() => ({}));
      const msg = errBody?.error?.message || `Groq API error (HTTP ${groqResponse.status})`;
      console.error("Groq API Error:", msg);
      return new Response(JSON.stringify({ error: msg }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const data = await groqResponse.json();
    const reply = data.choices[0].message.content;

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (e) {
    const error = e as Error;
    console.error('Edge Function Fatal Error:', error.message);
    return new Response(JSON.stringify({ error: `Edge Function Fatal: ${error.message}` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200, 
    });
  }
});
