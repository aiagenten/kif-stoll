import { useEffect, useState } from 'react'
import { Bot, MessageCircle, Search, RefreshCw, Calendar } from 'lucide-react'
import { supabase, getChatMessageCount } from '@/lib/supabase'

const MONTHLY_QUOTA = 500

interface ChatMessage {
  id: string
  created_at: string
  message: string
  role: 'user' | 'assistant'
  session_id: string
}

export default function AdminChatbot() {
  const [monthlyCount, setMonthlyCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [messagesLoading, setMessagesLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'assistant'>('all')

  const fetchData = async () => {
    setLoading(true)
    setMessagesLoading(true)
    try {
      const count = await getChatMessageCount()
      setMonthlyCount(count)
    } finally {
      setLoading(false)
    }

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200)
      if (!error && data) {
        setMessages(data as ChatMessage[])
      }
    } finally {
      setMessagesLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const usedPercent = Math.min((monthlyCount / MONTHLY_QUOTA) * 100, 100)
  const barColor =
    usedPercent >= 90 ? '#ef4444' : usedPercent >= 70 ? '#f59e0b' : '#10b981'

  // Filter messages
  const filtered = messages.filter((m) => {
    const matchesRole = roleFilter === 'all' || m.role === roleFilter
    const q = search.toLowerCase()
    const matchesSearch =
      !q ||
      m.message.toLowerCase().includes(q) ||
      m.session_id.toLowerCase().includes(q)
    return matchesRole && matchesSearch
  })

  // Group by session for display
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#5F4E9D] flex items-center justify-center">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Chatbot</h1>
            <p className="text-sm text-gray-500">Kvote og samtalelogg</p>
          </div>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Oppdater
        </button>
      </div>

      {/* Quota card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <MessageCircle className="h-5 w-5 text-[#5F4E9D]" />
          <h2 className="font-semibold text-gray-800">Månedlig meldingskvote</h2>
          <span className="ml-auto text-xs text-gray-400 flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {monthStart.toLocaleDateString('nb-NO', { month: 'long', year: 'numeric' })}
          </span>
        </div>

        {loading ? (
          <div className="h-8 bg-gray-100 rounded-lg animate-pulse" />
        ) : (
          <>
            <div className="flex items-end justify-between mb-2">
              <span className="text-3xl font-black text-gray-900">{monthlyCount}</span>
              <span className="text-sm text-gray-400">av {MONTHLY_QUOTA} meldinger</span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-3 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${usedPercent}%`, backgroundColor: barColor }}
              />
            </div>

            <div className="flex justify-between mt-2 text-xs text-gray-400">
              <span>{usedPercent.toFixed(0)}% brukt</span>
              <span>{MONTHLY_QUOTA - monthlyCount} igjen</span>
            </div>

            {usedPercent >= 90 && (
              <div className="mt-3 text-xs font-medium text-red-600 bg-red-50 rounded-lg px-3 py-2">
                ⚠️ Kvoten er nesten tom. Vurder å øke MONTHLY_QUOTA i ChatWidget.tsx.
              </div>
            )}
          </>
        )}
      </div>

      {/* Message log */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800 flex-1">Samtalelogg</h2>

          {/* Search */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Søk i meldinger..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5F4E9D]/30"
            />
          </div>

          {/* Role filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)}
            className="text-sm rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#5F4E9D]/30"
          >
            <option value="all">Alle</option>
            <option value="user">Brukerspørsmål</option>
            <option value="assistant">Bot-svar</option>
          </select>
        </div>

        {messagesLoading ? (
          <div className="p-8 text-center text-gray-400">
            <div className="w-6 h-6 border-2 border-[#5F4E9D] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Laster meldinger...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <MessageCircle className="h-10 w-10 mx-auto mb-2 opacity-30" />
            Ingen meldinger funnet
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Dato</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Type</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Melding</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Session</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((msg) => (
                  <tr key={msg.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap text-xs">
                      {new Date(msg.created_at).toLocaleString('nb-NO', {
                        day: '2-digit',
                        month: '2-digit',
                        year: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          msg.role === 'user'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-purple-50 text-purple-700'
                        }`}
                      >
                        {msg.role === 'user' ? '👤 Bruker' : '🤖 Bot'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700 max-w-md">
                      <p className="truncate">{msg.message}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-400 font-mono text-xs truncate max-w-[120px]">
                      {msg.session_id.replace('session_', '').slice(0, 12)}…
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!messagesLoading && filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400">
            Viser {filtered.length} av {messages.length} meldinger
          </div>
        )}
      </div>
    </div>
  )
}
