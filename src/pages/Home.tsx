import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Hero from '../components/Hero'
import Services from '../components/Services'
import MembershipPackages from '../components/MembershipPackages'
import AboutUs from '../components/AboutUs'
import Reviews from '../components/Reviews'
import Contact from '../components/Contact'
import EventCalendar from '../components/EventCalendar'
import SponsorCarousel from '../components/SponsorCarousel'
import SEOHead from '../components/SEOHead'
import { getSEOSettings } from '../lib/seo'
import type { SEOSettings } from '../lib/seo'

// Hardcoded fallback SEO data for KIF STOLL Esportsenter
const defaultSEO: SEOSettings = {
  page_key: 'home',
  meta_title: 'KIF STOLL Esportsenter Bergen | Gaming, Turneringer & Treninger',
  meta_description: 'KIF STOLL Esportsenter i Bergen — Norges kuleste gaming-arena med treninger, turneringer og events for alle aldre.',
  og_image: 'https://stoll.gg/og-image.jpg',
  canonical_url: 'https://stoll.gg',
  keywords: ['esportsenter', 'gaming Bergen', 'turneringer', 'KIF STOLL', 'esport Norge', 'gaming arena', 'treninger', 'esport Bergen'],
  structured_data: {
    "@context": "https://schema.org",
    "@type": "SportsActivityLocation",
    "name": "KIF STOLL Esportsenter",
    "description": "KIF STOLL Esportsenter i Bergen — Norges kuleste gaming-arena med treninger, turneringer og events for alle aldre.",
    "image": "https://stoll.gg/og-image.jpg",
    "@id": "https://stoll.gg",
    "url": "https://stoll.gg",
    "telephone": "+47 55 55 55 55",
    "email": "info@stoll.gg",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Ulsmågvegen 12",
      "addressLocality": "Bergen",
      "postalCode": "5009",
      "addressCountry": "NO"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 60.3913,
      "longitude": 5.3221
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "14:00",
        "closes": "22:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": "Saturday",
        "opens": "11:00",
        "closes": "23:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": "Sunday",
        "opens": "12:00",
        "closes": "20:00"
      }
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "STOLL Tilbud",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": { "@type": "Service", "name": "Åpen Gaming" }
        },
        {
          "@type": "Offer",
          "itemOffered": { "@type": "Service", "name": "Esport Trening" }
        },
        {
          "@type": "Offer",
          "itemOffered": { "@type": "Service", "name": "Turnering" }
        },
        {
          "@type": "Offer",
          "itemOffered": { "@type": "Service", "name": "Bursdagsarrangement" }
        }
      ]
    },
    "sameAs": [
      "https://www.facebook.com/stoll.gg",
      "https://www.instagram.com/stoll.gg"
    ],
    "priceRange": "$$",
    "areaServed": {
      "@type": "City",
      "name": "Bergen"
    }
  },
  faq_schema: [
    {
      question: "Hva er KIF STOLL Esportsenter?",
      answer: "KIF STOLL Esportsenter er Bergens fremste gaming-arena for esport. Vi tilbyr topputstyrt gaming, ukentlige treninger, turneringer og arrangementer for alle aldre og nivåer."
    },
    {
      question: "Kan man booke plass på STOLL?",
      answer: "Ja! Du kan booke plass til spesifikke events, turneringer og bursdagsarrangementer via nettsiden vår. Klikk på et event i kalendervisningen og velg 'Reserver plass'."
    },
    {
      question: "Hva koster det å spille på STOLL?",
      answer: "Vi har ulike pakker og priser avhengig av hva du ønsker. Kontakt oss for gjeldende priser, eller sjekk våre medlemskapspakker for de beste tilbudene."
    },
    {
      question: "Hvilken aldersgrense er det på STOLL?",
      answer: "STOLL er åpent for alle aldre! Vi har aktiviteter tilpasset barn, ungdom og voksne. Barn under 12 år bør ha med en foresatt."
    },
    {
      question: "Hvilke spill spilles på STOLL?",
      answer: "Vi støtter de fleste populære esport-titler inkludert CS2, Valorant, League of Legends, FIFA/FC, Fortnite og Rocket League. Kontakt oss for full liste over tilgjengelige spill."
    },
    {
      question: "Når er det treninger på STOLL?",
      answer: "Vi har faste treninger hver mandag fra 17:00-19:00, fredagsturneringer fra 18:00-22:00, og åpen gaming på lørdager fra 12:00-17:00. Sjekk event-kalenderen for oppdaterte tider."
    }
  ]
}

export default function Home() {
  const [seoData, setSeoData] = useState<SEOSettings>(defaultSEO)

  useEffect(() => {
    getSEOSettings('home').then(data => {
      if (data) setSeoData(data)
    })
  }, [])

  return (
    <>
      <SEOHead data={seoData} pageKey="home" />
      <AnimatePresence>
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Hero />
          <SponsorCarousel />
          <Services />
          <EventCalendar />
          <MembershipPackages />
          <AboutUs />
          <Reviews />
          <Contact />
        </motion.main>
      </AnimatePresence>
    </>
  )
}
