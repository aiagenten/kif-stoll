import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cookie, X, Check } from 'lucide-react'

const COOKIE_CONSENT_KEY = 'stoll_cookie_consent'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (!consent) {
      // Short delay so it doesn't flash on first render
      const timer = setTimeout(() => setVisible(true), 800)
      return () => clearTimeout(timer)
    }
  }, [])

  const accept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({ analytics: true, necessary: true, timestamp: Date.now() }))
    setVisible(false)
  }

  const acceptNecessary = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({ analytics: false, necessary: true, timestamp: Date.now() }))
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-[100] p-4 sm:p-6"
          style={{ pointerEvents: 'none' }}
        >
          <div
            className="max-w-4xl mx-auto rounded-2xl p-5 sm:p-6 shadow-2xl"
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              boxShadow: '0 0 40px rgba(95,78,157,0.25)',
              pointerEvents: 'auto',
            }}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {/* Icon */}
              <div
                className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--gradient-primary)' }}
              >
                <Cookie size={20} className="text-white" />
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white text-sm mb-1">Vi bruker informasjonskapsler 🍪</p>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                  Vi bruker <strong className="text-white">nødvendige</strong> cookies for at siden skal fungere, og{' '}
                  <strong className="text-white">analytics</strong> for å forstå hvordan den brukes. Ingen persondata selges.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0 w-full sm:w-auto">
                <button
                  onClick={acceptNecessary}
                  className="px-4 py-2 rounded-xl text-xs font-bold transition-all hover:opacity-80"
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  Kun nødvendige
                </button>
                <button
                  onClick={accept}
                  className="px-5 py-2 rounded-xl text-xs font-black text-white flex items-center justify-center gap-1.5 transition-all hover:opacity-90"
                  style={{ background: 'var(--gradient-primary)' }}
                >
                  <Check size={13} />
                  Godta alle
                </button>
              </div>

              {/* Close */}
              <button
                onClick={acceptNecessary}
                className="absolute top-3 right-3 sm:static flex-shrink-0 p-1 rounded-lg transition-colors hover:bg-white/10"
                style={{ color: 'var(--color-text-muted)' }}
                aria-label="Lukk"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
