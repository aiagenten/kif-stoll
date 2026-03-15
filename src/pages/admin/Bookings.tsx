import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Check, X, Clock, Mail, Phone, Users, Calendar, AlertCircle } from 'lucide-react'
import { getBookings, updateBookingStatus } from '../../lib/supabase'

interface BookingWithEvent {
  id: string
  created_at: string
  event_id: string | null
  name: string
  email: string
  phone: string | null
  participants: number
  status: 'pending' | 'confirmed' | 'cancelled'
  notes: string | null
  events?: { title: string; date: string } | null
}

const statusConfig = {
  pending: { label: 'Venter', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  confirmed: { label: 'Bekreftet', color: 'bg-green-100 text-green-800', icon: Check },
  cancelled: { label: 'Avvist', color: 'bg-red-100 text-red-800', icon: X },
}

export default function AdminBookings() {
  const [bookings, setBookings] = useState<BookingWithEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all')

  useEffect(() => {
    loadBookings()
  }, [])

  const loadBookings = async () => {
    setLoading(true)
    try {
      const data = await getBookings()
      setBookings(data as BookingWithEvent[])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (id: string, status: 'confirmed' | 'cancelled') => {
    try {
      await updateBookingStatus(id, status)
      await loadBookings()
    } catch (err) {
      console.error(err)
      alert('Kunne ikke oppdatere status')
    }
  }

  const filteredBookings = filter === 'all' 
    ? bookings 
    : bookings.filter(b => b.status === filter)

  const pendingCount = bookings.filter(b => b.status === 'pending').length

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bookinger</h1>
          <p className="text-gray-600">Administrer innkommende bookinger</p>
        </div>
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-medium">
            <AlertCircle size={16} />
            {pendingCount} venter på svar
          </div>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {(['all', 'pending', 'confirmed', 'cancelled'] as const).map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === status
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {status === 'all' ? 'Alle' : statusConfig[status].label}
            {status !== 'all' && (
              <span className="ml-1.5 opacity-70">
                ({bookings.filter(b => b.status === status).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Laster...</div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-12">
          <Calendar size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">
            {filter === 'all' ? 'Ingen bookinger enda' : `Ingen ${statusConfig[filter as keyof typeof statusConfig]?.label.toLowerCase()} bookinger`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredBookings.map(booking => {
            const config = statusConfig[booking.status]
            const StatusIcon = config.icon
            return (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{booking.name}</h3>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                        <StatusIcon size={12} />
                        {config.label}
                      </span>
                    </div>

                    {booking.events && (
                      <div className="text-sm text-purple-600 font-medium mb-2">
                        📅 {booking.events.title} — {booking.events.date}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Mail size={14} /> {booking.email}
                      </span>
                      {booking.phone && (
                        <span className="flex items-center gap-1">
                          <Phone size={14} /> {booking.phone}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Users size={14} /> {booking.participants} deltaker(e)
                      </span>
                    </div>

                    {booking.notes && (
                      <p className="mt-2 text-sm text-gray-500 bg-gray-50 p-2 rounded">
                        💬 {booking.notes}
                      </p>
                    )}

                    <p className="text-xs text-gray-400 mt-2">
                      Mottatt: {new Date(booking.created_at).toLocaleString('nb-NO')}
                    </p>
                  </div>

                  {booking.status === 'pending' && (
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleStatusChange(booking.id, 'confirmed')}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                      >
                        <Check size={14} /> Godkjenn
                      </button>
                      <button
                        onClick={() => handleStatusChange(booking.id, 'cancelled')}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
                      >
                        <X size={14} /> Avvis
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
