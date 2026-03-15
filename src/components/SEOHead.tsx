import { useEffect } from 'react'

interface SEOData {
  meta_title?: string | null
  meta_description?: string | null
  og_image?: string | null
  structured_data?: Record<string, unknown> | null
  faq_schema?: Array<{ question: string; answer: string }> | null
  keywords?: string[] | null
  canonical_url?: string | null
}

interface SEOHeadProps {
  data?: SEOData
  pageKey?: string
}

// Default business structured data
const defaultStructuredData = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "STOLL Esportsenter",
  "image": "https://ddautocenter.no/logo.png",
  "@id": "https://ddautocenter.no",
  "url": "https://ddautocenter.no",
  "telephone": "+47 400 80 071",
  "email": "info@ddautocenter.no",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Ulsmågvegen 12",
    "addressLocality": "Nesttun",
    "postalCode": "5224",
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
    "https://www.facebook.com/ddautocenter",
    "https://www.instagram.com/ddautocenter"
  ],
  "priceRange": "$$",
  "areaServed": {
    "@type": "City",
    "name": "Bergen"
  }
}

export default function SEOHead({ data, pageKey = 'home' }: SEOHeadProps) {
  useEffect(() => {
    // Update document title
    if (data?.meta_title) {
      document.title = data.meta_title
    }

    // Helper to update or create meta tag
    const setMeta = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name'
      let element = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement
      
      if (!element) {
        element = document.createElement('meta')
        element.setAttribute(attr, name)
        document.head.appendChild(element)
      }
      element.content = content
    }

    // Meta description
    if (data?.meta_description) {
      setMeta('description', data.meta_description)
    }

    // Keywords
    if (data?.keywords && data.keywords.length > 0) {
      setMeta('keywords', data.keywords.join(', '))
    }

    // Canonical URL
    if (data?.canonical_url) {
      let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement
      if (!canonical) {
        canonical = document.createElement('link')
        canonical.rel = 'canonical'
        document.head.appendChild(canonical)
      }
      canonical.href = data.canonical_url
    }

    // Open Graph tags
    setMeta('og:type', 'website', true)
    setMeta('og:locale', 'nb_NO', true)
    setMeta('og:site_name', 'STOLL Esportsenter', true)
    
    if (data?.meta_title) {
      setMeta('og:title', data.meta_title, true)
    }
    if (data?.meta_description) {
      setMeta('og:description', data.meta_description, true)
    }
    if (data?.og_image) {
      setMeta('og:image', data.og_image, true)
    }

    // Twitter Card tags
    setMeta('twitter:card', 'summary_large_image')
    if (data?.meta_title) {
      setMeta('twitter:title', data.meta_title)
    }
    if (data?.meta_description) {
      setMeta('twitter:description', data.meta_description)
    }
    if (data?.og_image) {
      setMeta('twitter:image', data.og_image)
    }

    // Structured Data (JSON-LD)
    const structuredData = data?.structured_data || defaultStructuredData
    let scriptElement = document.querySelector('script[data-seo="structured-data"]') as HTMLScriptElement
    
    if (!scriptElement) {
      scriptElement = document.createElement('script')
      scriptElement.type = 'application/ld+json'
      scriptElement.setAttribute('data-seo', 'structured-data')
      document.head.appendChild(scriptElement)
    }
    scriptElement.textContent = JSON.stringify(structuredData)

    // FAQ Schema (if present)
    if (data?.faq_schema && data.faq_schema.length > 0) {
      const faqStructuredData = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": data.faq_schema.map(faq => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.answer
          }
        }))
      }

      let faqScript = document.querySelector('script[data-seo="faq-schema"]') as HTMLScriptElement
      
      if (!faqScript) {
        faqScript = document.createElement('script')
        faqScript.type = 'application/ld+json'
        faqScript.setAttribute('data-seo', 'faq-schema')
        document.head.appendChild(faqScript)
      }
      faqScript.textContent = JSON.stringify(faqStructuredData)
    }

    // Cleanup on unmount
    return () => {
      const faqScript = document.querySelector('script[data-seo="faq-schema"]')
      if (faqScript) {
        faqScript.remove()
      }
    }
  }, [data, pageKey])

  // This component doesn't render anything visible
  return null
}

// Helper hook to get SEO data from context or API
export function useSEO(pageKey: string) {
  // This can be expanded to fetch from context or API
  return { pageKey }
}
