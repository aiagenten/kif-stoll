import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { getSponsors } from '../lib/supabase'
import type { Sponsor } from '../lib/supabase'

export default function SponsorCarousel() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([])

  useEffect(() => {
    getSponsors().then(setSponsors).catch(console.error)
  }, [])

  if (sponsors.length === 0) return null

  // Duplicate for infinite scroll
  const doubled = [...sponsors, ...sponsors]

  return (
    <section className="py-12 overflow-hidden" style={{ background: '#f5f5f7', borderTop: '1px solid #e0e0e0', borderBottom: '1px solid #e0e0e0' }}>
      <div className="max-w-7xl mx-auto px-4 mb-6">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-xs font-bold uppercase tracking-widest"
          style={{ color: '#666' }}
        >
          Våre sponsorer
        </motion.p>
      </div>

      <div className="relative">
        {/* Left/right fade */}
        <div className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
          style={{ background: `linear-gradient(to right, #f5f5f7, transparent)` }} />
        <div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
          style={{ background: `linear-gradient(to left, #f5f5f7, transparent)` }} />

        <div className="flex animate-scroll-left" style={{ width: 'max-content' }}>
          {doubled.map((sponsor, i) => (
            <div
              key={`${sponsor.id}-${i}`}
              className="mx-8 flex-shrink-0"
            >
              {sponsor.website ? (
                <a
                  href={sponsor.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <SponsorLogo sponsor={sponsor} />
                </a>
              ) : (
                <SponsorLogo sponsor={sponsor} />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function SponsorLogo({ sponsor }: { sponsor: Sponsor }) {
  return (
    <div
      className="flex items-center justify-center px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105"
      style={{
        background: '#fff',
        border: '1px solid #e0e0e0',
        minWidth: '120px',
        height: '60px',
      }}
    >
      {sponsor.logo_url ? (
        <img
          src={sponsor.logo_url}
          alt={sponsor.name}
          className="max-h-10 max-w-[100px] object-contain transition-all duration-300"
          style={{
            opacity: 0.8,
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '0.8')}
        />
      ) : (
        <span
          className="text-sm font-bold uppercase tracking-wider"
          style={{ color: '#333' }}
        >
          {sponsor.name}
        </span>
      )}
    </div>
  )
}
