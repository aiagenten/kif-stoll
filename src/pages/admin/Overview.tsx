import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, Star, Eye, TrendingUp, Clock } from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface Stats {
  messages: number
  reviews: number
  pageViews: number
  conversionRate: string
}

interface RecentMessage {
  id: string
  name: string
  email: string
  service: string
  created_at: string
}

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats>({
    messages: 0,
    reviews: 5,
    pageViews: 0,
    conversionRate: '0%'
  })
  const [recentMessages, setRecentMessages] = useState<RecentMessage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch contact submissions count
      const { count } = await supabase
        .from('contact_submissions')
        .select('*', { count: 'exact', head: true })

      // Fetch recent messages
      const { data: messages } = await supabase
        .from('contact_submissions')
        .select('id, name, email, service, created_at')
        .order('created_at', { ascending: false })
        .limit(5)

      setStats(prev => ({ ...prev, messages: count || 0 }))
      setRecentMessages(messages || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    { label: 'Meldinger', value: stats.messages, icon: MessageSquare, color: 'bg-blue-500/10 text-blue-400' },
    { label: 'Anmeldelser', value: stats.reviews, icon: Star, color: 'bg-yellow-500/10 text-yellow-400' },
    { label: 'Sidevisninger', value: stats.pageViews, icon: Eye, color: 'bg-green-500/10 text-green-400' },
    { label: 'Konvertering', value: stats.conversionRate, icon: TrendingUp, color: 'bg-purple-500/10 text-purple-400' },
  ]

  return (
    <div className="space-y-8">
      {/* Stats grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-400 text-sm">{stat.label}</span>
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-bold text-white">
              {loading ? '...' : stat.value}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent messages */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass rounded-xl p-6"
      >
        <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
          <Clock className="w-5 h-5 text-[#c9a227]" />
          <span>Siste henvendelser</span>
        </h2>

        {loading ? (
          <div className="text-gray-500 text-center py-8">Laster...</div>
        ) : recentMessages.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            Ingen henvendelser ennå
          </div>
        ) : (
          <div className="space-y-4">
            {recentMessages.map((msg) => (
              <div 
                key={msg.id}
                className="flex items-center justify-between p-4 bg-[#2a2a2a] rounded-lg"
              >
                <div>
                  <div className="text-white font-medium">{msg.name}</div>
                  <div className="text-gray-500 text-sm">{msg.email}</div>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#c9a227]/10 text-[#c9a227]">
                    {msg.service}
                  </span>
                  <div className="text-gray-500 text-xs mt-1">
                    {new Date(msg.created_at).toLocaleDateString('no-NO')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Quick actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass rounded-xl p-6"
      >
        <h2 className="text-xl font-bold text-white mb-6">Hurtighandlinger</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <button className="p-4 rounded-lg bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white text-left transition-colors">
            <MessageSquare className="w-6 h-6 text-[#c9a227] mb-2" />
            <div className="font-medium">Se alle meldinger</div>
            <div className="text-gray-500 text-sm">Administrer henvendelser</div>
          </button>
          <button className="p-4 rounded-lg bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white text-left transition-colors">
            <Star className="w-6 h-6 text-[#c9a227] mb-2" />
            <div className="font-medium">Legg til anmeldelse</div>
            <div className="text-gray-500 text-sm">Vis flere testimonials</div>
          </button>
          <button className="p-4 rounded-lg bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white text-left transition-colors">
            <Eye className="w-6 h-6 text-[#c9a227] mb-2" />
            <div className="font-medium">Se nettside</div>
            <div className="text-gray-500 text-sm">Åpne i ny fane</div>
          </button>
        </div>
      </motion.div>
    </div>
  )
}
