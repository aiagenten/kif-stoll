import { motion } from 'framer-motion'
import { Check, Zap, Gamepad2, Users } from 'lucide-react'

const memberships = [
  {
    name: 'E-sportmedlemskap',
    price: 'kr 1 100,-',
    period: 'per halvår',
    description: 'For deg som vil spille på organisert lag med ukentlige treninger',
    icon: Gamepad2,
    features: [
      'Treninger hver mandag (17:00–19:00)',
      'Bli knyttet til eget lag',
      'Velg spill: Fortnite, Super Smash Bros, Valorant (13+)',
      'Alt utstyr inkludert',
      'Fri tilgang til klubbdager på torsdager',
      'Tilgang til alle åpne dager og eventer',
      'Aldersgrense: 10 år',
    ],
    highlight: true,
    color: 'var(--color-accent)',
    note: '+ KIF årsavgift kr 250,-',
  },
  {
    name: 'Klubbmedlemskap',
    price: 'kr 600,-',
    period: 'per halvår',
    description: 'For deg som vil game med venner uten organisert lag',
    icon: Users,
    features: [
      'Tilgang hver torsdag 17:00–20:00',
      'Alle åpne dager og eventer inkludert',
      'Alt utstyr tilgjengelig',
      'Ingen krav om fast oppmøte',
      'Ingen aldersgrense',
      'Sosialt og uformelt miljø',
    ],
    highlight: false,
    color: 'var(--color-primary)',
    note: '+ KIF årsavgift kr 250,-',
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
            Våre <span className="text-gradient-accent">medlemskap</span>
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--color-text-muted)' }}>
            STOLL er en del av Kongsberg Idrettsforening (KIF). Innmelding skjer gjennom Spond.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {memberships.map((tier, i) => {
            const Icon = tier.icon
            return (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className={`relative rounded-2xl p-8 flex flex-col ${tier.highlight ? 'ring-2 ring-[#F2DE27]' : ''}`}
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
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${tier.color}22` }}>
                      <Icon size={24} style={{ color: tier.color }} />
                    </div>
                    <h3 className="text-xl font-black text-white">{tier.name}</h3>
                  </div>
                  <p className="text-3xl font-black mb-1" style={{ color: tier.color }}>
                    {tier.price}
                    <span className="text-sm font-medium ml-2" style={{ color: 'var(--color-text-muted)' }}>
                      {tier.period}
                    </span>
                  </p>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{tier.note}</p>
                  <p className="text-sm mt-2" style={{ color: 'var(--color-text-muted)' }}>{tier.description}</p>
                </div>

                <ul className="space-y-2.5 flex-1 mb-8">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                      <Check size={16} className="flex-shrink-0 mt-0.5" style={{ color: tier.color }} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <motion.a
                  href="https://spond.com/landing/signup"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center py-3 rounded-xl text-sm font-black uppercase tracking-wider transition-all"
                  style={tier.highlight
                    ? { background: tier.color, color: '#1C244B' }
                    : { border: `1px solid ${tier.color}`, color: tier.color }
                  }
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Meld deg inn via Spond
                </motion.a>
              </motion.div>
            )
          })}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-sm mt-8"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Velg «Kongsberg E-sportsenter» i Spond. Skriv ønsket spill og evt. lagkamerater i kommentarfeltet.
        </motion.p>
      </div>
    </section>
  )
}
