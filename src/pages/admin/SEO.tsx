import { useState, useEffect } from 'react'
import { 
  Search, 
  Sparkles, 
  Save, 
  RefreshCw, 
  Globe, 
  Code,
  CheckCircle,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  FileJson
} from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface SEOSettings {
  id: string
  page_key: string
  meta_title: string | null
  meta_description: string | null
  og_image: string | null
  structured_data: Record<string, unknown> | null
  faq_schema: Array<{ question: string; answer: string }> | null
  keywords: string[] | null
  canonical_url: string | null
  updated_at: string
}

const PAGES = [
  { key: 'home', label: 'Forside', icon: Globe },
  { key: 'fasiliteter', label: 'Fasiliteter', icon: Globe },
  { key: 'gaming', label: 'Gaming', icon: Globe },
  { key: 'turneringer', label: 'Turneringer', icon: Globe },
]

export default function AdminSEO() {
  const [settings, setSettings] = useState<SEOSettings[]>([])
  const [selectedPage, setSelectedPage] = useState('home')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    meta: true,
    og: false,
    structured: false,
    faq: false
  })

  // Form state for current page
  const [formData, setFormData] = useState<Partial<SEOSettings>>({})
  const [newFaq, setNewFaq] = useState({ question: '', answer: '' })

  useEffect(() => {
    fetchSettings()
  }, [])

  useEffect(() => {
    const currentSettings = settings.find(s => s.page_key === selectedPage)
    if (currentSettings) {
      setFormData(currentSettings)
    } else {
      setFormData({ page_key: selectedPage })
    }
  }, [selectedPage, settings])

  const fetchSettings = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('seo_settings')
      .select('*')
      .order('page_key')

    if (error) {
      console.error('Error fetching SEO settings:', error)
      showMessage('error', 'Kunne ikke hente SEO-innstillinger')
    } else {
      setSettings(data || [])
    }
    setLoading(false)
  }

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  const handleSave = async () => {
    setSaving(true)
    
    const { error } = await supabase
      .from('seo_settings')
      .upsert({
        page_key: formData.page_key || selectedPage,
        meta_title: formData.meta_title,
        meta_description: formData.meta_description,
        og_image: formData.og_image,
        structured_data: formData.structured_data,
        faq_schema: formData.faq_schema,
        keywords: formData.keywords,
        canonical_url: formData.canonical_url
      }, { onConflict: 'page_key' })

    if (error) {
      showMessage('error', 'Kunne ikke lagre: ' + error.message)
    } else {
      showMessage('success', 'SEO-innstillinger lagret!')
      fetchSettings()
    }
    setSaving(false)
  }

  const generateWithAI = async (type: 'all' | 'meta' | 'faq' | 'structured') => {
    setGenerating(true)
    
    try {
      const response = await fetch('/api/seo/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageKey: selectedPage,
          type,
          currentData: formData
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Generering feilet')
      }

      const result = await response.json()
      
      // Merge generated data with form
      setFormData(prev => ({
        ...prev,
        ...result.data
      }))

      showMessage('success', `${type === 'all' ? 'Alt' : type.toUpperCase()} generert med AI!`)
    } catch (error) {
      console.error('AI generation error:', error)
      showMessage('error', error instanceof Error ? error.message : 'AI-generering feilet. Sjekk at OPENAI_API_KEY er satt.')
    }
    
    setGenerating(false)
  }

  const generateAllPages = async () => {
    setGenerating(true)
    
    try {
      const response = await fetch('/api/seo/generate-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Generering feilet')
      }

      showMessage('success', 'SEO generert for alle sider!')
      fetchSettings()
    } catch (error) {
      console.error('AI generation error:', error)
      showMessage('error', error instanceof Error ? error.message : 'AI-generering feilet')
    }
    
    setGenerating(false)
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const addFaq = () => {
    if (newFaq.question && newFaq.answer) {
      const currentFaqs = formData.faq_schema || []
      setFormData(prev => ({
        ...prev,
        faq_schema: [...currentFaqs, newFaq]
      }))
      setNewFaq({ question: '', answer: '' })
    }
  }

  const removeFaq = (index: number) => {
    const currentFaqs = formData.faq_schema || []
    setFormData(prev => ({
      ...prev,
      faq_schema: currentFaqs.filter((_, i) => i !== index)
    }))
  }

  const SectionHeader = ({ 
    title, 
    section, 
    icon: Icon 
  }: { 
    title: string; 
    section: string; 
    icon: React.ComponentType<{ className?: string }> 
  }) => (
    <button
      onClick={() => toggleSection(section)}
      className="w-full flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
    >
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-[#c9a227]" />
        <span className="font-medium">{title}</span>
      </div>
      {expandedSections[section] ? (
        <ChevronUp className="w-5 h-5 text-gray-400" />
      ) : (
        <ChevronDown className="w-5 h-5 text-gray-400" />
      )}
    </button>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#c9a227]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold">SEO & AEO</h2>
          <p className="text-gray-300 mt-1">Optimaliser for søkemotorer og AI-assistenter</p>
        </div>
        
        <button
          onClick={generateAllPages}
          disabled={generating}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#c9a227] to-yellow-500 text-black font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {generating ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Sparkles className="w-5 h-5" />
          )}
          Generer SEO for alle sider
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`flex items-center gap-2 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          {message.text}
        </div>
      )}

      {/* Page Selector */}
      <div className="flex flex-wrap gap-2">
        {PAGES.map(page => (
          <button
            key={page.key}
            onClick={() => setSelectedPage(page.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              selectedPage === page.key
                ? 'bg-[#c9a227] text-black'
                : 'bg-white/5 text-gray-300 hover:bg-white/10'
            }`}
          >
            <page.icon className="w-4 h-4" />
            {page.label}
          </button>
        ))}
      </div>

      {/* Settings Form */}
      <div className="space-y-4">
        {/* Meta Tags Section */}
        <div className="glass rounded-xl overflow-hidden">
          <SectionHeader title="Meta Tags" section="meta" icon={Search} />
          
          {expandedSections.meta && (
            <div className="p-4 space-y-4 border-t border-gray-800">
              <div className="flex justify-end">
                <button
                  onClick={() => generateWithAI('meta')}
                  disabled={generating}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-[#c9a227]/20 text-[#c9a227] rounded-lg hover:bg-[#c9a227]/30 transition-colors disabled:opacity-50"
                >
                  {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  Generer med AI
                </button>
              </div>

              <div>
                <label className="block text-sm text-gray-200 mb-1">Meta Title (50-60 tegn)</label>
                <input
                  type="text"
                  value={formData.meta_title || ''}
                  onChange={e => setFormData(prev => ({ ...prev, meta_title: e.target.value }))}
                  className="w-full px-4 py-2 bg-white/5 border border-gray-700 rounded-lg focus:border-[#c9a227] focus:outline-none"
                  placeholder="STOLL Esportsenter | Gaming i Bergen"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {(formData.meta_title?.length || 0)}/60 tegn
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-200 mb-1">Meta Description (150-160 tegn)</label>
                <textarea
                  value={formData.meta_description || ''}
                  onChange={e => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2 bg-white/5 border border-gray-700 rounded-lg focus:border-[#c9a227] focus:outline-none resize-none"
                  placeholder="Esportsenter med gaming-fasiliteter, turneringer og coaching i Bergen..."
                />
                <div className="text-xs text-gray-500 mt-1">
                  {(formData.meta_description?.length || 0)}/160 tegn
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-200 mb-1">Keywords (kommaseparert)</label>
                <input
                  type="text"
                  value={(formData.keywords || []).join(', ')}
                  onChange={e => setFormData(prev => ({ 
                    ...prev, 
                    keywords: e.target.value.split(',').map(k => k.trim()).filter(Boolean)
                  }))}
                  className="w-full px-4 py-2 bg-white/5 border border-gray-700 rounded-lg focus:border-[#c9a227] focus:outline-none"
                  placeholder="esport bergen, gaming, turneringer"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-200 mb-1">Canonical URL</label>
                <input
                  type="url"
                  value={formData.canonical_url || ''}
                  onChange={e => setFormData(prev => ({ ...prev, canonical_url: e.target.value }))}
                  className="w-full px-4 py-2 bg-white/5 border border-gray-700 rounded-lg focus:border-[#c9a227] focus:outline-none"
                  placeholder="https://stoll.gg"
                />
              </div>
            </div>
          )}
        </div>

        {/* Open Graph Section */}
        <div className="glass rounded-xl overflow-hidden">
          <SectionHeader title="Open Graph (Sosiale Medier)" section="og" icon={Globe} />
          
          {expandedSections.og && (
            <div className="p-4 space-y-4 border-t border-gray-800">
              <div>
                <label className="block text-sm text-gray-200 mb-1">OG Image URL</label>
                <input
                  type="url"
                  value={formData.og_image || ''}
                  onChange={e => setFormData(prev => ({ ...prev, og_image: e.target.value }))}
                  className="w-full px-4 py-2 bg-white/5 border border-gray-700 rounded-lg focus:border-[#c9a227] focus:outline-none"
                  placeholder="https://stoll.gg/og-image.jpg"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Anbefalt størrelse: 1200x630px. Brukes når siden deles på Facebook, LinkedIn, etc.
                </p>
              </div>

              {formData.og_image && (
                <div className="relative aspect-video w-full max-w-md rounded-lg overflow-hidden bg-white/5">
                  <img 
                    src={formData.og_image} 
                    alt="OG Preview" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Structured Data Section */}
        <div className="glass rounded-xl overflow-hidden">
          <SectionHeader title="Structured Data (JSON-LD)" section="structured" icon={Code} />
          
          {expandedSections.structured && (
            <div className="p-4 space-y-4 border-t border-gray-800">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-300">
                  Schema.org markup for søkemotorer og AI-assistenter
                </p>
                <button
                  onClick={() => generateWithAI('structured')}
                  disabled={generating}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-[#c9a227]/20 text-[#c9a227] rounded-lg hover:bg-[#c9a227]/30 transition-colors disabled:opacity-50"
                >
                  {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  Generer med AI
                </button>
              </div>

              <textarea
                value={formData.structured_data ? JSON.stringify(formData.structured_data, null, 2) : ''}
                onChange={e => {
                  try {
                    const parsed = JSON.parse(e.target.value)
                    setFormData(prev => ({ ...prev, structured_data: parsed }))
                  } catch {
                    // Invalid JSON, keep as-is for editing
                  }
                }}
                rows={15}
                className="w-full px-4 py-2 bg-black/30 border border-gray-700 rounded-lg focus:border-[#c9a227] focus:outline-none font-mono text-sm"
                placeholder='{"@context": "https://schema.org", ...}'
              />
            </div>
          )}
        </div>

        {/* FAQ Schema Section (AEO) */}
        <div className="glass rounded-xl overflow-hidden">
          <SectionHeader title="FAQ Schema (AEO)" section="faq" icon={HelpCircle} />
          
          {expandedSections.faq && (
            <div className="p-4 space-y-4 border-t border-gray-800">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-300">
                  Spørsmål og svar for "People Also Ask" og voice search
                </p>
                <button
                  onClick={() => generateWithAI('faq')}
                  disabled={generating}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-[#c9a227]/20 text-[#c9a227] rounded-lg hover:bg-[#c9a227]/30 transition-colors disabled:opacity-50"
                >
                  {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  Generer FAQ med AI
                </button>
              </div>

              {/* Existing FAQs */}
              <div className="space-y-3">
                {(formData.faq_schema || []).map((faq, index) => (
                  <div key={index} className="p-4 bg-white/5 rounded-lg">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <p className="font-medium text-[#c9a227]">Q: {faq.question}</p>
                        <p className="text-gray-300 mt-1">A: {faq.answer}</p>
                      </div>
                      <button
                        onClick={() => removeFaq(index)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Fjern
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add new FAQ */}
              <div className="p-4 border border-dashed border-gray-700 rounded-lg space-y-3">
                <input
                  type="text"
                  value={newFaq.question}
                  onChange={e => setNewFaq(prev => ({ ...prev, question: e.target.value }))}
                  className="w-full px-4 py-2 bg-white/5 border border-gray-700 rounded-lg focus:border-[#c9a227] focus:outline-none"
                  placeholder="Spørsmål..."
                />
                <textarea
                  value={newFaq.answer}
                  onChange={e => setNewFaq(prev => ({ ...prev, answer: e.target.value }))}
                  rows={2}
                  className="w-full px-4 py-2 bg-white/5 border border-gray-700 rounded-lg focus:border-[#c9a227] focus:outline-none resize-none"
                  placeholder="Svar..."
                />
                <button
                  onClick={addFaq}
                  disabled={!newFaq.question || !newFaq.answer}
                  className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50"
                >
                  + Legg til FAQ
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-4">
        <button
          onClick={fetchSettings}
          className="flex items-center gap-2 px-6 py-3 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-colors"
        >
          <RefreshCw className="w-5 h-5" />
          Tilbakestill
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-[#c9a227] text-black font-medium rounded-lg hover:bg-[#d4af37] transition-colors disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          Lagre endringer
        </button>
      </div>

      {/* Preview Card */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FileJson className="w-5 h-5 text-[#c9a227]" />
          Google Søkeresultat Forhåndsvisning
        </h3>
        
        <div className="p-4 bg-white rounded-lg text-black max-w-xl">
          <div className="text-blue-700 text-lg hover:underline cursor-pointer">
            {formData.meta_title || 'STOLL Esportsenter | Gaming i Bergen'}
          </div>
          <div className="text-green-700 text-sm">
            stoll.gg › {selectedPage === 'home' ? '' : selectedPage}
          </div>
          <div className="text-gray-600 text-sm mt-1">
            {formData.meta_description || 'Legg til en meta description for å se forhåndsvisning her...'}
          </div>
        </div>
      </div>
    </div>
  )
}
