import { supabase } from './supabase'

// SEO Settings interface
export interface SEOSettings {
  id?: string
  page_key: string
  meta_title: string | null
  meta_description: string | null
  og_image: string | null
  structured_data: Record<string, unknown> | null
  faq_schema: Array<{ question: string; answer: string }> | null
  keywords: string[] | null
  canonical_url: string | null
  updated_at?: string
}

// Fetch SEO settings for a specific page
export async function getSEOSettings(pageKey: string): Promise<SEOSettings | null> {
  const { data, error } = await supabase
    .from('seo_settings')
    .select('*')
    .eq('page_key', pageKey)
    .single()

  if (error) {
    console.error('Error fetching SEO settings:', error)
    return null
  }

  return data
}

// Fetch all SEO settings
export async function getAllSEOSettings(): Promise<SEOSettings[]> {
  const { data, error } = await supabase
    .from('seo_settings')
    .select('*')
    .order('page_key')

  if (error) {
    console.error('Error fetching all SEO settings:', error)
    return []
  }

  return data || []
}

// Update SEO settings for a page
export async function updateSEOSettings(settings: Partial<SEOSettings> & { page_key: string }): Promise<boolean> {
  const { error } = await supabase
    .from('seo_settings')
    .upsert(settings, { onConflict: 'page_key' })

  if (error) {
    console.error('Error updating SEO settings:', error)
    return false
  }

  return true
}

// Default structured data templates
export const structuredDataTemplates = {
  localBusiness: {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "STOLL Esportsenter",
    "image": "https://stoll.gg/logo.png",
    "@id": "https://stoll.gg",
    "url": "https://stoll.gg",
    "telephone": "+47 400 80 071",
    "email": "info@stoll.gg",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Ulsmågvegen 12",
      "addressLocality": "Kongsberg",
      "postalCode": "3616",
      "addressCountry": "NO"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 60.3196,
      "longitude": 5.3546
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "08:00",
        "closes": "16:00"
      }
    ],
    "sameAs": [
      "https://www.facebook.com/stoll.esport",
      "https://www.instagram.com/stoll.esport"
    ],
    "priceRange": "$$"
  },

  autoRepair: {
    "@context": "https://schema.org",
    "@type": "AutoRepair",
    "name": "STOLL Esportsenter - Verksted",
    "image": "https://stoll.gg/verksted.jpg",
    "url": "https://stoll.gg/#tjenester",
    "telephone": "+47 400 80 071",
    "priceRange": "$$",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Ulsmågvegen 12",
      "addressLocality": "Kongsberg",
      "postalCode": "3616",
      "addressCountry": "NO"
    },
    "areaServed": {
      "@type": "City",
      "name": "Kongsberg"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Verkstedtjenester",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "EU-kontroll"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Service og vedlikehold"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Reparasjoner"
          }
        }
      ]
    }
  },

  tournaments: {
    "@context": "https://schema.org",
    "@type": "SportsActivityLocation",
    "name": "STOLL Esportsenter - Turneringer",
    "image": "https://stoll.gg/esport.jpg",
    "url": "https://stoll.gg/#turneringer",
    "telephone": "+47 400 80 071",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Ulsmågvegen 12",
      "addressLocality": "Kongsberg",
      "postalCode": "3616",
      "addressCountry": "NO"
    }
  }
}

// Default FAQ templates per page
export const defaultFAQs: Record<string, Array<{ question: string; answer: string }>> = {
  home: [
    {
      question: "Hvor ligger STOLL Esportsenter?",
      answer: "STOLL Esportsenter ligger på Den gamle kinoen, Kongsberg sentrum."
    },
    {
      question: "Hva er åpningstidene til STOLL Esportsenter?",
      answer: "Vi har åpent mandag til fredag kl. 08:00-16:00. Vi holder stengt i helgene."
    },
    {
      question: "Hvilke tjenester tilbyr STOLL Esportsenter?",
      answer: "Vi tilbyr gaming-lokaler, turneringer, treninger, bursdager og bedriftsarrangementer."
    }
  ],
  verksted: [
    {
      question: "Utfører dere EU-kontroll?",
      answer: "Ja, vi utfører EU-kontroll for alle bilmerker. Bestill time på tlf 400 80 071 eller via vårt kontaktskjema."
    },
    {
      question: "Hvor lang tid tar en service?",
      answer: "En standard service tar vanligvis 2-4 timer. Ved større jobber kan det ta lenger tid."
    },
    {
      question: "Gir dere garanti på arbeidet?",
      answer: "Ja, vi gir mobilitetsgaranti som er gyldig frem til neste service. Den dekker blant annet gratis veihjelp og leiebil i hele Europa."
    }
  ],
  coaching: [
    {
      question: "Hva slags coaching tilbyr dere?",
      answer: "Vi tilbyr individuell og lagbasert coaching i populære esport-titler som CS2, Valorant, League of Legends og mer."
    },
    {
      question: "Trenger jeg eget utstyr for trening?",
      answer: "Nei, vi har alt utstyr du trenger. Bare møt opp, så sørger vi for resten."
    },
    {
      question: "Passer coaching for nybegynnere?",
      answer: "Absolutt! Vi har coaching-pakker for alle nivåer, fra nybegynner til konkurransespiller."
    }
  ],
  turneringer: [
    {
      question: "Hvordan melder jeg meg på en turnering?",
      answer: "Du kan melde deg på via nettsiden vår eller kontakte oss direkte. Se kommende turneringer under arrangementer."
    },
    {
      question: "Hvilke spill arrangerer dere turneringer i?",
      answer: "Vi arrangerer turneringer i CS2, Valorant, League of Legends, Rocket League og flere populære titler."
    },
    {
      question: "Er det premier i turneringene?",
      answer: "Ja, de fleste turneringene har premiepott. Størrelsen varierer etter turneringens nivå og antall deltakere."
    }
  ]
}

// Generate sitemap XML
export function generateSitemap(baseUrl: string = 'https://stoll.gg'): string {
  const pages = [
    { url: '', priority: '1.0', changefreq: 'weekly' },
    { url: '/#tjenester', priority: '0.8', changefreq: 'monthly' },
    { url: '/#coaching', priority: '0.8', changefreq: 'monthly' },
    { url: '/#turneringer', priority: '0.8', changefreq: 'weekly' },
    { url: '/#om-oss', priority: '0.6', changefreq: 'monthly' },
    { url: '/#kontakt', priority: '0.7', changefreq: 'monthly' },
  ]

  const today = new Date().toISOString().split('T')[0]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`

  return xml
}

// Generate robots.txt
export function generateRobotsTxt(baseUrl: string = 'https://stoll.gg'): string {
  return `User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml`
}
