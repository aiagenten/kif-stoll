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

export default function Home() {
  const [seoData, setSeoData] = useState<SEOSettings | null>(null)

  useEffect(() => {
    getSEOSettings('home').then(setSeoData)
  }, [])

  return (
    <>
      <SEOHead data={seoData || undefined} pageKey="home" />
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
