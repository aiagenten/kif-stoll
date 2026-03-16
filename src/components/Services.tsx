import { motion } from 'framer-motion'
import { Monitor, Users, Calendar, Zap } from 'lucide-react'
import { ControllerIcon, SwordIcon, TrophyIcon } from './icons/GamingIcons'
import { useContent } from '../contexts/ContentContext'

export default function Services() {
  const { content } = useContent()

  const services = [
    {
      id: 'fasiliteter',
      icon: ControllerIcon,
      title: 'Gaming-fasiliteter',
      description: content['service_gaming'] || 'Profesjonelle gaming-rigger med de nyeste PC-ene, skjermene og periferiene.',
      color: 'var(--color-primary)',
      emoji: '🖥️',
    },
    {
      id: 'treninger',
      icon: SwordIcon,
      title: 'Treninger & Coaching',
      description: content['service_coaching'] || 'Ukentlige treninger, coaching-sesjoner og scrim-muligheter for lag og individuelle spillere.',
      color: 'var(--color-accent)',
      emoji: '⚔️',
    },
    {
      id: 'turneringer',
      icon: TrophyIcon,
      title: 'Turneringer',
      description: content['service_turneringer'] || 'Fra lokale turneringer til regionale og nasjonale mesterskap. STOLL er arenaen der drømmene lever.',
      color: '#10b981',
      emoji: '🏆',
    },
  ]

  const features = [
    { icon: Users, text: 'Spillerlounge og sosialt miljø' },
    { icon: Calendar, text: 'Ukentlige events og turneringer' },
    { icon: Zap, text: 'High-speed internett (1 Gbps)' },
    { icon: Monitor, text: '144Hz+ skjermer og top-tier utstyr' },
  ]

  return (
    <section id="fasiliteter" className="py-24" style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-xs font-bold uppercase tracking-widest mb-3 block" style={{ color: 'var(--color-accent)' }}>
            Hva vi tilbyr
          </span>
          <h2 className="text-4xl lg:text-5xl font-black mb-4 text-white">
            Alt du trenger for å <span className="text-gradient-accent">dominere</span>
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--color-text-muted)' }}>
            STOLL Esportsenter har alt som skal til for å ta din gaming til neste nivå.
          </p>
        </motion.div>

        {/* Service cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {services.map((service, i) => {
            const Icon = service.icon
            return (
              <motion.div
                key={service.id}
                id={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="card-theme rounded-2xl p-8 text-center group cursor-default"
              >
                <div
                  className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 text-3xl"
                  style={{ background: `${service.color}22`, border: `2px solid ${service.color}44` }}
                >
                  {service.emoji}
                </div>
                <h3 className="text-xl font-black mb-3 text-white">{service.title}</h3>
                <p style={{ color: 'var(--color-text-muted)' }} className="leading-relaxed">
                  {service.description}
                </p>
                <div className="mt-6 pt-6 border-t border-purple-900/30" style={{ color: service.color }}>
                  <Icon size={20} className="mx-auto" />
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Feature list */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl p-8"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          <h3 className="text-center text-xl font-black text-white mb-6">
            Inkludert på STOLL
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: FIcon, text }) => (
              <div key={text} className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(95,78,157,0.2)', border: '1px solid rgba(95,78,157,0.4)' }}>
                  <FIcon size={18} style={{ color: 'var(--color-accent)' }} />
                </div>
                <span className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>{text}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
