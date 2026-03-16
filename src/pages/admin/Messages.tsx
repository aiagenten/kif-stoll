import { useEffect, useState } from 'react'
import {
  MessageSquare,
  Search,
  Filter,
  Trash2,
  Mail,
  Phone,
  Gamepad2,
  X,
  Clock
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

interface Message {
  id: string
  created_at: string
  name: string
  email: string
  phone: string
  reg_number?: string
  service: string
  message: string
  read?: boolean
}

export default function AdminMessages() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterService, setFilterService] = useState<string>('')
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_submissions')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteMessage = async (id: string) => {
    if (!confirm('Er du sikker på at du vil slette denne meldingen?')) return

    try {
      const { error } = await supabase
        .from('contact_submissions')
        .delete()
        .eq('id', id)

      if (error) throw error
      setMessages(prev => prev.filter(m => m.id !== id))
      if (selectedMessage?.id === id) setSelectedMessage(null)
    } catch (error) {
      console.error('Error deleting message:', error)
    }
  }

  const filteredMessages = messages.filter(msg => {
    const matchesSearch =
      msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.message.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = filterService ? msg.service === filterService : true

    return matchesSearch && matchesFilter
  })

  const getServiceColor = (service: string) => {
    switch (service) {
      case 'esport': return 'bg-blue-100 text-blue-700'
      case 'trening': return 'bg-purple-100 text-purple-700'
      case 'bursdag': return 'bg-pink-100 text-pink-700'
      case 'arrangement': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getServiceLabel = (service: string) => {
    switch (service) {
      case 'esport': return 'Gaming / Esport'
      case 'trening': return 'Trening / Coaching'
      case 'bursdag': return 'Bursdag'
      case 'arrangement': return 'Arrangement'
      default: return service
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with search and filter */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Sok i meldinger..."
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <Select
            value={filterService}
            onChange={(e) => setFilterService(e.target.value)}
            className="w-auto"
          >
            <option value="">Alle tjenester</option>
            <option value="esport">Gaming / Esport</option>
            <option value="trening">Trening / Coaching</option>
            <option value="bursdag">Bursdag</option>
            <option value="arrangement">Arrangement</option>
          </Select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-[#1C244B]">{messages.length}</div>
            <div className="text-gray-500 text-sm">Totalt</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {messages.filter(m => m.service === 'esport').length}
            </div>
            <div className="text-gray-500 text-sm">Gaming / Esport</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {messages.filter(m => m.service === 'trening').length}
            </div>
            <div className="text-gray-500 text-sm">Trening</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {messages.filter(m => m.service === 'arrangement').length}
            </div>
            <div className="text-gray-500 text-sm">Arrangement</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Messages list */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#5F4E9D]" />
              <span>Meldinger ({filteredMessages.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-gray-500">Laster...</div>
            ) : filteredMessages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm || filterService ? 'Ingen meldinger matcher soket' : 'Ingen meldinger enna'}
              </div>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {filteredMessages.map((msg) => (
                  <div
                    key={msg.id}
                    onClick={() => setSelectedMessage(msg)}
                    className={`p-4 rounded-lg cursor-pointer transition-colors ${
                      selectedMessage?.id === msg.id
                        ? 'bg-[#5F4E9D]/10 border border-[#5F4E9D]/30'
                        : 'bg-gray-50 hover:bg-gray-100 border border-transparent'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 truncate">{msg.name}</span>
                          <Badge className={getServiceColor(msg.service)}>
                            {getServiceLabel(msg.service)}
                          </Badge>
                        </div>
                        <div className="text-gray-500 text-sm truncate">{msg.email}</div>
                        <div className="text-gray-600 text-sm mt-1 line-clamp-2">{msg.message}</div>
                      </div>
                      <div className="text-gray-400 text-xs whitespace-nowrap ml-4">
                        {new Date(msg.created_at).toLocaleDateString('no-NO')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Message detail */}
        {selectedMessage ? (
          <Card key={selectedMessage.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Detaljer</CardTitle>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteMessage(selectedMessage.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedMessage(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-gray-500 text-sm mb-1">Navn</div>
                <div className="text-gray-900 text-lg font-medium">{selectedMessage.name}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-gray-500 text-sm mb-1">E-post</div>
                  <a
                    href={`mailto:${selectedMessage.email}`}
                    className="flex items-center gap-2 text-[#5F4E9D] hover:underline"
                  >
                    <Mail className="w-4 h-4" />
                    <span>{selectedMessage.email}</span>
                  </a>
                </div>
                <div>
                  <div className="text-gray-500 text-sm mb-1">Telefon</div>
                  <a
                    href={`tel:${selectedMessage.phone}`}
                    className="flex items-center gap-2 text-[#5F4E9D] hover:underline"
                  >
                    <Phone className="w-4 h-4" />
                    <span>{selectedMessage.phone}</span>
                  </a>
                </div>
              </div>

              {selectedMessage.reg_number && (
                <div>
                  <div className="text-gray-500 text-sm mb-1">Referanse</div>
                  <div className="flex items-center gap-2 text-gray-900">
                    <Gamepad2 className="w-4 h-4 text-[#5F4E9D]" />
                    <span>{selectedMessage.reg_number}</span>
                  </div>
                </div>
              )}

              <div>
                <div className="text-gray-500 text-sm mb-1">Tjeneste</div>
                <Badge className={getServiceColor(selectedMessage.service)}>
                  {getServiceLabel(selectedMessage.service)}
                </Badge>
              </div>

              <div>
                <div className="text-gray-500 text-sm mb-1">Melding</div>
                <div className="bg-gray-50 rounded-lg p-4 text-gray-700 whitespace-pre-wrap">
                  {selectedMessage.message}
                </div>
              </div>

              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <Clock className="w-4 h-4" />
                <span>
                  Mottatt {new Date(selectedMessage.created_at).toLocaleString('no-NO')}
                </span>
              </div>

              {/* Quick actions */}
              <Separator />
              <div className="flex gap-3">
                <Button variant="accent" className="flex-1" asChild>
                  <a href={`mailto:${selectedMessage.email}?subject=Re: Henvendelse til STOLL Esportsenter`}>
                    Svar på e-post
                  </a>
                </Button>
                <Button variant="outline" className="flex-1" asChild>
                  <a href={`tel:${selectedMessage.phone}`}>
                    Ring tilbake
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="flex items-center justify-center min-h-[400px]">
            <div className="text-center text-gray-400">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Velg en melding for å se detaljer</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
