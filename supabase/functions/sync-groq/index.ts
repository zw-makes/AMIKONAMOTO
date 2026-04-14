import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function callGroq(apiKey: string, model: string, messages: unknown[], systemPrompt?: string) {
  const body: Record<string, unknown> = {
    model,
    messages,
    temperature: 0,
    max_tokens: 2048,
  };

  // Only prepend system if it's NOT a vision model
  if (systemPrompt && !model.includes('vision')) {
    body.messages = [{ role: 'system', content: systemPrompt }, ...messages];
  }

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  return { res, data };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const json = (payload: unknown, status = 200) =>
    new Response(JSON.stringify(payload), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  try {
    const body = await req.json().catch(() => ({}));
    const { userPrompt, systemPrompt, image, mimeType } = body;

    const keyPool = [
      Deno.env.get('VITE_GROQ_API_KEY'),
      Deno.env.get('GROQ_API_KEY'),
      Deno.env.get('GROQ_API_KEY_K8'),
    ].filter((k): k is string => !!k);

    if (keyPool.length === 0) return json({ error: "No API keys found on server." });

    const instructions = "Extract subscriptions into a JSON array of objects. Return raw JSON array only.";
    
    // Shuffle keys
    const shuffled = [...keyPool].sort(() => Math.random() - 0.5);

    for (const key of shuffled) {
      // Logic: If image, try Vision. If it fails (400), we'll try the larger vision model next.
      const modelsToTry = image 
        ? ['meta-llama/llama-4-scout-17b-16e-instruct', 'meta-llama/llama-4-maverick-17b-128e-instruct']
        : ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'];

      let lastError = '';

      for (const model of modelsToTry) {
        const messages: any[] = image ? [
          {
            role: 'user',
            content: [
              { type: 'image_url', image_url: { url: `data:${mimeType || 'image/jpeg'};base64,${image}` } },
              { type: 'text', text: instructions }
            ]
          }
        ] : [
          { role: 'user', content: `${instructions}\n\nContent: ${userPrompt}` }
        ];

        const { res, data } = await callGroq(key, model, messages, systemPrompt);

        if (res.ok) {
          const reply = data.choices?.[0]?.message?.content || '[]';
          return json({ reply });
        }

        lastError = data.error?.message || `HTTP ${res.status}`;
        console.error(`[Groq Error] Model: ${model}, Status: ${res.status}, Error: ${lastError}`);
        
        // If it's a 400, model might be wrong/unavailable - try the NEXT model for THIS key
        if (res.status === 400) continue;
        
        // If it's 401/403/429, try the NEXT KEY
        if (res.status === 401 || res.status === 403 || res.status === 429) break;
      }
      
      // If we finished both models for this key and still failed, continue to next key
    }

    return json({ error: "SCAN_FAILED", details: "All keys and model combinations exhausted." });

  } catch (error) {
    return json({ error: `SERVER_CRASH: ${error.message}` });
  }
})