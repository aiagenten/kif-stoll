// OpenAI SEO Generation Service
// Can be used client-side with API proxy or server-side

// Business context for AI generation - exported for edge function use
export const BUSINESS_CONTEXT = `
STOLL Esportsenter er Kongsbergs fremste arena for gaming og esport.
Beliggenhet: Kongsberg, Norge
E-post: info@stoll.gg

Tjenester:
1. Gaming-lokaler: Høyytelse PC-setup med topp utstyr for alle spillere
2. Turneringer: Lokale, regionale og nasjonale esport-mesterskap
3. Treninger: Coaching, scrims og lag-trening
4. Bursdager & arrangementer: Skreddersydde gaming-opplevelser
5. Sponsorpakker: Synlighet og partnerskap med Kongsbergs esportmiljø

Åpningstider: Se stoll.gg for oppdaterte tider

Viktige salgsargumenter:
- Toppmoderne utstyr og infrastruktur
- Profesjonelt og engasjert personale
- Aktivt fellesskap av gamere og esportutøvere
- Fleksible pakker for privatpersoner, lag og bedrifter
- Norges ledende esportarena
`

export const PAGE_CONTEXTS: Record<string, string> = {
  home: 'Forsiden som presenterer STOLL Esportsenter med alle tjenester.',
  events: 'Turneringer, treninger og arrangementer ved STOLL Esportsenter.',
  pakker: 'Gaming-pakker og priser for enkeltspillere, lag og bedrifter.',
  sponsorer: 'Sponsormuligheter og partnerskap med STOLL Esportsenter.'
}

interface GenerateOptions {
  pageKey: string
  type: 'all' | 'meta' | 'faq' | 'structured'
}

interface SEOGenerationResult {
  meta_title?: string
  meta_description?: string
  keywords?: string[]
  faq_schema?: Array<{ question: string; answer: string }>
  structured_data?: Record<string, unknown>
}

// Check if we have a Supabase Edge Function available
async function callEdgeFunction(options: GenerateOptions): Promise<SEOGenerationResult> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  
  const response = await fetch(`${supabaseUrl}/functions/v1/seo-generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
    },
    body: JSON.stringify(options)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Edge function call failed')
  }

  const result = await response.json()
  return result.data
}

// Fallback: Generate locally using templates
function generateLocalFallback(options: GenerateOptions): SEOGenerationResult {
  const { pageKey, type } = options
  const result: SEOGenerationResult = {}

  const titles: Record<string, string> = {
    home: 'STOLL Esportsenter | Kongsbergs Beste Gaming- og Esportsenter',
    events: 'Events & Turneringer Kongsberg | STOLL Esportsenter',
    pakker: 'Gaming-pakker & Priser | STOLL Esportsenter',
    sponsorer: 'Bli Sponsor | STOLL Esportsenter Kongsberg'
  }

  const descriptions: Record<string, string> = {
    home: 'STOLL Esportsenter er Kongsbergs fremste arena for gaming og esport. Toppmoderne utstyr, turneringer og fellesskap for alle gamere.',
    events: 'Se kommende turneringer, treninger og arrangementer ved STOLL Esportsenter i Kongsberg. Book plass og bli med!',
    pakker: 'Fleksible gaming-pakker for enkeltspillere, lag og bedrifter. Finn riktig pakke for din opplevelse hos STOLL.',
    sponsorer: 'Bli synlig i Kongsbergs esportmiljø. Partnerskap og sponsormuligheter med STOLL Esportsenter.'
  }

  const keywordSets: Record<string, string[]> = {
    home: ['esportsenter kongsberg', 'gaming kongsberg', 'esport kongsberg', 'stoll esportsenter', 'gaming lokale kongsberg', 'esport arena norge'],
    events: ['esport turnering kongsberg', 'gaming event kongsberg', 'cs2 turnering', 'lol turnering kongsberg', 'esport arrangement'],
    pakker: ['gaming pakke kongsberg', 'esport pakke', 'gaming leie kongsberg', 'pc gaming kongsberg'],
    sponsorer: ['esport sponsor kongsberg', 'gaming sponsor norge', 'esport markedsføring']
  }

  const faqs: Record<string, Array<{ question: string; answer: string }>> = {
    home: [
      { question: 'Hva er STOLL Esportsenter?', answer: 'STOLL Esportsenter er Kongsbergs fremste arena for gaming og esport, med toppmoderne utstyr og et aktivt fellesskap.' },
      { question: 'Hva tilbyr dere?', answer: 'Vi tilbyr gaming-lokaler, turneringer, treninger, bursdager og skreddersydde bedriftsarrangementer.' },
      { question: 'Kan jeg booke lokaler?', answer: 'Ja! Ta kontakt via nettsiden eller e-post for å booke tid hos oss.' }
    ],
    events: [
      { question: 'Hvilke spill spilles i turneringene?', answer: 'Vi arrangerer turneringer i CS2, League of Legends, Valorant, FIFA og mange flere titler.' },
      { question: 'Kan hvem som helst delta?', answer: 'Ja, vi har turneringer for alle nivåer – fra nybegynnere til erfarne spillere.' },
      { question: 'Hvordan melder jeg meg på?', answer: 'Bruk booking-funksjonen på nettsiden vår for å melde deg på kommende events.' }
    ],
    pakker: [
      { question: 'Hva inkluderer en gaming-pakke?', answer: 'Pakkene inkluderer tilgang til toppmoderne PC-er, headset og alt utstyr du trenger.' },
      { question: 'Tilbyr dere bedriftspakker?', answer: 'Ja, vi har skreddersydde pakker for bedriftsarrangementer og teambuilding.' },
      { question: 'Kan jeg leie for en gruppe?', answer: 'Absolutt! Vi har plasser for grupper av alle størrelser. Kontakt oss for tilbud.' }
    ],
    sponsorer: [
      { question: 'Hvem kan bli sponsor?', answer: 'Alle bedrifter som ønsker synlighet i Kongsbergs esport- og gamingmiljø kan bli partner.' },
      { question: 'Hva får jeg som sponsor?', answer: 'Logoeksponering, sosiale medier-omtale, turnerings-branding og mer avhengig av pakke.' },
      { question: 'Hvordan tar jeg kontakt?', answer: 'Send e-post til info@stoll.gg for en uforpliktende prat om sponsormuligheter.' }
    ]
  }

  if (type === 'meta' || type === 'all') {
    result.meta_title = titles[pageKey] || titles.home
    result.meta_description = descriptions[pageKey] || descriptions.home
    result.keywords = keywordSets[pageKey] || keywordSets.home
  }

  if (type === 'faq' || type === 'all') {
    result.faq_schema = faqs[pageKey] || faqs.home
  }

  if (type === 'structured' || type === 'all') {
    result.structured_data = {
      "@context": "https://schema.org",
      "@type": "SportsActivityLocation",
      "name": "STOLL Esportsenter",
      "description": "Kongsbergs fremste arena for gaming og esport",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Kongsberg",
        "addressCountry": "NO"
      },
      "url": "https://stoll.gg"
    }
  }

  return result
}

// Main function to generate SEO content
export async function generateSEO(options: GenerateOptions): Promise<SEOGenerationResult> {
  try {
    // Try Edge Function first
    return await callEdgeFunction(options)
  } catch (error) {
    console.warn('Edge function failed, using local fallback:', error)
    // Fall back to local templates
    return generateLocalFallback(options)
  }
}

// Generate SEO for all pages at once
export async function generateAllPagesSEO(): Promise<Record<string, SEOGenerationResult>> {
  const pages = ['home', 'events', 'pakker', 'sponsorer']
  const results: Record<string, SEOGenerationResult> = {}

  for (const pageKey of pages) {
    try {
      results[pageKey] = await generateSEO({ pageKey, type: 'all' })
    } catch (error) {
      console.error(`Failed to generate SEO for ${pageKey}:`, error)
      results[pageKey] = generateLocalFallback({ pageKey, type: 'all' })
    }
  }

  return results
}
