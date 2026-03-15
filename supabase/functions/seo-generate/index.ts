import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GenerateRequest {
  pageKey: string
  type: 'all' | 'meta' | 'faq' | 'structured'
  currentData?: Record<string, unknown>
}

const BUSINESS_CONTEXT = `
DD Auto Center er et profesjonelt bilverksted, bilpleiesenter og bruktbilforhandler i Bergen, Norge.
Beliggenhet: Ulsmågvegen 12, 5224 Nesttun
Telefon: 400 80 071
E-post: info@ddautocenter.no

Tjenester:
1. Verksted: EU-kontroll, service, reparasjoner, diagnostikk for alle bilmerker
2. Bilpleie: Keramisk belegg, polering, lakkforsegling, innvendig rens
3. Bilsalg: Kjøp og salg av kvalitets bruktbiler

Åpningstider: Man-Fre 08:00-16:00

Viktige salgsargumenter:
- Erfarne teknikere med mange års kompetanse
- Kvalitetssikret arbeid
- Mobilitetsgaranti inkludert ved service (veihjelp, leiebil i hele Europa)
- Personlig service og god kundebehandling
- Konkurransedyktige priser
`

const PAGE_CONTEXTS: Record<string, string> = {
  home: 'Forsiden som presenterer hele DD Auto Center med alle tjenester.',
  verksted: 'Verkstedtjenester: EU-kontroll, service, reparasjoner, diagnostikk.',
  bilpleie: 'Profesjonell bilpleie med keramisk belegg, polering og lakkforsegling.',
  bilsalg: 'Bruktbilsalg og innbytte av biler.'
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
    
    if (!OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ 
          error: 'OPENAI_API_KEY ikke konfigurert',
          message: 'Legg til OPENAI_API_KEY i Supabase Edge Function secrets'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const { pageKey, type, currentData } = await req.json() as GenerateRequest

    const pageContext = PAGE_CONTEXTS[pageKey] || 'Generell side'
    
    let prompt = ''
    let systemPrompt = `Du er en SEO-ekspert som skriver for norske bedrifter. Svar alltid på norsk. Vær konkret og bruk lokale søkeord for Bergen-området.`

    if (type === 'meta' || type === 'all') {
      prompt += `
Lag optimale meta tags for denne siden:
Side: ${pageKey} - ${pageContext}

${BUSINESS_CONTEXT}

Generer:
1. meta_title: Maks 60 tegn, inkluder hovednøkkelord og "Bergen" eller "Nesttun"
2. meta_description: Maks 160 tegn, call-to-action, inkluder telefonnummer eller oppfordring
3. keywords: 5-8 relevante søkeord som array

Svar i JSON-format:
{
  "meta_title": "...",
  "meta_description": "...",
  "keywords": ["...", "..."]
}
`
    }

    if (type === 'faq' || type === 'all') {
      prompt += `
Lag FAQ-schema for voice search og "People Also Ask":
Side: ${pageKey} - ${pageContext}

${BUSINESS_CONTEXT}

Generer 5-6 vanlige spørsmål kunder stiller, med korte, konsise svar (maks 2-3 setninger per svar).
Fokuser på:
- Lokale søk ("hvor ligger", "åpningstider")
- Praktiske spørsmål ("hvor lang tid tar", "hva koster")
- Sammenligning ("forskjellen mellom")

Svar i JSON-format:
{
  "faq_schema": [
    {"question": "...", "answer": "..."},
    ...
  ]
}
`
    }

    if (type === 'structured' || type === 'all') {
      const schemaType = pageKey === 'bilsalg' ? 'AutoDealer' : pageKey === 'verksted' ? 'AutoRepair' : 'LocalBusiness'
      
      prompt += `
Lag Schema.org structured data (JSON-LD) for:
Side: ${pageKey} - ${pageContext}
Schema type: ${schemaType}

${BUSINESS_CONTEXT}

Generer komplett, gyldig JSON-LD med alle relevante felt.
Inkluder: address, telephone, openingHours, geo, areaServed, hasOfferCatalog (for tjenester).

Svar i JSON-format:
{
  "structured_data": { "@context": "https://schema.org", ... }
}
`
    }

    // Call OpenAI
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' }
      })
    })

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text()
      throw new Error(`OpenAI API error: ${error}`)
    }

    const openaiData = await openaiResponse.json()
    const generatedContent = JSON.parse(openaiData.choices[0].message.content)

    return new Response(
      JSON.stringify({ 
        success: true,
        data: generatedContent,
        pageKey,
        type
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Generering feilet',
        details: String(error)
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
