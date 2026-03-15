import { motion } from 'framer-motion'
import { Check, Zap } from 'lucide-react'

// Renamed to MembershipPackages - static STOLL membership tiers
const tiers = [
  {
    name: 'Gratis',
    price: '0 kr/mnd',
    description: 'Prøv STOLL uten forpliktelser',
    features: [
      'Tilgang til åpne events',
      'Deltakelse i offentlige turneringer',
      'STOLL Discord-tilgang',
    ],
    highlight: false,
    color: '#6b7280',
  },
  {
    name: 'Gamer',
    price: '199 kr/mnd',
    description: 'For deg som er seriøs',
    features: [
      'Alt fra Gratis',
      '10 timer spilletid/uke',
      'Rabatt på alle events',
      'Tilgang til treningsarenaen',
      'Online stats-tracking',
    ],
    highlight: false,
    color: 'var(--color-primary)',
  },
  {
    name: 'Pro',
    price: '399 kr/mnd',
    description: 'For kompetitive spillere',
    features: [
      'Alt fra Gamer',
      'Ubegrenset spilletid',
      'Gratis deltakelse i månedlige turneringer',
      'Coaching-sesjon (1/mnd)',
      'Prioritert booking',
      'Pro-spillerprofil',
    ],
    highlight: true,
    color: 'var(--color-accent)',
  },
  {
    name: 'Team',
    price: '999 kr/mnd',
    description: 'For hele laget (opptil 5)',
    features: [
      'Alt fra Pro × 5 spillere',
      'Dedikert team-booth',
      'Månedlig scrimmage-arrangement',
      'Sponsor-synlighet',
      'Eksklusiv team-merch-rabatt',
    ],
    highlight: false,
    color: '#10b981',
  },
]

export default function MembershipPackages() {
  return (
    <section id="pakker" className="py-24" style={{ background: 'var(--color-surface)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-xs font-bold uppercase tracking-widest mb-3 block" style={{ color: 'var(--color-accent)' }}>
            Bli med
          </span>
          <h2 className="text-4xl lg:text-5xl font-black mb-4 text-white">
            Velg ditt <span className="text-gradient-accent">nivå</span>
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--color-text-muted)' }}>
            Fra nybegynner til pro — vi har riktig pakke for deg.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-2xl p-6 flex flex-col ${tier.highlight ? 'ring-2 ring-[#F2DE27]' : ''}`}
              style={{
                background: 'var(--color-bg)',
                border: `1px solid ${tier.highlight ? tier.color : 'var(--color-border)'}`,
                boxShadow: tier.highlight ? `0 0 30px ${tier.color}33` : undefined,
              }}
            >
              {tier.highlight && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1"
                  style={{ background: tier.color, color: '#1C244B' }}
                >
                  <Zap size={12} />
                  Populær
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-black text-white mb-1">{tier.name}</h3>
                <p className="text-2xl font-black mb-1" style={{ color: tier.color }}>{tier.price}</p>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{tier.description}</p>
              </div>

              <ul className="space-y-2 flex-1 mb-6">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    <Check size={14} className="flex-shrink-0 mt-0.5" style={{ color: tier.color }} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <motion.a
                href="#kontakt"
                onClick={(e) => { e.preventDefault(); document.querySelector('#kontakt')?.scrollIntoView({ behavior: 'smooth' }) }}
                className="block text-center py-2.5 rounded-xl text-sm font-black uppercase tracking-wider transition-all"
                style={tier.highlight
                  ? { background: tier.color, color: '#1C244B' }
                  : { border: `1px solid ${tier.color}`, color: tier.color }
                }
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Kom i gang
              </motion.a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
