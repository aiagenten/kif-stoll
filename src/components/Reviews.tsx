import { motion, useInView } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import { Star, ChevronLeft, ChevronRight, Quote, ExternalLink } from 'lucide-react'
import { getReviews } from '../lib/supabase'

// Default reviews for STOLL
const defaultReviews = [
  {
    author: 'Martin G.',
    rating: 5,
    text: 'Helt fantastisk esportsenter! Topp utstyr og hyggelig miljø. Har vært her flere ganger på turneringer og det er alltid bra stemning.',
  },
  {
    author: 'Emilie K.',
    rating: 5,
    text: 'Arrangerte bursdagsfest for sønnen min her. Ungene hadde det helt rått! Supert organisert og veldig hyggelig personale.',
  },
  {
    author: 'Team Apex',
    rating: 5,
    text: 'Vi trener her ukentlig. Pro-utstyret og coachingen har gjort oss til et mye bedre lag. Anbefales!',
  },
  {
    author: 'Jonas H.',
    rating: 5,
    text: 'Endelig et ordentlig esportsenter i Kongsberg! 144Hz skjermer, kraftige PCer og god internett. Alt du trenger.',
  },
]

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex space-x-1">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-5 h-5 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`}
        />
      ))}
    </div>
  )
}

export default function Reviews() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const [currentIndex, setCurrentIndex] = useState(0)
  const [reviews, setReviews] = useState(defaultReviews)

  useEffect(() => {
    getReviews().then(data => {
      if (data && data.length > 0) {
        setReviews(data.map(r => ({ author: r.author, rating: r.rating, text: r.text })))
      }
    }).catch(console.error)
  }, [])

  const nextReview = () => setCurrentIndex((prev) => (prev + 1) % reviews.length)
  const prevReview = () => setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length)

  const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length

  return (
    <section id="anmeldelser" className="py-24" style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <span className="text-xs font-bold uppercase tracking-widest mb-3 block" style={{ color: 'var(--color-accent)' }}>
            Hva folk sier
          </span>
          <h2 className="text-4xl lg:text-5xl font-black mb-4 text-white">
            Våre <span className="text-gradient-accent">spillere</span>
          </h2>
          
          <div className="flex items-center justify-center space-x-4 mb-4">
            <span className="text-4xl font-black" style={{ color: 'var(--color-accent)' }}>{averageRating.toFixed(1)}</span>
            <StarRating rating={Math.round(averageRating)} />
          </div>
          <p style={{ color: 'var(--color-text-muted)' }}>
            Basert på {reviews.length}+ anmeldelser
          </p>
        </motion.div>

        {/* Carousel */}
        <div className="relative max-w-4xl mx-auto">
          <button
            onClick={prevReview}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 z-10 p-3 rounded-full transition-all"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextReview}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 z-10 p-3 rounded-full transition-all"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="rounded-2xl p-8 md:p-12 text-center"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            <Quote className="w-12 h-12 mx-auto mb-6" style={{ color: 'rgba(95,78,157,0.3)' }} />
            <p className="text-xl md:text-2xl leading-relaxed italic mb-8" style={{ color: 'var(--color-text-muted)' }}>
              "{reviews[currentIndex].text}"
            </p>
            <div className="flex justify-center mb-4">
              <StarRating rating={reviews[currentIndex].rating} />
            </div>
            <p className="text-lg font-bold text-white">
              – {reviews[currentIndex].author}
            </p>
          </motion.div>

          <div className="flex justify-center space-x-2 mt-8">
            {reviews.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex ? 'w-8' : 'w-2'
                }`}
                style={{ background: index === currentIndex ? 'var(--color-accent)' : 'var(--color-border)' }}
              />
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.4 }}
          className="text-center mt-12"
        >
          <motion.a
            href="https://www.google.com/maps/search/STOLL+Esportsenter+Kongsberg"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 btn-primary px-8 py-4 rounded-full font-bold"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>Gi oss en anmeldelse på Google</span>
            <ExternalLink className="w-5 h-5" />
          </motion.a>
        </motion.div>
      </div>
    </section>
  )
}
