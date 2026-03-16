import { useState, useEffect } from 'react'
import { Check, X, Clock, Mail, Phone, Users, Calendar, AlertCircle } from 'lucide-react'
import { getBookings, updateBookingStatus } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

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
  pending: { label: 'Venter', color: 'bg-yellow-100 text-yellow-800', icon: Clock, badge: 'warning' as const },
  confirmed: { label: 'Bekreftet', color: 'bg-green-100 text-green-800', icon: Check, badge: 'success' as const },
  cancelled: { label: 'Avvist', color: 'bg-red-100 text-red-800', icon: X, badge: 'destructive' as const },
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

  const filterLabels: Record<string, string> = {
    all: 'Alle',
    pending: statusConfig.pending.label,
    confirmed: statusConfig.confirmed.label,
    cancelled: statusConfig.cancelled.label,
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bookinger</h1>
          <p className="text-gray-600">Administrer innkommende bookinger</p>
        </div>
        {pendingCount > 0 && (
          <Badge variant="warning" className="flex items-center gap-2 px-3 py-1.5 text-sm">
            <AlertCircle size={16} />
            {pendingCount} venter på svar
          </Badge>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {(['all', 'pending', 'confirmed', 'cancelled'] as const).map(status => (
          <Button
            key={status}
            variant={filter === status ? 'default' : 'secondary'}
            size="sm"
            onClick={() => setFilter(status)}
          >
            {filterLabels[status]}
            {status !== 'all' && (
              <span className="ml-1.5 opacity-70">
                ({bookings.filter(b => b.status === status).length})
              </span>
            )}
          </Button>
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
              <Card key={booking.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{booking.name}</h3>
                      <Badge variant={config.badge} className="gap-1">
                        <StatusIcon size={12} />
                        {config.label}
                      </Badge>
                    </div>

                    {booking.events && (
                      <div className="text-sm text-[#5F4E9D] font-medium mb-2">
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
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleStatusChange(booking.id, 'confirmed')}
                      >
                        <Check size={14} /> Godkjenn
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleStatusChange(booking.id, 'cancelled')}
                      >
                        <X size={14} /> Avvis
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
