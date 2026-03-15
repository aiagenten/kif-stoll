import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit2, Trash2, Calendar, Clock, MapPin, Users, Save, X } from 'lucide-react'
import { getAllEvents, createEvent, updateEvent, deleteEvent, uploadImage } from '../../lib/supabase'
import type { Event } from '../../lib/supabase'

const eventTypes = [
  { value: 'tournament', label: '🏆 Turnering', color: '#F2DE27' },
  { value: 'trening', label: '⚔️ Trening', color: '#10b981' },
  { value: 'arrangement', label: '🎮 Arrangement', color: '#5F4E9D' },
  { value: 'bursdag', label: '🎂 Bursdag', color: '#ef4444' },
]

const emptyEvent: Partial<Event> = {
  title: '',
  description: '',
  date: new Date().toISOString().split('T')[0],
  time: '18:00',
  location: 'STOLL Esportsenter',
  image: '',
  event_type: 'arrangement',
  capacity: undefined,
  booking_enabled: false,
  published: true,
}

export default function AdminEvents() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Event | null>(null)
  const [formData, setFormData] = useState<Partial<Event>>(emptyEvent)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    setLoading(true)
    try {
      const data = await getAllEvents()
      setEvents(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (event: Event) => {
    setEditing(event)
    setFormData(event)
    setShowForm(true)
  }

  const handleNew = () => {
    setEditing(null)
    setFormData(emptyEvent)
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!formData.title || !formData.date) return
    setSaving(true)
    try {
      if (editing?.id) {
        await updateEvent(editing.id, formData)
      } else {
        await createEvent(formData as Omit<Event, 'id' | 'created_at' | 'updated_at'>)
      }
      await loadEvents()
      setShowForm(false)
      setEditing(null)
      setFormData(emptyEvent)
    } catch (err) {
      console.error(err)
      alert('Kunne ikke lagre event')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Slett dette eventet?')) return
    try {
      await deleteEvent(id)
      await loadEvents()
    } catch (err) {
      console.error(err)
      alert('Kunne ikke slette')
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = await uploadImage(file, 'events')
    if (url) setFormData({ ...formData, image: url })
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Events</h1>
          <p className="text-gray-600">Administrer turneringer, treninger og arrangementer</p>
        </div>
        <button
          onClick={handleNew}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <Plus size={18} /> Nytt Event
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold">{editing ? 'Rediger Event' : 'Nytt Event'}</h2>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tittel *</label>
                <input
                  value={formData.title || ''}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="F.eks. CS2 Turnering"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Dato *</label>
                  <input
                    type="date"
                    value={formData.date || ''}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tidspunkt</label>
                  <input
                    type="time"
                    value={formData.time || ''}
                    onChange={e => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select
                    value={formData.event_type || 'arrangement'}
                    onChange={e => setFormData({ ...formData, event_type: e.target.value as Event['event_type'] })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    {eventTypes.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Kapasitet</label>
                  <input
                    type="number"
                    value={formData.capacity || ''}
                    onChange={e => setFormData({ ...formData, capacity: e.target.value ? parseInt(e.target.value) : undefined })}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Maks deltakere"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Sted</label>
                <input
                  value={formData.location || ''}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="STOLL Esportsenter"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Beskrivelse</label>
                <textarea
                  value={formData.description || ''}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Info om eventet..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Bilde</label>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="text-sm" />
                {formData.image && (
                  <img src={formData.image} alt="" className="mt-2 h-24 rounded-lg object-cover" />
                )}
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.booking_enabled || false}
                    onChange={e => setFormData({ ...formData, booking_enabled: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">Booking aktivert</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.published !== false}
                    onChange={e => setFormData({ ...formData, published: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">Publisert</span>
                </label>
              </div>
            </div>
            <div className="p-6 border-t flex justify-end gap-3">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                Avbryt
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !formData.title}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                <Save size={16} /> {saving ? 'Lagrer...' : 'Lagre'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Events list */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Laster...</div>
      ) : events.length === 0 ? (
        <div className="text-center py-12">
          <Calendar size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">Ingen events enda</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map(event => {
            const typeInfo = eventTypes.find(t => t.value === event.event_type)
            return (
              <div
                key={event.id}
                className="flex items-center gap-4 p-4 bg-white rounded-xl border hover:shadow-sm transition-shadow"
              >
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-xl"
                  style={{ background: `${typeInfo?.color || '#5F4E9D'}20` }}
                >
                  {typeInfo?.label.split(' ')[0] || '🎮'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold truncate">{event.title}</h3>
                    {!event.published && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">Skjult</span>
                    )}
                    {event.booking_enabled && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Booking</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                    <span className="flex items-center gap-1"><Calendar size={13} /> {event.date}</span>
                    {event.time && <span className="flex items-center gap-1"><Clock size={13} /> {event.time}</span>}
                    {event.location && <span className="flex items-center gap-1"><MapPin size={13} /> {event.location}</span>}
                    {event.capacity && <span className="flex items-center gap-1"><Users size={13} /> {event.capacity}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(event)}
                    className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => event.id && handleDelete(event.id)}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
