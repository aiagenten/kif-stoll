import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Calendar, Clock, MapPin, Users, Save } from 'lucide-react'
import { getAllEvents, createEvent, updateEvent, deleteEvent, uploadImage } from '@/lib/supabase'
import type { Event } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from '@/components/ui/dialog'

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
        <Button onClick={handleNew}>
          <Plus size={18} /> Nytt Event
        </Button>
      </div>

      {/* Form modal */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? 'Rediger Event' : 'Nytt Event'}</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-4">
            <div className="space-y-2">
              <Label>Tittel *</Label>
              <Input
                value={formData.title || ''}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder="F.eks. CS2 Turnering"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Dato *</Label>
                <Input
                  type="date"
                  value={formData.date || ''}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Tidspunkt</Label>
                <Input
                  type="time"
                  value={formData.time || ''}
                  onChange={e => setFormData({ ...formData, time: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={formData.event_type || 'arrangement'}
                  onChange={e => setFormData({ ...formData, event_type: e.target.value as Event['event_type'] })}
                >
                  {eventTypes.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Kapasitet</Label>
                <Input
                  type="number"
                  value={formData.capacity || ''}
                  onChange={e => setFormData({ ...formData, capacity: e.target.value ? parseInt(e.target.value) : undefined })}
                  placeholder="Maks deltakere"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Sted</Label>
              <Input
                value={formData.location || ''}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
                placeholder="STOLL Esportsenter"
              />
            </div>

            <div className="space-y-2">
              <Label>Beskrivelse</Label>
              <Textarea
                value={formData.description || ''}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="Info om eventet..."
              />
            </div>

            <div className="space-y-2">
              <Label>Bilde</Label>
              <Input type="file" accept="image/*" onChange={handleImageUpload} />
              {formData.image && (
                <img src={formData.image} alt="" className="mt-2 h-24 rounded-lg object-cover" />
              )}
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.booking_enabled || false}
                  onCheckedChange={checked => setFormData({ ...formData, booking_enabled: checked })}
                />
                <Label>Booking aktivert</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.published !== false}
                  onCheckedChange={checked => setFormData({ ...formData, published: checked })}
                />
                <Label>Publisert</Label>
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>
              Avbryt
            </Button>
            <Button onClick={handleSave} disabled={saving || !formData.title}>
              <Save size={16} /> {saving ? 'Lagrer...' : 'Lagre'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              <Card key={event.id} className="flex items-center gap-4 p-4">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-xl shrink-0"
                  style={{ background: `${typeInfo?.color || '#5F4E9D'}20` }}
                >
                  {typeInfo?.label.split(' ')[0] || '🎮'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold truncate">{event.title}</h3>
                    {!event.published && (
                      <Badge variant="secondary">Skjult</Badge>
                    )}
                    {event.booking_enabled && (
                      <Badge variant="success">Booking</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                    <span className="flex items-center gap-1"><Calendar size={13} /> {event.date}</span>
                    {event.time && <span className="flex items-center gap-1"><Clock size={13} /> {event.time}</span>}
                    {event.location && <span className="flex items-center gap-1"><MapPin size={13} /> {event.location}</span>}
                    {event.capacity && <span className="flex items-center gap-1"><Users size={13} /> {event.capacity}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(event)}
                  >
                    <Edit2 size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => event.id && handleDelete(event.id)}
                    className="text-gray-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
