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
import { supabase } from '@/lib/supabase'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

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
      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors rounded-t-xl"
    >
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-[#5F4E9D]" />
        <span className="font-medium text-gray-900">{title}</span>
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
        <Loader2 className="w-8 h-8 animate-spin text-[#5F4E9D]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">SEO & AEO</h2>
          <p className="text-gray-500 mt-1">Optimaliser for søkemotorer og AI-assistenter</p>
        </div>

        <Button
          onClick={generateAllPages}
          disabled={generating}
          variant="accent"
          size="lg"
        >
          {generating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          Generer SEO for alle sider
        </Button>
      </div>

      {/* Message */}
      {message && (
        <div className={cn(
          'flex items-center gap-2 p-4 rounded-lg text-sm',
          message.type === 'success'
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        )}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          {message.text}
        </div>
      )}

      {/* Page Selector */}
      <div className="flex flex-wrap gap-2">
        {PAGES.map(page => (
          <Button
            key={page.key}
            onClick={() => setSelectedPage(page.key)}
            variant={selectedPage === page.key ? 'default' : 'outline'}
            size="sm"
            className={cn(
              'rounded-full',
              selectedPage === page.key && 'shadow-md'
            )}
          >
            <page.icon className="w-4 h-4" />
            {page.label}
          </Button>
        ))}
      </div>

      {/* Settings Form */}
      <div className="space-y-4">
        {/* Meta Tags Section */}
        <Card>
          <SectionHeader title="Meta Tags" section="meta" icon={Search} />

          {expandedSections.meta && (
            <CardContent className="pt-0 space-y-4 border-t border-gray-100">
              <div className="flex justify-end pt-4">
                <Button
                  onClick={() => generateWithAI('meta')}
                  disabled={generating}
                  variant="ghost"
                  size="sm"
                  className="text-[#5F4E9D]"
                >
                  {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  Generer med AI
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="meta_title">Meta Title (50-60 tegn)</Label>
                <Input
                  id="meta_title"
                  type="text"
                  value={formData.meta_title || ''}
                  onChange={e => setFormData(prev => ({ ...prev, meta_title: e.target.value }))}
                  placeholder="STOLL Esportsenter | Gaming i Kongsberg"
                />
                <p className="text-xs text-gray-400">
                  {(formData.meta_title?.length || 0)}/60 tegn
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="meta_description">Meta Description (150-160 tegn)</Label>
                <Textarea
                  id="meta_description"
                  value={formData.meta_description || ''}
                  onChange={e => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
                  rows={3}
                  placeholder="Esportsenter med gaming-fasiliteter, turneringer og coaching i Kongsberg..."
                />
                <p className="text-xs text-gray-400">
                  {(formData.meta_description?.length || 0)}/160 tegn
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="keywords">Keywords (kommaseparert)</Label>
                <Input
                  id="keywords"
                  type="text"
                  value={(formData.keywords || []).join(', ')}
                  onChange={e => setFormData(prev => ({
                    ...prev,
                    keywords: e.target.value.split(',').map(k => k.trim()).filter(Boolean)
                  }))}
                  placeholder="esport kongsberg, gaming, turneringer"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="canonical_url">Canonical URL</Label>
                <Input
                  id="canonical_url"
                  type="url"
                  value={formData.canonical_url || ''}
                  onChange={e => setFormData(prev => ({ ...prev, canonical_url: e.target.value }))}
                  placeholder="https://stoll.gg"
                />
              </div>
            </CardContent>
          )}
        </Card>

        {/* Open Graph Section */}
        <Card>
          <SectionHeader title="Open Graph (Sosiale Medier)" section="og" icon={Globe} />

          {expandedSections.og && (
            <CardContent className="pt-0 space-y-4 border-t border-gray-100">
              <div className="space-y-2 pt-4">
                <Label htmlFor="og_image">OG Image URL</Label>
                <Input
                  id="og_image"
                  type="url"
                  value={formData.og_image || ''}
                  onChange={e => setFormData(prev => ({ ...prev, og_image: e.target.value }))}
                  placeholder="https://stoll.gg/og-image.jpg"
                />
                <p className="text-xs text-gray-400">
                  Anbefalt størrelse: 1200x630px. Brukes når siden deles på Facebook, LinkedIn, etc.
                </p>
              </div>

              {formData.og_image && (
                <div className="relative aspect-video w-full max-w-md rounded-lg overflow-hidden bg-gray-50 border border-gray-200">
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
            </CardContent>
          )}
        </Card>

        {/* Structured Data Section */}
        <Card>
          <SectionHeader title="Structured Data (JSON-LD)" section="structured" icon={Code} />

          {expandedSections.structured && (
            <CardContent className="pt-0 space-y-4 border-t border-gray-100">
              <div className="flex justify-between items-center pt-4">
                <p className="text-sm text-gray-500">
                  Schema.org markup for søkemotorer og AI-assistenter
                </p>
                <Button
                  onClick={() => generateWithAI('structured')}
                  disabled={generating}
                  variant="ghost"
                  size="sm"
                  className="text-[#5F4E9D]"
                >
                  {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  Generer med AI
                </Button>
              </div>

              <Textarea
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
                className="font-mono text-sm"
                placeholder='{"@context": "https://schema.org", ...}'
              />
            </CardContent>
          )}
        </Card>

        {/* FAQ Schema Section (AEO) */}
        <Card>
          <SectionHeader title="FAQ Schema (AEO)" section="faq" icon={HelpCircle} />

          {expandedSections.faq && (
            <CardContent className="pt-0 space-y-4 border-t border-gray-100">
              <div className="flex justify-between items-center pt-4">
                <p className="text-sm text-gray-500">
                  Spørsmål og svar for &quot;People Also Ask&quot; og voice search
                </p>
                <Button
                  onClick={() => generateWithAI('faq')}
                  disabled={generating}
                  variant="ghost"
                  size="sm"
                  className="text-[#5F4E9D]"
                >
                  {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  Generer FAQ med AI
                </Button>
              </div>

              {/* Existing FAQs */}
              <div className="space-y-3">
                {(formData.faq_schema || []).map((faq, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <p className="font-medium text-[#5F4E9D]">Q: {faq.question}</p>
                        <p className="text-gray-600 mt-1">A: {faq.answer}</p>
                      </div>
                      <Button
                        onClick={() => removeFaq(index)}
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        Fjern
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add new FAQ */}
              <div className="p-4 border border-dashed border-gray-300 rounded-lg space-y-3">
                <Input
                  type="text"
                  value={newFaq.question}
                  onChange={e => setNewFaq(prev => ({ ...prev, question: e.target.value }))}
                  placeholder="Spørsmål..."
                />
                <Textarea
                  value={newFaq.answer}
                  onChange={e => setNewFaq(prev => ({ ...prev, answer: e.target.value }))}
                  rows={2}
                  placeholder="Svar..."
                />
                <Button
                  onClick={addFaq}
                  disabled={!newFaq.question || !newFaq.answer}
                  variant="outline"
                  size="sm"
                >
                  + Legg til FAQ
                </Button>
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <Button
          onClick={fetchSettings}
          variant="outline"
          size="lg"
        >
          <RefreshCw className="w-4 h-4" />
          Tilbakestill
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving}
          variant="default"
          size="lg"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Lagre endringer
        </Button>
      </div>

      {/* Preview Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileJson className="w-5 h-5 text-[#5F4E9D]" />
            Google Søkeresultat Forhåndsvisning
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-white rounded-lg border border-gray-200 max-w-xl">
            <div className="text-blue-700 text-lg hover:underline cursor-pointer">
              {formData.meta_title || 'STOLL Esportsenter | Gaming i Kongsberg'}
            </div>
            <div className="text-green-700 text-sm">
              stoll.gg › {selectedPage === 'home' ? '' : selectedPage}
            </div>
            <div className="text-gray-600 text-sm mt-1">
              {formData.meta_description || 'Legg til en meta description for å se forhåndsvisning her...'}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
