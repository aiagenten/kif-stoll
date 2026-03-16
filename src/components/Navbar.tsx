import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Phone, Facebook, Instagram } from 'lucide-react'
import { useContent } from '../contexts/ContentContext'

const navLinks = [
  { name: 'Hjem', href: '#hjem' },
  { name: 'Fasiliteter', href: '#fasiliteter' },
  { name: 'Treninger', href: '#treninger' },
  { name: 'Turneringer', href: '#turneringer' },
  { name: 'Events', href: '#events' },
  { name: 'Om Oss', href: '#om-oss' },
  { name: 'Nyheter', href: '/nyheter', isRoute: true },
  { name: 'Kontakt', href: '#kontakt' },
]

interface NavbarProps {
  darkMode?: boolean
  setDarkMode?: (value: boolean) => void
}

export default function Navbar({ }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const isHomePage = location.pathname === '/'
  const { content } = useContent()

  const phone = content['contact_phone'] || '55 55 55 55'
  const facebook = content['social_facebook'] || '#'
  const instagram = content['social_instagram'] || '#'

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (href: string) => {
    if (!isHomePage && href.startsWith('#')) {
      window.location.href = '/' + href
      return
    }
    const element = document.querySelector(href)
    if (element) element.scrollIntoView({ behavior: 'smooth' })
    setIsOpen(false)
  }

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass shadow-lg shadow-purple-900/20' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <motion.div className="flex-shrink-0" whileHover={{ scale: 1.05 }}>
            <a href={isHomePage ? '#hjem' : '/'} className="flex items-center space-x-3 text-2xl font-black tracking-wide">
              <img src="/images/stoll/logo-header.png" alt="STOLL Esportsenter" className="h-10 w-auto" />
            </a>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6 lg:space-x-8 xl:space-x-10">
            {navLinks.map((link) =>
              'isRoute' in link && link.isRoute ? (
                <Link
                  key={link.name}
                  to={link.href}
                  className="nav-link transition-colors font-medium text-[13px] uppercase tracking-widest py-2 px-1 hover:text-white"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  {link.name}
                </Link>
              ) : (
                <motion.button
                  key={link.name}
                  onClick={() => scrollToSection(link.href)}
                  className="nav-link transition-colors font-medium text-[13px] uppercase tracking-widest py-2 px-1 hover:text-white"
                  style={{ color: 'var(--color-text-muted)' }}
                  whileHover={{ y: -2 }}
                >
                  {link.name}
                </motion.button>
              )
            )}
          </div>

          {/* Right side */}
          <div className="hidden lg:flex items-center space-x-4">
            <a href={facebook} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-text-muted)' }} className="hover:text-white transition-colors">
              <Facebook size={18} />
            </a>
            <a href={instagram} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-text-muted)' }} className="hover:text-white transition-colors">
              <Instagram size={18} />
            </a>
            <a
              href={`tel:${phone.replace(/\s/g, '')}`}
              className="flex items-center space-x-2 px-4 py-2 rounded-full font-bold text-sm"
              style={{ background: 'var(--gradient-primary)', color: '#fff' }}
            >
              <Phone size={15} />
              <span>{phone}</span>
            </a>
          </div>

          {/* Mobile */}
          <div className="lg:hidden flex items-center space-x-3">
            <a href={`tel:${phone.replace(/\s/g, '')}`} style={{ color: 'var(--color-accent)' }}>
              <Phone size={20} />
            </a>
            <motion.button onClick={() => setIsOpen(!isOpen)} style={{ color: 'var(--color-text)' }} whileTap={{ scale: 0.9 }}>
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden glass"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) =>
                'isRoute' in link && link.isRoute ? (
                  <Link
                    key={link.name}
                    to={link.href}
                    onClick={() => setIsOpen(false)}
                    className="block w-full text-left px-4 py-3 rounded-lg transition-colors font-semibold text-sm uppercase tracking-wider"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    {link.name}
                  </Link>
                ) : (
                  <motion.button
                    key={link.name}
                    onClick={() => scrollToSection(link.href)}
                    className="block w-full text-left px-4 py-3 rounded-lg font-semibold text-sm uppercase tracking-wider"
                    style={{ color: 'var(--color-text-muted)' }}
                    whileHover={{ x: 8 }}
                  >
                    {link.name}
                  </motion.button>
                )
              )}
              <div className="flex items-center space-x-4 px-4 pt-4 border-t border-purple-900/30">
                <a href={facebook} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-text-muted)' }}><Facebook size={22} /></a>
                <a href={instagram} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-text-muted)' }}><Instagram size={22} /></a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
