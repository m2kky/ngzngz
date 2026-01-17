import "https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const openAiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openAiKey) {
      console.error('OPENAI_API_KEY is not set')
      return new Response(
        JSON.stringify({ error: 'Missing OPENAI_API_KEY environment variable. Please set it in your Supabase project.' }),
        { 
          status: 503, // Service Unavailable
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const { product, audience, audienceDetails, targetMarket, tone } = await req.json()

    const prompt = `
    Act as a world-class Marketing Strategist. Create a comprehensive SOSTAC® marketing strategy for the following product:
    
    Product/Service: ${product}
    Target Audience: ${audience}
    Target Market: ${targetMarket}
    Tone of Voice: ${tone}
    
    Additional Audience Details:
    - Demographics: ${audienceDetails.demographics || 'N/A'}
    - Pain Points: ${audienceDetails.painPoints || 'N/A'}
    - Desires: ${audienceDetails.desires || 'N/A'}
    - Current Situation: ${audienceDetails.currentSituation || 'N/A'}
    
    Output the result as a strictly valid JSON object with the following structure (do not include markdown formatting or explanations, just the JSON):
    
    {
      "market_overview": "Detailed analysis of the market...",
      "competitors": "Analysis of potential competitors...",
      "swot": {
        "strengths": "List of strengths...",
        "weaknesses": "List of weaknesses...",
        "opportunities": "List of opportunities...",
        "threats": "List of threats..."
      },
      "business_goals": "Primary business objectives...",
      "marketing_goals": "SMART marketing goals...",
      "kpis": "Key Performance Indicators...",
      "target_audience_summary": "Detailed persona summary...",
      "positioning": "Brand positioning statement...",
      "key_messages": "Core brand messages...",
      "channels": "Recommended marketing channels...",
      "content_plan": "Content strategy and types...",
      "budget": "Estimated budget allocation strategy...",
      "timeline": "Phased rollout timeline...",
      "responsibilities": "Team roles required...",
      "metrics": "Success metrics...",
      "reporting_schedule": "How and when to report..."
    }
    `

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a marketing strategy expert. Output only valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenAI API Error:', errorText)
      throw new Error(`OpenAI API Error: ${response.statusText}`)
    }

    const data = await response.json()
    const content = data.choices[0].message.content
    
    // Parse JSON from content (handle potential markdown code blocks)
    const jsonStr = content.replace(/```json\n?|\n?```/g, '').trim()
    const strategy = JSON.parse(jsonStr)

    return new Response(JSON.stringify({ strategy }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
