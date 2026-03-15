import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Facebook, Instagram, Gamepad2, Youtube, Twitch } from 'lucide-react'
import { useContent } from '../contexts/ContentContext'

export default function Footer() {
  const { getContentValue } = useContent()

  const phone = getContentValue('contact_phone', '55 55 55 55')
  const emailGeneral = getContentValue('contact_email_verksted', 'info@stoll.gg')
  const address = getContentValue('contact_address', 'Kongsberg, Norge')
  const openWeekdays = getContentValue('opening_weekdays', 'Man-Fre: 14:00 - 22:00')
  const openSaturday = getContentValue('opening_saturday', 'Lørdag: 11:00 - 23:00')
  const openSunday = getContentValue('opening_sunday', 'Søndag: 12:00 - 20:00')
  const facebook = getContentValue('social_facebook', '#')
  const instagram = getContentValue('social_instagram', '#')

  const navLinks = [
    { name: 'Hjem', href: '#hjem' },
    { name: 'Fasiliteter', href: '#fasiliteter' },
    { name: 'Events', href: '#events' },
    { name: 'Om Oss', href: '#om-oss' },
    { name: 'Kontakt', href: '#kontakt' },
  ]

  return (
    <footer style={{ background: 'var(--color-dark)', borderTop: '1px solid var(--color-border)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Gamepad2 size={28} style={{ color: 'var(--color-accent)' }} />
              <span className="text-2xl font-black" style={{ color: 'var(--color-accent)' }}>STOLL</span>
              <span className="text-sm font-medium opacity-60 text-white">ESPORTSENTER</span>
            </div>
            <p className="text-sm leading-relaxed mb-6 max-w-sm" style={{ color: 'var(--color-text-muted)' }}>
              Norges ledende esportsenter. Vi skaper arenaer der drømmene lever og fellesskapet blomstrer.
            </p>
            <div className="flex space-x-3">
              {[
                { href: facebook, Icon: Facebook, label: 'Facebook' },
                { href: instagram, Icon: Instagram, label: 'Instagram' },
                { href: '#', Icon: Youtube, label: 'YouTube' },
                { href: '#', Icon: Twitch, label: 'Twitch' },
              ].map(({ href, Icon, label }) => (
                <motion.a
                  key={label}
                  href={href}
                  target={href !== '#' ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
                  style={{ background: 'var(--color-surface)', color: 'var(--color-text-muted)' }}
                  whileHover={{ scale: 1.1, color: 'var(--color-accent)' }}
                >
                  <Icon size={16} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-white mb-4">Navigasjon</h3>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault()
                      document.querySelector(link.href)?.scrollIntoView({ behavior: 'smooth' })
                    }}
                    className="text-sm transition-colors hover:text-white"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    {link.name}
                  </a>
                </li>
              ))}
              <li>
                <Link to="/blogg" className="text-sm transition-colors hover:text-white" style={{ color: 'var(--color-text-muted)' }}>
                  Blogg
                </Link>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-white mb-4">Kontakt & Tider</h3>
            <div className="space-y-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
              <p>{address}</p>
              <a href={`tel:${phone.replace(/\s/g, '')}`} className="block hover:text-white transition-colors">{phone}</a>
              <a href={`mailto:${emailGeneral}`} className="block hover:text-white transition-colors">{emailGeneral}</a>
              <div className="pt-2 space-y-1">
                <p>{openWeekdays}</p>
                <p>{openSaturday}</p>
                <p>{openSunday}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t pt-8 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderColor: 'var(--color-border)' }}>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            © {new Date().getFullYear()} STOLL Esportsenter. Alle rettigheter reservert.
          </p>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            Bygget med ❤️ av <a href="https://aiagenten.no" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">AI Agenten</a>
          </p>
        </div>
      </div>
    </footer>
  )
}
