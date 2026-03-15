import { motion, useInView } from 'framer-motion'
import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Phone, Mail, MapPin, Send, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { submitContactForm } from '../lib/supabase'
import { useContent } from '../contexts/ContentContext'

interface FormData {
  name: string
  email: string
  phone: string
  service: 'esport' | 'trening' | 'bursdag' | 'arrangement'
  message: string
}

const serviceOptions = [
  { value: 'esport', label: '🎮 Gaming / Esport' },
  { value: 'trening', label: '⚔️ Trening / Coaching' },
  { value: 'bursdag', label: '🎂 Bursdagsarrangement' },
  { value: 'arrangement', label: '🏆 Arrangement / Turnering' },
]

export default function Contact() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { getContentValue } = useContent()

  const phone = getContentValue('contact_phone', '55 55 55 55')
  const emailGeneral = getContentValue('contact_email_general', 'info@stoll.gg')
  const emailBooking = getContentValue('contact_email_booking', 'booking@stoll.gg')
  const address = getContentValue('contact_address', 'Bergen, Norge')
  const openWeekdays = getContentValue('opening_weekdays', 'Man-Fre: 14:00 - 22:00')
  const openSaturday = getContentValue('opening_saturday', 'Lørdag: 11:00 - 23:00')
  const openSunday = getContentValue('opening_sunday', 'Søndag: 12:00 - 20:00')

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>()

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    setError(null)
    try {
      await submitContactForm({
        name: data.name,
        email: data.email,
        phone: data.phone,
        service: data.service,
        message: data.message,
      })
      setIsSubmitted(true)
      reset()
    } catch (err) {
      console.error(err)
      setError('Noe gikk galt. Prøv igjen eller ta kontakt direkte.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="kontakt" className="py-24" style={{ background: 'var(--color-surface)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-xs font-bold uppercase tracking-widest mb-3 block" style={{ color: 'var(--color-accent)' }}>
            Ta kontakt
          </span>
          <h2 className="text-4xl lg:text-5xl font-black mb-4 text-white">
            Vi hører fra <span className="text-gradient-accent">deg</span>
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--color-text-muted)' }}>
            Spørsmål om booking, membership eller arrangementer? Send oss en melding!
          </p>
        </motion.div>

        <div ref={ref} className="grid lg:grid-cols-2 gap-12">
          {/* Contact info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {[
              { icon: Phone, label: 'Telefon', value: phone, href: `tel:${phone.replace(/\s/g, '')}` },
              { icon: Mail, label: 'E-post (Generelt)', value: emailGeneral, href: `mailto:${emailGeneral}` },
              { icon: Mail, label: 'E-post (Booking)', value: emailBooking, href: `mailto:${emailBooking}` },
              { icon: MapPin, label: 'Adresse', value: address, href: null },
            ].map(({ icon: Icon, label, value, href }) => (
              <div key={label} className="flex items-start gap-4 p-4 rounded-xl"
                style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(95,78,157,0.2)' }}>
                  <Icon size={18} style={{ color: 'var(--color-accent)' }} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
                  {href ? (
                    <a href={href} className="font-semibold text-white hover:text-yellow-400 transition-colors">{value}</a>
                  ) : (
                    <p className="font-semibold text-white">{value}</p>
                  )}
                </div>
              </div>
            ))}

            {/* Opening hours */}
            <div className="p-4 rounded-xl" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(95,78,157,0.2)' }}>
                  <Clock size={18} style={{ color: 'var(--color-accent)' }} />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Åpningstider</p>
              </div>
              <div className="space-y-1 pl-13 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                <p>{openWeekdays}</p>
                <p>{openSaturday}</p>
                <p>{openSunday}</p>
              </div>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {isSubmitted ? (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="h-full flex flex-col items-center justify-center text-center p-8 rounded-2xl"
                style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}
              >
                <CheckCircle size={56} className="text-green-400 mb-4" />
                <h3 className="text-2xl font-black text-white mb-2">Melding sendt! 🎉</h3>
                <p style={{ color: 'var(--color-text-muted)' }}>Vi svarer deg innen 24 timer.</p>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="mt-6 px-6 py-2 rounded-full text-sm font-bold transition-colors"
                  style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
                >
                  Send ny melding
                </button>
              </motion.div>
            ) : (
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="p-6 sm:p-8 rounded-2xl space-y-4"
                style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}
              >
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <input
                      {...register('name', { required: 'Navn er påkrevd' })}
                      placeholder="Fullt navn *"
                      className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 outline-none text-sm"
                      style={{ background: 'var(--color-surface)', border: `1px solid ${errors.name ? '#ef4444' : 'var(--color-border)'}` }}
                    />
                    {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
                  </div>
                  <div>
                    <input
                      {...register('email', { required: 'E-post er påkrevd' })}
                      type="email"
                      placeholder="E-post *"
                      className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 outline-none text-sm"
                      style={{ background: 'var(--color-surface)', border: `1px solid ${errors.email ? '#ef4444' : 'var(--color-border)'}` }}
                    />
                    {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
                  </div>
                </div>

                <input
                  {...register('phone')}
                  placeholder="Telefon"
                  className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 outline-none text-sm"
                  style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                />

                <select
                  {...register('service', { required: true })}
                  className="w-full px-4 py-3 rounded-xl text-white outline-none text-sm"
                  style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                >
                  <option value="" style={{ background: 'var(--color-surface)' }}>Velg kategori *</option>
                  {serviceOptions.map(opt => (
                    <option key={opt.value} value={opt.value} style={{ background: 'var(--color-surface)' }}>{opt.label}</option>
                  ))}
                </select>

                <textarea
                  {...register('message', { required: 'Melding er påkrevd' })}
                  placeholder="Din melding *"
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 outline-none text-sm resize-none"
                  style={{ background: 'var(--color-surface)', border: `1px solid ${errors.message ? '#ef4444' : 'var(--color-border)'}` }}
                />

                {error && (
                  <div className="flex items-center gap-2 text-red-400 text-sm">
                    <AlertCircle size={16} />
                    <span>{error}</span>
                  </div>
                )}

                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-accent w-full py-3 rounded-xl font-black uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Send size={16} />
                  {isSubmitting ? 'Sender...' : 'Send Melding'}
                </motion.button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
