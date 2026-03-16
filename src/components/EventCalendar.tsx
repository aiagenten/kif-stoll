import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Clock, MapPin, Users, X, ChevronRight } from 'lucide-react'
import { getEvents } from '../lib/supabase'
import type { Event } from '../lib/supabase'
import BookingForm from './BookingForm'

const eventTypeColors: Record<string, string> = {
  tournament: '#F2DE27',
  trening: '#10b981',
  arrangement: '#5F4E9D',
  bursdag: '#ef4444',
}

const eventTypeLabels: Record<string, string> = {
  tournament: '🏆 Turnering',
  trening: '⚔️ Trening',
  arrangement: '🎮 Arrangement',
  bursdag: '🎂 Bursdag',
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('nb-NO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

function formatShortDate(dateStr: string) {
  const d = new Date(dateStr)
  return {
    day: d.toLocaleDateString('nb-NO', { day: 'numeric' }),
    month: d.toLocaleDateString('nb-NO', { month: 'short' }),
    weekday: d.toLocaleDateString('nb-NO', { weekday: 'short' }),
  }
}

// Generate upcoming date for a given weekday (0=Sunday, 1=Monday, ..., 6=Saturday)
function nextWeekday(dayOfWeek: number, weeksAhead = 0): string {
  const today = new Date()
  const todayDay = today.getDay()
  let daysUntil = (dayOfWeek - todayDay + 7) % 7
  if (daysUntil === 0) daysUntil = 7 // Don't use today itself, use next occurrence
  daysUntil += weeksAhead * 7
  const result = new Date(today)
  result.setDate(today.getDate() + daysUntil)
  return result.toISOString().split('T')[0]
}

// Static test events as fallback when no Supabase events exist
const TEST_EVENTS: Event[] = ([
  // Treninger — next 3 Mondays
  {
    id: 'test-trening-1',
    title: 'STOLL Ukentlig Trening',
    description: 'Bli med på vår faste ukentlige trening! Åpent for alle nivåer — fra nybegynnere til seriøse esport-spillere. Vi fokuserer på CS2, Valorant og Rocket League. Ta med headset og godt humør! 🎮',
    date: nextWeekday(1, 0),
    time: '17:00 - 19:00',
    location: 'STOLL Esportsenter, Bergen',
    event_type: 'trening' as const,
    capacity: 30,
    booking_enabled: true,
    published: true,
  },
  {
    id: 'test-trening-2',
    title: 'STOLL Ukentlig Trening',
    description: 'Bli med på vår faste ukentlige trening! Åpent for alle nivåer — fra nybegynnere til seriøse esport-spillere. Vi fokuserer på CS2, Valorant og Rocket League. 🎮',
    date: nextWeekday(1, 1),
    time: '17:00 - 19:00',
    location: 'STOLL Esportsenter, Bergen',
    event_type: 'trening' as const,
    capacity: 30,
    booking_enabled: true,
    published: true,
  },
  {
    id: 'test-trening-3',
    title: 'STOLL Ukentlig Trening',
    description: 'Bli med på vår faste ukentlige trening! Åpent for alle nivåer. Vi fokuserer på CS2, Valorant og Rocket League. 🎮',
    date: nextWeekday(1, 2),
    time: '17:00 - 19:00',
    location: 'STOLL Esportsenter, Bergen',
    event_type: 'trening' as const,
    capacity: 30,
    booking_enabled: true,
    published: true,
  },
  // Fredagsturnering — next 2 Fridays
  {
    id: 'test-tournament-1',
    title: 'STOLL Fredagsturnering',
    description: 'Vår populære fredagsturnering er tilbake! Meld laget ditt på og kjempe om pengepremier og æren av å kalle seg STOLL-mester. Denne uken: CS2 5v5. Premier til topp 3 lag! 🏆',
    date: nextWeekday(5, 0),
    time: '18:00 - 22:00',
    location: 'STOLL Esportsenter, Bergen',
    event_type: 'tournament' as const,
    capacity: 64,
    booking_enabled: true,
    published: true,
  },
  {
    id: 'test-tournament-2',
    title: 'STOLL Fredagsturnering — Valorant',
    description: 'Fredagsturnering i Valorant! 5v5, dobbel-eliminasjon bracket. Alle rank-nivåer er velkomne. Premier til topp 3 lag. Registrer laget ditt innen torsdag kveld. 🏆',
    date: nextWeekday(5, 1),
    time: '18:00 - 22:00',
    location: 'STOLL Esportsenter, Bergen',
    event_type: 'tournament' as const,
    capacity: 64,
    booking_enabled: true,
    published: true,
  },
  // Åpen gaming — next 2 Saturdays
  {
    id: 'test-arrangement-1',
    title: 'Åpen Gaming — Lørdagssession',
    description: 'Lørdag er fri-gaming dag på STOLL! Sleng deg ned på en av våre topputstyrte PC-er og spill det du vil. Venner, familie og alle er velkomne. Vi har snacks, drikke og god stemning. 🎮☕',
    date: nextWeekday(6, 0),
    time: '12:00 - 17:00',
    location: 'STOLL Esportsenter, Bergen',
    event_type: 'arrangement' as const,
    capacity: 50,
    booking_enabled: false,
    published: true,
  },
  {
    id: 'test-arrangement-2',
    title: 'Åpen Gaming — Lørdagssession',
    description: 'Fri gaming-dag for hele familien! Kom innom når det passer, spill favorittspillene dine og møt andre gamere i Bergen. Ingen booking nødvendig for åpen gaming. 🎮',
    date: nextWeekday(6, 1),
    time: '12:00 - 17:00',
    location: 'STOLL Esportsenter, Bergen',
    event_type: 'arrangement' as const,
    capacity: 50,
    booking_enabled: false,
    published: true,
  },
] as Event[]).sort((a, b) => a.date.localeCompare(b.date))

export default function EventCalendar() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [showBooking, setShowBooking] = useState(false)

  useEffect(() => {
    getEvents()
      .then(data => {
        // Use test events as fallback if no Supabase events exist
        setEvents(data.length > 0 ? data : TEST_EVENTS)
      })
      .catch(() => setEvents(TEST_EVENTS))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section id="events" className="py-24" style={{ background: 'var(--color-surface)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-xs font-bold uppercase tracking-widest mb-3 block" style={{ color: 'var(--color-accent)' }}>
            Hva skjer på STOLL
          </span>
          <h2 className="text-4xl lg:text-5xl font-black mb-4 text-white">
            Kommende <span className="text-gradient-primary">Events</span>
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--color-text-muted)' }}>
            Fra turneringer til bursdagsarrangementer — hold deg oppdatert på hva som skjer.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : events.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Calendar size={48} className="mx-auto mb-4 opacity-30" />
            <p style={{ color: 'var(--color-text-muted)' }} className="text-lg">
              Ingen kommende events. Sjekk tilbake snart!
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {events.map((event, i) => {
              const { day, month, weekday } = formatShortDate(event.date)
              const color = eventTypeColors[event.event_type] || '#5F4E9D'

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-center gap-4 sm:gap-6 p-4 sm:p-6 rounded-2xl cursor-pointer group"
                  style={{
                    background: 'var(--color-bg)',
                    border: '1px solid var(--color-border)',
                    transition: 'all 0.3s ease',
                  }}
                  whileHover={{ borderColor: color, x: 4 }}
                  onClick={() => { setSelectedEvent(event); setShowBooking(false) }}
                >
                  {/* Date box */}
                  <div
                    className="flex-shrink-0 w-16 h-16 rounded-xl flex flex-col items-center justify-center text-center"
                    style={{ background: `${color}20`, border: `2px solid ${color}50` }}
                  >
                    <span className="text-xl font-black leading-none" style={{ color }}>{day}</span>
                    <span className="text-xs font-bold uppercase" style={{ color }}>{month}</span>
                    <span className="text-xs opacity-60 text-white">{weekday}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ background: `${color}20`, color }}
                      >
                        {eventTypeLabels[event.event_type] || event.event_type}
                      </span>
                      {event.booking_enabled && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">
                          Booking åpen
                        </span>
                      )}
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-white truncate">{event.title}</h3>
                    <div className="flex flex-wrap gap-3 mt-1">
                      {event.time && (
                        <span className="flex items-center gap-1 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                          <Clock size={13} /> {event.time}
                        </span>
                      )}
                      {event.location && (
                        <span className="flex items-center gap-1 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                          <MapPin size={13} /> {event.location}
                        </span>
                      )}
                      {event.capacity && (
                        <span className="flex items-center gap-1 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                          <Users size={13} /> Maks {event.capacity}
                        </span>
                      )}
                    </div>
                  </div>

                  <ChevronRight size={20} className="flex-shrink-0 opacity-40 group-hover:opacity-100 transition-opacity" style={{ color }} />
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Event Detail Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.8)' }}
            onClick={() => setSelectedEvent(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg rounded-2xl overflow-hidden"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
              onClick={(e) => e.stopPropagation()}
            >
              {selectedEvent.image && (
                <img src={selectedEvent.image} alt={selectedEvent.title} className="w-full h-48 object-cover" />
              )}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span
                      className="text-xs font-bold px-2 py-1 rounded-full mb-2 inline-block"
                      style={{
                        background: `${eventTypeColors[selectedEvent.event_type] || '#5F4E9D'}20`,
                        color: eventTypeColors[selectedEvent.event_type] || '#5F4E9D',
                      }}
                    >
                      {eventTypeLabels[selectedEvent.event_type] || selectedEvent.event_type}
                    </span>
                    <h2 className="text-2xl font-black text-white">{selectedEvent.title}</h2>
                  </div>
                  <button onClick={() => setSelectedEvent(null)} className="p-2 rounded-full hover:bg-white/10 transition-colors" style={{ color: 'var(--color-text-muted)' }}>
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    <Calendar size={15} style={{ color: 'var(--color-accent)' }} />
                    <span>{formatDate(selectedEvent.date)}</span>
                  </div>
                  {selectedEvent.time && (
                    <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                      <Clock size={15} style={{ color: 'var(--color-accent)' }} />
                      <span>{selectedEvent.time}</span>
                    </div>
                  )}
                  {selectedEvent.location && (
                    <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                      <MapPin size={15} style={{ color: 'var(--color-accent)' }} />
                      <span>{selectedEvent.location}</span>
                    </div>
                  )}
                  {selectedEvent.capacity && (
                    <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                      <Users size={15} style={{ color: 'var(--color-accent)' }} />
                      <span>Maks {selectedEvent.capacity} deltakere</span>
                    </div>
                  )}
                </div>

                {selectedEvent.description && (
                  <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--color-text-muted)' }}>
                    {selectedEvent.description}
                  </p>
                )}

                {selectedEvent.booking_enabled && !showBooking && (
                  <motion.button
                    className="btn-accent w-full py-3 rounded-xl font-black uppercase tracking-wider"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowBooking(true)}
                  >
                    Reserver Plass
                  </motion.button>
                )}

                {selectedEvent.booking_enabled && showBooking && selectedEvent.id && (
                  <BookingForm
                    eventId={selectedEvent.id}
                    eventTitle={selectedEvent.title}
                    onSuccess={() => { setShowBooking(false); setSelectedEvent(null) }}
                    onCancel={() => setShowBooking(false)}
                  />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
