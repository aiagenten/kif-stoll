import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { Check, Loader2 } from 'lucide-react'
import { createBooking } from '../lib/supabase'

interface BookingFormData {
  name: string
  email: string
  phone: string
  participants: number
  notes: string
}

interface BookingFormProps {
  eventId: string
  eventTitle: string
  onSuccess: () => void
  onCancel: () => void
}

export default function BookingForm({ eventId, eventTitle, onSuccess, onCancel }: BookingFormProps) {
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<BookingFormData>({
    defaultValues: { participants: 1 }
  })

  const onSubmit = async (data: BookingFormData) => {
    setSubmitting(true)
    try {
      await createBooking({
        event_id: eventId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        participants: data.participants,
        notes: data.notes,
      })
      setSuccess(true)
      setTimeout(onSuccess, 2000)
    } catch (err) {
      console.error('Booking error:', err)
      alert('Noe gikk galt. Prøv igjen.')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center py-6"
      >
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: 'rgba(16,185,129,0.2)', border: '2px solid #10b981' }}>
          <Check size={28} className="text-green-400" />
        </div>
        <h3 className="text-xl font-black text-white mb-2">Booking mottatt! 🎉</h3>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Vi sender bekreftelse til din e-post snart.
        </p>
      </motion.div>
    )
  }

  return (
    <div>
      <h3 className="text-lg font-black text-white mb-4">Book plass — {eventTitle}</h3>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div>
          <input
            {...register('name', { required: 'Navn er påkrevd' })}
            placeholder="Navn *"
            className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-gray-500 outline-none focus:ring-2"
            style={{
              background: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
            }}
          />
          {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <input
            {...register('email', { required: 'E-post er påkrevd', pattern: { value: /^\S+@\S+$/i, message: 'Ugyldig e-post' } })}
            type="email"
            placeholder="E-post *"
            className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-gray-500 outline-none"
            style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}
          />
          {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <input
            {...register('phone')}
            placeholder="Telefon"
            className="px-4 py-2.5 rounded-xl text-sm text-white placeholder-gray-500 outline-none"
            style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}
          />
          <input
            {...register('participants', { required: true, min: 1 })}
            type="number"
            min="1"
            placeholder="Antall"
            className="px-4 py-2.5 rounded-xl text-sm text-white placeholder-gray-500 outline-none"
            style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}
          />
        </div>

        <textarea
          {...register('notes')}
          placeholder="Kommentar (valgfri)"
          rows={2}
          className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-gray-500 outline-none resize-none"
          style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}
        />

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors"
            style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
          >
            Avbryt
          </button>
          <motion.button
            type="submit"
            disabled={submitting}
            className="flex-1 py-2.5 rounded-xl text-sm font-black btn-accent flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
            {submitting ? 'Sender...' : 'Send booking'}
          </motion.button>
        </div>
      </form>
    </div>
  )
}
