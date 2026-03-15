import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Trophy, Users, Zap, Globe } from 'lucide-react'
import { useContent } from '../contexts/ContentContext'

const stats = [
  { icon: Trophy, value: '2020', label: 'Etablert' },
  { icon: Users, value: '500+', label: 'Medlemmer' },
  { icon: Zap, value: '30+', label: 'Gaming-rigger' },
  { icon: Globe, value: 'Kongsberg', label: 'Lokasjon' },
]

export default function AboutUs() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const { getContentValue } = useContent()

  const history = getContentValue('about_history')
  const growth = getContentValue('about_growth')
  const values = getContentValue('about_values')
  const guarantee = getContentValue('about_guarantee')
  const teamImage = getContentValue('about_team_image')

  return (
    <section id="om-oss" className="py-24 relative overflow-hidden" style={{ background: 'var(--color-bg)' }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/4 w-[600px] h-[600px] rounded-full blur-3xl opacity-10"
          style={{ background: 'var(--color-primary)' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <motion.div
            ref={ref}
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <span className="text-xs font-bold uppercase tracking-widest mb-3 block" style={{ color: 'var(--color-accent)' }}>
              Vår Historie
            </span>
            <h2 className="text-4xl lg:text-5xl font-black mb-6 text-white">
              Om <span className="text-gradient-primary">STOLL</span>
            </h2>

            <div className="space-y-4" style={{ color: 'var(--color-text-muted)' }}>
              <p className="leading-relaxed">{history}</p>
              <p className="leading-relaxed">{growth}</p>
              <p className="leading-relaxed">{values}</p>
              {guarantee && (
                <div className="p-4 rounded-xl" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                  <p className="text-sm leading-relaxed">{guarantee}</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Image / stats */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {teamImage ? (
              <img
                src={teamImage}
                alt="STOLL team"
                className="w-full rounded-2xl object-cover"
                style={{ maxHeight: '300px', border: '2px solid var(--color-border)' }}
              />
            ) : (
              <div
                className="w-full h-48 rounded-2xl flex items-center justify-center"
                style={{ background: 'var(--color-surface)', border: '2px dashed var(--color-border)' }}
              >
                <span style={{ color: 'var(--color-text-muted)' }} className="text-4xl">🎮</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {stats.map(({ icon: Icon, value, label }) => (
                <motion.div
                  key={label}
                  className="p-4 rounded-xl text-center"
                  style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                  whileHover={{ borderColor: 'var(--color-primary)', y: -4 }}
                >
                  <Icon size={20} className="mx-auto mb-2" style={{ color: 'var(--color-accent)' }} />
                  <div className="text-2xl font-black text-white">{value}</div>
                  <div className="text-xs uppercase tracking-wider mt-1" style={{ color: 'var(--color-text-muted)' }}>{label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
