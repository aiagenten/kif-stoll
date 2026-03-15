import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  Share2,
  Clock,
  CheckCircle,
  XCircle,
  Send,
  FileText,

  Edit2,
  Trash2,
  Settings,
  TrendingUp,
} from 'lucide-react'
import { getAllSomePosts, deleteSomePost } from '../../lib/supabase'
import type { SomePost } from '../../lib/supabase'

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  draft:     { label: 'Utkast',      color: 'bg-gray-500/20 text-gray-300',   icon: FileText },
  approved:  { label: 'Godkjent',    color: 'bg-green-500/20 text-green-300', icon: CheckCircle },
  scheduled: { label: 'Planlagt',    color: 'bg-blue-500/20 text-blue-300',   icon: Clock },
  published: { label: 'Publisert',   color: 'bg-[#5F4E9D]/30 text-purple-300',icon: Send },
  rejected:  { label: 'Avvist',      color: 'bg-red-500/20 text-red-300',     icon: XCircle },
}

const platformLabels: Record<string, string> = {
  facebook:  '📘 Facebook',
  instagram: '📸 Instagram',
  both:      '📘📸 Begge',
}

const postTypeLabels: Record<string, string> = {
  event_reminder: '📅 Event-påminnelse',
  weekly_update:  '📋 Ukentlig oppdatering',
  recap:          '🎬 Recap',
  general:        '💬 Generelt',
  campaign:       '🚀 Kampanje',
}

export default function AdminSoMe() {
  const navigate = useNavigate()
  const [posts, setPosts] = useState<SomePost[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    loadPosts()
  }, [])

  const loadPosts = async () => {
    setLoading(true)
    try {
      const data = await getAllSomePosts()
      setPosts(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Slett dette innlegget?')) return
    try {
      await deleteSomePost(id)
      setPosts(posts.filter(p => p.id !== id))
    } catch (err) {
      console.error(err)
      alert('Kunne ikke slette innlegget')
    }
  }

  const filtered = filter === 'all' ? posts : posts.filter(p => p.status === filter)

  const stats = {
    total:     posts.length,
    draft:     posts.filter(p => p.status === 'draft').length,
    approved:  posts.filter(p => p.status === 'approved').length,
    scheduled: posts.filter(p => p.status === 'scheduled').length,
    published: posts.filter(p => p.status === 'published').length,
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Sosiale Medier
          </h2>
          <p className="text-gray-500 text-sm mt-1">Administrer innlegg for Facebook og Instagram</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/admin/some/settings')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors text-sm"
          >
            <Settings className="w-4 h-4" />
            Innstillinger
          </button>
          <button
            onClick={() => navigate('/admin/some/new')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{ background: '#5F4E9D', color: 'white' }}
          >
            <Plus className="w-4 h-4" />
            Generer nytt innlegg
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Totalt', value: stats.total, color: '#5F4E9D', icon: Share2 },
          { label: 'Utkast', value: stats.draft, color: '#6b7280', icon: FileText },
          { label: 'Planlagt', value: stats.scheduled, color: '#3b82f6', icon: Clock },
          { label: 'Publisert', value: stats.published, color: '#10b981', icon: TrendingUp },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#1C244B] rounded-xl p-4 flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: stat.color + '33' }}>
              <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-gray-400 text-xs">{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'draft', 'approved', 'scheduled', 'published', 'rejected'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === tab
                ? 'text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            style={filter === tab ? { background: '#5F4E9D' } : {}}
          >
            {tab === 'all' ? 'Alle' : statusConfig[tab]?.label}
          </button>
        ))}
      </div>

      {/* Posts list */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5F4E9D]" />
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 bg-white rounded-xl border border-gray-100"
        >
          <Share2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Ingen innlegg ennå</p>
          <p className="text-gray-400 text-sm mt-1">Klikk "Generer nytt innlegg" for å starte</p>
          <button
            onClick={() => navigate('/admin/some/new')}
            className="mt-4 px-5 py-2 rounded-lg text-sm font-medium text-white transition-colors"
            style={{ background: '#5F4E9D' }}
          >
            Lag første innlegg
          </button>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {filtered.map((post, i) => {
            const status = statusConfig[post.status || 'draft']
            const StatusIcon = status.icon
            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-white rounded-xl border border-gray-100 p-4 flex items-start gap-4 hover:shadow-sm transition-shadow"
              >
                {/* Platform icon */}
                <div className="w-10 h-10 rounded-lg bg-[#5F4E9D]/10 flex items-center justify-center flex-shrink-0 text-lg">
                  {post.platform === 'facebook' ? '📘' : post.platform === 'instagram' ? '📸' : '📱'}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      {post.title && (
                        <p className="font-semibold text-gray-900 text-sm truncate">{post.title}</p>
                      )}
                      <p className="text-gray-600 text-sm line-clamp-2 mt-0.5">{post.content}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                      <StatusIcon className="w-3 h-3" />
                      {status.label}
                    </span>
                    {post.platform && (
                      <span className="text-xs text-gray-400">{platformLabels[post.platform]}</span>
                    )}
                    {post.post_type && (
                      <span className="text-xs text-gray-400">{postTypeLabels[post.post_type]}</span>
                    )}
                    {post.scheduled_at && (
                      <span className="text-xs text-blue-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(post.scheduled_at).toLocaleDateString('nb-NO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                    <span className="text-xs text-gray-300 ml-auto">
                      {post.created_at ? new Date(post.created_at).toLocaleDateString('nb-NO') : ''}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => navigate(`/admin/some/edit/${post.id}`)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-[#5F4E9D] hover:bg-[#5F4E9D]/10 transition-colors"
                    title="Rediger"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => post.id && handleDelete(post.id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    title="Slett"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Upcoming scheduled posts */}
      {posts.filter(p => p.status === 'scheduled').length > 0 && (
        <div className="bg-[#1C244B] rounded-xl p-5">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#F2DE27]" />
            Kommende planlagte innlegg
          </h3>
          <div className="space-y-2">
            {posts
              .filter(p => p.status === 'scheduled' && p.scheduled_at)
              .sort((a, b) => new Date(a.scheduled_at!).getTime() - new Date(b.scheduled_at!).getTime())
              .slice(0, 5)
              .map(post => (
                <div key={post.id} className="flex items-center gap-3 text-sm">
                  <span className="text-[#F2DE27] font-mono text-xs min-w-[120px]">
                    {new Date(post.scheduled_at!).toLocaleDateString('nb-NO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="text-gray-300 truncate">{post.title || post.content.substring(0, 60)}</span>
                  <span className="text-gray-500 text-xs ml-auto">{platformLabels[post.platform || ''] || post.platform}</span>
                </div>
              ))
            }
          </div>
        </div>
      )}
    </div>
  )
}
