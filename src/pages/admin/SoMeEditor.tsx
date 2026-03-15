import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Wand2,
  CheckCircle,
  XCircle,
  Clock,
  Send,
  Save,
  Image as ImageIcon,
  Loader2,
  MessageSquare,
} from 'lucide-react'
import {
  getAllSomePosts,
  createSomePost,
  updateSomePost,
  createBrandRule,
  getAllEvents,
} from '../../lib/supabase'
import type { SomePost, Event } from '../../lib/supabase'

const postTypes = [
  { value: 'general',        label: '💬 Generelt',              desc: 'Generelt innhold' },
  { value: 'event_reminder', label: '📅 Event-påminnelse',      desc: 'Promoter et kommende event' },
  { value: 'campaign',       label: '🚀 Kampanje',               desc: 'Spesialtilbud eller kampanje' },
  { value: 'weekly_update',  label: '📋 Ukentlig oppdatering',  desc: 'Hva skjer denne uken' },
  { value: 'recap',          label: '🎬 Recap',                  desc: 'Oppsummering etter event' },
]

const platformOptions = [
  { value: 'both',      label: '📘📸 Begge plattformer' },
  { value: 'facebook',  label: '📘 Kun Facebook' },
  { value: 'instagram', label: '📸 Kun Instagram' },
]

const mockAIContent: Record<string, string[]> = {
  general: [
    '🎮 Hei, STOLL-familie! Vi er klare for en ny uke med gaming og fellesskap. Kom innom og bli med på moroa! #STOLL #Esport #Kongsberg',
    '✨ Det skjer mye spennende på STOLL disse dagene! Hold deg oppdatert og møt opp for de beste gaming-opplevelsene i Kongsberg. 🎮',
  ],
  event_reminder: [
    '⚡ PÅMINNELSE: Husk at vi har turnering i helgen! Registrer deg nå og vis hva du er god for. Plassene er begrenset! 🏆 #STOLL #Turnering',
    '🎯 Klar for kamp? Vår neste turnering nærmer seg! Book plassen din i dag og gjør deg klar til å dominere arenaen. 🔥',
  ],
  campaign: [
    '🚀 SPESIALTILBUD! Denne uken kan du ta med en venn gratis når du booker time hos STOLL. Del dette med din gaming-partner! 👾 #STOLLtilbud',
    '💥 EKSKLUSIVE TILBUD denne helgen! Kom innom STOLL og få spesialpris på booking. Skynd deg – tilbudet gjelder kun i begrenset tid!',
  ],
  weekly_update: [
    '📅 Ukens program på STOLL er klart! Sjekk hva som skjer og planlegg dine besøk. Vi gleder oss til å se deg! 🎮 #STOLL #Gaming',
    '🗓️ Ny uke, nye muligheter! Her er hva som skjer på STOLL denne uken. Save the dates og møt opp! ✨',
  ],
  recap: [
    '🎬 Hvilken helg det var! Takk til alle som møtte opp og gjorde arrangementet til noe ekstra spesielt. Vi sees igjen snart! 🙏 #STOLL #Recap',
    '🏆 Fantastisk turnering er over! Stor takk til alle deltakerne og publikum. Dere gjør STOLL til det det er! 🎮❤️',
  ],
}

export default function AdminSoMeEditor() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)

  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [events, setEvents] = useState<Event[]>([])
  const [feedbackText, setFeedbackText] = useState('')
  const [savingFeedback, setSavingFeedback] = useState(false)
  const [previewPlatform, setPreviewPlatform] = useState<'facebook' | 'instagram'>('facebook')

  const [formData, setFormData] = useState<Partial<SomePost>>({
    content: '',
    title: '',
    post_type: 'general',
    platform: 'both',
    status: 'draft',
    image_url: '',
    scheduled_at: '',
  })

  useEffect(() => {
    loadEvents()
    if (isEdit && id) loadPost(id)
  }, [id])

  const loadEvents = async () => {
    try {
      const data = await getAllEvents()
      setEvents(data)
    } catch (err) {
      console.error(err)
    }
  }

  const loadPost = async (postId: string) => {
    setLoading(true)
    try {
      const data = await getAllSomePosts()
      const post = data.find(p => p.id === postId)
      if (post) setFormData(post)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async () => {
    setGenerating(true)
    // Mock AI generation – in production this would call a Supabase edge function
    await new Promise(r => setTimeout(r, 1200))
    const type = formData.post_type || 'general'
    const options = mockAIContent[type] || mockAIContent.general
    const content = options[Math.floor(Math.random() * options.length)]
    setFormData(prev => ({ ...prev, content }))
    setGenerating(false)
  }

  const handleSave = async (status?: string) => {
    if (!formData.content) return
    setSaving(true)
    try {
      const payload: Partial<SomePost> = {
        ...formData,
        status: (status as SomePost['status']) || formData.status || 'draft',
      }
      if (isEdit && id) {
        await updateSomePost(id, payload)
      } else {
        await createSomePost(payload as Omit<SomePost, 'id' | 'created_at' | 'updated_at'>)
      }
      navigate('/admin/some')
    } catch (err) {
      console.error(err)
      alert('Kunne ikke lagre innlegget')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveFeedback = async () => {
    if (!feedbackText.trim()) return
    setSavingFeedback(true)
    try {
      // Save feedback as brand rule
      await createBrandRule({ rule: feedbackText.trim(), category: 'tone', active: true })
      // Also save on post if editing
      if (isEdit && id) {
        await updateSomePost(id, { feedback: feedbackText.trim() })
      }
      setFeedbackText('')
      alert('Feedback lagret som brand-regel ✅')
    } catch (err) {
      console.error(err)
    } finally {
      setSavingFeedback(false)
    }
  }

  const set = (key: keyof SomePost, value: unknown) => setFormData(prev => ({ ...prev, [key]: value }))

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#5F4E9D]" />
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/some')}
          className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            {isEdit ? 'Rediger innlegg' : 'Nytt innlegg'}
          </h2>
          <p className="text-gray-500 text-sm mt-0.5">Opprett og godkjenn SoMe-innlegg</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: Editor */}
        <div className="space-y-5">
          {/* Post type */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
            <h3 className="font-semibold text-gray-900">Type innlegg</h3>
            <div className="grid grid-cols-1 gap-2">
              {postTypes.map(type => (
                <label
                  key={type.value}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    formData.post_type === type.value
                      ? 'border-[#5F4E9D] bg-[#5F4E9D]/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="post_type"
                    value={type.value}
                    checked={formData.post_type === type.value}
                    onChange={() => set('post_type', type.value)}
                    className="accent-[#5F4E9D]"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{type.label}</p>
                    <p className="text-xs text-gray-500">{type.desc}</p>
                  </div>
                </label>
              ))}
            </div>

            {/* Event selector (for event_reminder) */}
            {formData.post_type === 'event_reminder' && events.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Velg event</label>
                <select
                  value={formData.event_id || ''}
                  onChange={e => set('event_id', e.target.value || undefined)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5F4E9D]/30"
                >
                  <option value="">— Velg event —</option>
                  {events.map(ev => (
                    <option key={ev.id} value={ev.id}>
                      {ev.title} — {ev.date}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Platform */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-3">
            <h3 className="font-semibold text-gray-900">Plattform</h3>
            <div className="grid grid-cols-3 gap-2">
              {platformOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => set('platform', opt.value)}
                  className={`p-2.5 rounded-lg border text-xs font-medium transition-colors ${
                    formData.platform === opt.value
                      ? 'border-[#5F4E9D] bg-[#5F4E9D] text-white'
                      : 'border-gray-200 text-gray-600 hover:border-[#5F4E9D]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-3">
            <h3 className="font-semibold text-gray-900">Tittel (valgfritt)</h3>
            <input
              type="text"
              value={formData.title || ''}
              onChange={e => set('title', e.target.value)}
              placeholder="Intern tittel for dette innlegget..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5F4E9D]/30"
            />
          </div>

          {/* Content */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Innhold</h3>
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-60"
                style={{ background: '#F2DE27', color: '#1C244B' }}
              >
                {generating ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Wand2 className="w-3.5 h-3.5" />
                )}
                {generating ? 'Genererer...' : 'Generer med AI'}
              </button>
            </div>
            <textarea
              value={formData.content}
              onChange={e => set('content', e.target.value)}
              placeholder="Skriv innholdet her, eller bruk AI-generering..."
              rows={6}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5F4E9D]/30 resize-none"
            />
            <div className="text-xs text-gray-400 text-right">{formData.content?.length || 0} tegn</div>
          </div>

          {/* Image URL */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-3">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <ImageIcon className="w-4 h-4" /> Bilde (valgfritt)
            </h3>
            <input
              type="url"
              value={formData.image_url || ''}
              onChange={e => set('image_url', e.target.value)}
              placeholder="https://... (URL til bilde)"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5F4E9D]/30"
            />
          </div>

          {/* Schedule */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-3">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Planlegg publisering
            </h3>
            <input
              type="datetime-local"
              value={formData.scheduled_at ? formData.scheduled_at.slice(0, 16) : ''}
              onChange={e => set('scheduled_at', e.target.value ? new Date(e.target.value).toISOString() : '')}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5F4E9D]/30"
            />
            <p className="text-xs text-gray-400">La stå tomt for å lagre som utkast uten planlagt tid</p>
          </div>

          {/* Feedback */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-3">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" /> Feedback / Brand-regel
            </h3>
            <p className="text-xs text-gray-500">Feedback du skriver her lagres som en brand-regel og brukes til å forbedre fremtidige AI-genererte innlegg.</p>
            <textarea
              value={feedbackText}
              onChange={e => setFeedbackText(e.target.value)}
              placeholder="F.eks.: Unngå å bruke utropstegn på slutten av hvert avsnitt..."
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5F4E9D]/30 resize-none"
            />
            <button
              onClick={handleSaveFeedback}
              disabled={savingFeedback || !feedbackText.trim()}
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50"
              style={{ background: '#5F4E9D' }}
            >
              {savingFeedback ? 'Lagrer...' : 'Lagre feedback'}
            </button>
          </div>
        </div>

        {/* RIGHT: Preview + Actions */}
        <div className="space-y-5">
          {/* Preview toggle */}
          <div className="flex gap-2">
            {(['facebook', 'instagram'] as const).map(p => (
              <button
                key={p}
                onClick={() => setPreviewPlatform(p)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors border ${
                  previewPlatform === p
                    ? 'border-[#5F4E9D] bg-[#5F4E9D] text-white'
                    : 'border-gray-200 text-gray-600 hover:border-[#5F4E9D]'
                }`}
              >
                {p === 'facebook' ? '📘 Facebook' : '📸 Instagram'}
              </button>
            ))}
          </div>

          {/* Preview card */}
          <motion.div
            key={previewPlatform}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"
          >
            {/* FB/IG header */}
            <div className={`px-4 py-3 flex items-center gap-3 ${previewPlatform === 'facebook' ? 'bg-[#1877F2]' : 'bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCAF45]'}`}>
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-sm font-bold">
                S
              </div>
              <div>
                <p className="text-white text-sm font-semibold">STOLL Esportsenter</p>
                <p className="text-white/70 text-xs">Nå · 🌐</p>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              {formData.content ? (
                <p className="text-gray-800 text-sm whitespace-pre-wrap leading-relaxed">
                  {formData.content}
                </p>
              ) : (
                <p className="text-gray-400 text-sm italic">Innhold vises her...</p>
              )}
            </div>

            {/* Image preview */}
            {formData.image_url && (
              <div className="border-t border-gray-100">
                <img
                  src={formData.image_url}
                  alt="Preview"
                  className="w-full h-48 object-cover"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
              </div>
            )}

            {/* Engagement bar */}
            <div className="px-4 py-3 border-t border-gray-100 flex items-center gap-4 text-gray-400 text-xs">
              <span>👍 Liker</span>
              <span>💬 Kommenter</span>
              <span>🔗 Del</span>
            </div>
          </motion.div>

          {/* Action buttons */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-3">
            <h3 className="font-semibold text-gray-900">Handling</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleSave('draft')}
                disabled={saving}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-60"
              >
                <Save className="w-4 h-4" />
                Lagre utkast
              </button>
              <button
                onClick={() => handleSave('approved')}
                disabled={saving || !formData.content}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-white transition-colors text-sm font-medium disabled:opacity-60"
                style={{ background: '#10b981' }}
              >
                <CheckCircle className="w-4 h-4" />
                Godkjenn
              </button>
              <button
                onClick={() => handleSave('rejected')}
                disabled={saving}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-white transition-colors text-sm font-medium disabled:opacity-60"
                style={{ background: '#ef4444' }}
              >
                <XCircle className="w-4 h-4" />
                Avvis
              </button>
              <button
                onClick={() => handleSave(formData.scheduled_at ? 'scheduled' : 'approved')}
                disabled={saving || !formData.content || !formData.scheduled_at}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-white transition-colors text-sm font-medium disabled:opacity-60"
                style={{ background: '#3b82f6' }}
              >
                <Clock className="w-4 h-4" />
                Planlegg
              </button>
            </div>
            <button
              onClick={() => handleSave('published')}
              disabled={saving || !formData.content}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-white font-semibold transition-colors disabled:opacity-60"
              style={{ background: '#5F4E9D' }}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {saving ? 'Lagrer...' : 'Publiser nå'}
            </button>
            <p className="text-xs text-gray-400 text-center">
              "Publiser nå" simulerer publisering (Meta-integrasjon legges til senere)
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
