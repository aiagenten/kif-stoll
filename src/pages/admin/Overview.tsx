import { useEffect, useState } from 'react'
import { MessageSquare, Star, Eye, TrendingUp, Clock } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

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
    { label: 'Meldinger', value: stats.messages, icon: MessageSquare, color: 'bg-blue-50 text-blue-600' },
    { label: 'Anmeldelser', value: stats.reviews, icon: Star, color: 'bg-yellow-50 text-yellow-600' },
    { label: 'Sidevisninger', value: stats.pageViews, icon: Eye, color: 'bg-green-50 text-green-600' },
    { label: 'Konvertering', value: stats.conversionRate, icon: TrendingUp, color: 'bg-purple-50 text-[#5F4E9D]' },
  ]

  return (
    <div className="space-y-8 bg-gray-50 min-h-full p-6">
      {/* Stats grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <Card
            key={stat.label}
            className="animate-in fade-in slide-in-from-bottom-2"
            style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-500">{stat.label}</span>
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-bold text-[#1C244B]">
                {loading ? '...' : stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent messages */}
      <Card
        className="animate-in fade-in slide-in-from-bottom-2"
        style={{ animationDelay: '400ms', animationFillMode: 'both' }}
      >
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2 text-[#1C244B]">
            <Clock className="w-5 h-5 text-[#5F4E9D]" />
            Siste henvendelser
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-gray-400 text-center py-8">Laster...</div>
          ) : recentMessages.length === 0 ? (
            <div className="text-gray-400 text-center py-8">
              Ingen henvendelser ennå
            </div>
          ) : (
            <div className="space-y-3">
              {recentMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <div className="font-medium text-[#1C244B]">{msg.name}</div>
                    <div className="text-gray-500 text-sm">{msg.email}</div>
                  </div>
                  <div className="text-right">
                    <Badge variant="warning">{msg.service}</Badge>
                    <div className="text-gray-400 text-xs mt-1">
                      {new Date(msg.created_at).toLocaleDateString('no-NO')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick actions */}
      <Card
        className="animate-in fade-in slide-in-from-bottom-2"
        style={{ animationDelay: '500ms', animationFillMode: 'both' }}
      >
        <CardHeader>
          <CardTitle className="text-xl text-[#1C244B]">Hurtighandlinger</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-4">
            <button className="p-4 rounded-lg bg-gray-50 hover:bg-gray-100 text-left transition-colors border border-gray-100">
              <MessageSquare className="w-6 h-6 text-[#5F4E9D] mb-2" />
              <div className="font-medium text-[#1C244B]">Se alle meldinger</div>
              <div className="text-gray-500 text-sm">Administrer henvendelser</div>
            </button>
            <button className="p-4 rounded-lg bg-gray-50 hover:bg-gray-100 text-left transition-colors border border-gray-100">
              <Star className="w-6 h-6 text-[#5F4E9D] mb-2" />
              <div className="font-medium text-[#1C244B]">Legg til anmeldelse</div>
              <div className="text-gray-500 text-sm">Vis flere testimonials</div>
            </button>
            <button className="p-4 rounded-lg bg-gray-50 hover:bg-gray-100 text-left transition-colors border border-gray-100">
              <Eye className="w-6 h-6 text-[#5F4E9D] mb-2" />
              <div className="font-medium text-[#1C244B]">Se nettside</div>
              <div className="text-gray-500 text-sm">Åpne i ny fane</div>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
