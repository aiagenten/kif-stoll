import { motion } from 'framer-motion'
import { ChevronDown, Trophy, Users, Zap } from 'lucide-react'
import { useContent } from '../contexts/ContentContext'

export default function Hero() {
  const { content } = useContent()

  const title = content['hero_title'] || 'NORGES BESTE ESPORTSENTER!'
  const subtitle = content['hero_subtitle'] || 'STOLL Esportsenter er Kongsbergs fremste arena for gaming og esport.'
  const heroImage = content['hero_image'] || ''

  const stats = [
    { icon: Trophy, label: 'Turneringer', value: '50+' },
    { icon: Users, label: 'Medlemmer', value: '500+' },
    { icon: Zap, label: 'Gaming-rigger', value: '30+' },
  ]

  return (
    <section
      id="hjem"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ background: 'var(--color-bg)' }}
    >
      {/* Background image or gradient */}
      {heroImage ? (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
      ) : (
        <div className="absolute inset-0">
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse at 20% 50%, rgba(95,78,157,0.25) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(242,222,39,0.08) 0%, transparent 50%)',
            }}
          />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--color-bg)]" />

      {/* Animated grid */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'linear-gradient(rgba(95,78,157,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(95,78,157,0.5) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-32">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-bold mb-8 uppercase tracking-widest"
          style={{
            background: 'rgba(95,78,157,0.2)',
            border: '1px solid rgba(95,78,157,0.5)',
            color: 'var(--color-accent)',
          }}
        >
          <span>⚡</span>
          <span>Kongsberg's #1 Esportsenter</span>
          <span>⚡</span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-5xl sm:text-6xl lg:text-8xl font-black mb-6 leading-none tracking-tight"
        >
          <span className="block text-white">{title.split('!')[0]}</span>
          <span className="block text-gradient-accent">
            {title.includes('!') ? '!' : ''}
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-lg sm:text-xl max-w-2xl mx-auto mb-12 leading-relaxed"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {subtitle}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <motion.a
            href="#events"
            onClick={(e) => { e.preventDefault(); document.querySelector('#events')?.scrollIntoView({ behavior: 'smooth' }) }}
            className="btn-accent px-8 py-4 rounded-full text-lg font-black uppercase tracking-wider cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🎮 Se Kommende Events
          </motion.a>
          <motion.a
            href="#kontakt"
            onClick={(e) => { e.preventDefault(); document.querySelector('#kontakt')?.scrollIntoView({ behavior: 'smooth' }) }}
            className="btn-primary px-8 py-4 rounded-full text-lg font-bold uppercase tracking-wider cursor-pointer"
            style={{ border: '2px solid rgba(95,78,157,0.7)' }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Bli Medlem
          </motion.a>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-8"
        >
          {stats.map(({ icon: Icon, label, value }) => (
            <motion.div
              key={label}
              className="flex items-center space-x-3 px-6 py-3 rounded-2xl"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
              whileHover={{ y: -4, borderColor: 'var(--color-primary)' }}
            >
              <Icon size={24} style={{ color: 'var(--color-accent)' }} />
              <div className="text-left">
                <div className="text-2xl font-black" style={{ color: 'var(--color-accent)' }}>{value}</div>
                <div className="text-xs uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>{label}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{ color: 'var(--color-text-muted)' }}
      >
        <ChevronDown size={28} />
      </motion.div>
    </section>
  )
}
