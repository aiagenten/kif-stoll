import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const STOLL_CONTEXT = `
STOLL Esportsenter er Kongsbergs fremste arena for gaming og esport.
Del av Kongsberg Idrettsforening (KIF). Holder til i den gamle kinoen i Kongsberg sentrum.
Beliggenhet: Kongsberg sentrum, 3616 Kongsberg
E-post: info@stoll.gg
Nettside: stoll.gg

Tjenester:
1. Gaming-fasiliteter: Toppmoderne PCer, konsoller og VR-utstyr
2. Turneringer: CS2, League of Legends, Valorant, Rocket League, FIFA
3. Medlemskap: Daglig, ukentlig og månedlig tilgang
4. Coaching: Profesjonell esport-trening
5. Events: Bedriftsarrangementer, bursdager, LAN-parties
6. Sponsorpakker: Synlighet i Kongsbergs esportmiljø

Åpningstider: Se stoll.gg for oppdaterte tider
`

const PAGE_CONTEXTS: Record<string, string> = {
  home: 'Forsiden som presenterer STOLL Esportsenter med alle tjenester.',
  events: 'Events og turneringer ved STOLL Esportsenter.',
  pakker: 'Medlemspakker og priser for gaming ved STOLL.',
  sponsorer: 'Sponsormuligheter og partnere ved STOLL Esportsenter.'
}

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { pageKey, currentMeta } = await req.json()
    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiKey) throw new Error('Missing OPENAI_API_KEY')

    const pageContext = PAGE_CONTEXTS[pageKey] || 'En side på STOLL Esportsenter.'
    let systemPrompt = `Du er en SEO-ekspert som skriver for norske bedrifter. Svar alltid på norsk. Vær konkret og bruk lokale søkeord for Kongsberg-området.`

    const userPrompt = `
Generer SEO-metadata for denne siden:
Side: ${pageKey}
Kontekst: ${pageContext}
Bedriftsinfo: ${STOLL_CONTEXT}
${currentMeta ? `Nåværende metadata: ${JSON.stringify(currentMeta)}` : ''}

Returner JSON med disse feltene:
1. meta_title: Maks 60 tegn, inkluder hovednøkkelord og "Kongsberg"
2. meta_description: Maks 160 tegn, overbevisende med CTA
3. og_title: Optimalisert for sosiale medier
4. og_description: Kort og engasjerende for deling
5. keywords: Kommaseparerte søkeord (8-12 stk)
6. structured_data: Schema.org JSON-LD

Svar KUN med gyldig JSON, ingen annen tekst.`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${openaiKey}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
        temperature: 0.7,
        response_format: { type: 'json_object' }
      })
    })
    const result = await response.json()
    const seoData = JSON.parse(result.choices[0].message.content)
    return new Response(JSON.stringify(seoData), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders })
  }
})
