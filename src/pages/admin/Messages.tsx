import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
      case 'esport': return 'bg-blue-500/10 text-blue-400'
      case 'trening': return 'bg-purple-500/10 text-purple-400'
      case 'bursdag': return 'bg-pink-500/10 text-pink-400'
      case 'arrangement': return 'bg-green-500/10 text-green-400'
      default: return 'bg-gray-500/10 text-gray-400'
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
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Søk i meldinger..."
            className="w-full pl-12 pr-4 py-3 rounded-lg bg-[#2a2a2a] border border-gray-700 text-white focus:border-[#c9a227] focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <select
            value={filterService}
            onChange={(e) => setFilterService(e.target.value)}
            className="px-4 py-3 rounded-lg bg-[#2a2a2a] border border-gray-700 text-white focus:border-[#c9a227] focus:outline-none"
          >
            <option value="">Alle tjenester</option>
            <option value="esport">Gaming / Esport</option>
            <option value="trening">Trening / Coaching</option>
            <option value="bursdag">Bursdag</option>
            <option value="arrangement">Arrangement</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-white">{messages.length}</div>
          <div className="text-gray-500 text-sm">Totalt</div>
        </div>
        <div className="glass rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">
            {messages.filter(m => m.service === 'esport').length}
          </div>
          <div className="text-gray-500 text-sm">Gaming / Esport</div>
        </div>
        <div className="glass rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-400">
            {messages.filter(m => m.service === 'trening').length}
          </div>
          <div className="text-gray-500 text-sm">Trening</div>
        </div>
        <div className="glass rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-400">
            {messages.filter(m => m.service === 'arrangement').length}
          </div>
          <div className="text-gray-500 text-sm">Arrangement</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Messages list */}
        <div className="glass rounded-xl p-4">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-[#c9a227]" />
            <span>Meldinger ({filteredMessages.length})</span>
          </h2>

          {loading ? (
            <div className="text-center py-8 text-gray-500">Laster...</div>
          ) : filteredMessages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm || filterService ? 'Ingen meldinger matcher søket' : 'Ingen meldinger ennå'}
            </div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredMessages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => setSelectedMessage(msg)}
                  className={`p-4 rounded-lg cursor-pointer transition-colors ${
                    selectedMessage?.id === msg.id 
                      ? 'bg-[#c9a227]/10 border border-[#c9a227]/30' 
                      : 'bg-[#2a2a2a] hover:bg-[#3a3a3a]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-white truncate">{msg.name}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getServiceColor(msg.service)}`}>
                          {getServiceLabel(msg.service)}
                        </span>
                      </div>
                      <div className="text-gray-500 text-sm truncate">{msg.email}</div>
                      <div className="text-gray-400 text-sm mt-1 line-clamp-2">{msg.message}</div>
                    </div>
                    <div className="text-gray-600 text-xs whitespace-nowrap ml-4">
                      {new Date(msg.created_at).toLocaleDateString('no-NO')}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Message detail */}
        <AnimatePresence mode="wait">
          {selectedMessage ? (
            <motion.div
              key={selectedMessage.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="glass rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white">Detaljer</h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => deleteMessage(selectedMessage.id)}
                    className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setSelectedMessage(null)}
                    className="p-2 rounded-lg text-gray-400 hover:bg-white/5 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-gray-500 text-sm mb-1">Navn</div>
                  <div className="text-white text-lg font-medium">{selectedMessage.name}</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-gray-500 text-sm mb-1">E-post</div>
                    <a 
                      href={`mailto:${selectedMessage.email}`}
                      className="flex items-center space-x-2 text-[#c9a227] hover:underline"
                    >
                      <Mail className="w-4 h-4" />
                      <span>{selectedMessage.email}</span>
                    </a>
                  </div>
                  <div>
                    <div className="text-gray-500 text-sm mb-1">Telefon</div>
                    <a 
                      href={`tel:${selectedMessage.phone}`}
                      className="flex items-center space-x-2 text-[#c9a227] hover:underline"
                    >
                      <Phone className="w-4 h-4" />
                      <span>{selectedMessage.phone}</span>
                    </a>
                  </div>
                </div>

                {selectedMessage.reg_number && (
                  <div>
                    <div className="text-gray-500 text-sm mb-1">Referanse</div>
                    <div className="flex items-center space-x-2 text-white">
                      <Gamepad2 className="w-4 h-4 text-[#c9a227]" />
                      <span>{selectedMessage.reg_number}</span>
                    </div>
                  </div>
                )}

                <div>
                  <div className="text-gray-500 text-sm mb-1">Tjeneste</div>
                  <span className={`inline-flex px-3 py-1 rounded-lg text-sm font-medium ${getServiceColor(selectedMessage.service)}`}>
                    {getServiceLabel(selectedMessage.service)}
                  </span>
                </div>

                <div>
                  <div className="text-gray-500 text-sm mb-1">Melding</div>
                  <div className="bg-[#2a2a2a] rounded-lg p-4 text-gray-300 whitespace-pre-wrap">
                    {selectedMessage.message}
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-gray-500 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>
                    Mottatt {new Date(selectedMessage.created_at).toLocaleString('no-NO')}
                  </span>
                </div>

                {/* Quick actions */}
                <div className="pt-4 border-t border-gray-800 flex space-x-3">
                  <a
                    href={`mailto:${selectedMessage.email}?subject=Re: Henvendelse til STOLL Esportsenter`}
                    className="flex-1 py-3 gradient-gold rounded-lg text-[#1a1a1a] font-semibold text-center hover:shadow-lg hover:shadow-[#c9a227]/20 transition-all"
                  >
                    Svar på e-post
                  </a>
                  <a
                    href={`tel:${selectedMessage.phone}`}
                    className="flex-1 py-3 border border-[#c9a227] rounded-lg text-[#c9a227] font-semibold text-center hover:bg-[#c9a227] hover:text-[#1a1a1a] transition-all"
                  >
                    Ring tilbake
                  </a>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass rounded-xl p-6 flex items-center justify-center min-h-[400px]"
            >
              <div className="text-center text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Velg en melding for å se detaljer</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
