import { useState, useEffect, useRef } from 'react'
import { FileText, Save, RefreshCw, Image, Type, AlignLeft, Phone, Sparkles, Clock, Upload, Trash2, Check, AlertCircle, Video } from 'lucide-react'
import { getAllContent, updateMultipleContent, uploadImage, uploadVideo, deleteImage, defaultContent } from '../../lib/supabase'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface ContentSection {
  id: string
  title: string
  icon: typeof FileText
  fields: ContentField[]
}

interface ContentField {
  key: string
  label: string
  type: 'text' | 'textarea' | 'image' | 'video' | 'url'
  value: string
  placeholder?: string
}

const initialSections: ContentSection[] = [
  {
    id: 'hero',
    title: 'Hero-seksjon',
    icon: Type,
    fields: [
      { key: 'hero_title', label: 'Hovedtittel', type: 'text', value: '', placeholder: 'DIN BIL, VÅR LIDENSKAP!' },
      { key: 'hero_subtitle', label: 'Undertittel', type: 'textarea', value: '', placeholder: 'Beskriv bedriften...' },
      { key: 'hero_video', label: 'Bakgrunnsvideo (MP4/WebM)', type: 'video', value: '' },
      { key: 'hero_image', label: 'Bakgrunnsbilde (brukes som poster/fallback)', type: 'image', value: '' },
    ]
  },
  {
    id: 'about',
    title: 'Om Oss',
    icon: AlignLeft,
    fields: [
      { key: 'about_history', label: 'Historie', type: 'textarea', value: '', placeholder: 'Bedriftens historie...' },
      { key: 'about_growth', label: 'Vekst', type: 'textarea', value: '', placeholder: 'Om vekst og utvikling...' },
      { key: 'about_values', label: 'Verdiforslag', type: 'textarea', value: '', placeholder: 'Hva dere tilbyr...' },
      { key: 'about_guarantee', label: 'Mobilitetsgaranti', type: 'textarea', value: '', placeholder: 'Mobilitetsgaranti info...' },
      { key: 'about_team_image', label: 'Team-bilde', type: 'image', value: '' },
    ]
  },
  {
    id: 'contact',
    title: 'Kontakt',
    icon: Phone,
    fields: [
      { key: 'contact_phone', label: 'Telefon', type: 'text', value: '', placeholder: '400 80 071' },
      { key: 'contact_email_verksted', label: 'E-post Verksted', type: 'text', value: '', placeholder: 'info@stoll.gg' },
      { key: 'contact_email_booking', label: 'E-post Booking', type: 'text', value: '', placeholder: 'booking@stoll.gg' },
      { key: 'contact_email_sponsorer', label: 'E-post Sponsorer', type: 'text', value: '', placeholder: 'sponsorer@stoll.gg' },
      { key: 'contact_address', label: 'Adresse', type: 'text', value: '', placeholder: 'Kirkegata 2, 3616 Kongsberg' },
    ]
  },
  {
    id: 'services',
    title: 'Tjenester',
    icon: Sparkles,
    fields: [
      { key: 'service_verksted', label: 'Verksted-tekst', type: 'textarea', value: '', placeholder: 'Beskrivelse av verksted...' },
      { key: 'service_coaching', label: 'Coaching-tekst', type: 'textarea', value: '', placeholder: 'Beskrivelse av coaching...' },
      { key: 'service_turneringer', label: 'Turneringer-tekst', type: 'textarea', value: '', placeholder: 'Beskrivelse av turneringer...' },
    ]
  },
  {
    id: 'hours',
    title: 'Åpningstider',
    icon: Clock,
    fields: [
      { key: 'opening_weekdays', label: 'Ukedager', type: 'text', value: '', placeholder: 'Man-Fre: 08:00 - 16:00' },
      { key: 'opening_saturday', label: 'Lørdag', type: 'text', value: '', placeholder: 'Lørdag: Stengt' },
      { key: 'opening_sunday', label: 'Søndag', type: 'text', value: '', placeholder: 'Søndag: Stengt' },
    ]
  },
  {
    id: 'social',
    title: 'Sosiale medier',
    icon: FileText,
    fields: [
      { key: 'social_facebook', label: 'Facebook URL', type: 'url', value: '', placeholder: 'https://facebook.com/...' },
      { key: 'social_instagram', label: 'Instagram URL', type: 'url', value: '', placeholder: 'https://instagram.com/...' },
    ]
  },
]

export default function AdminContent() {
  const [sections, setSections] = useState<ContentSection[]>(initialSections)
  const [activeSection, setActiveSection] = useState(initialSections[0].id)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [hasChanges, setHasChanges] = useState(false)
  const [uploadingField, setUploadingField] = useState<string | null>(null)
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})

  // Load content from Supabase on mount
  useEffect(() => {
    loadContent()
  }, [])

  const loadContent = async () => {
    setLoading(true)
    try {
      const dbContent = await getAllContent()
      const mergedContent = { ...defaultContent, ...dbContent }

      // Update sections with loaded content
      setSections(prev => prev.map(section => ({
        ...section,
        fields: section.fields.map(field => ({
          ...field,
          value: mergedContent[field.key] ?? field.value ?? ''
        }))
      })))
    } catch (error) {
      console.error('Failed to load content:', error)
      showNotification('error', 'Kunne ikke laste innhold fra database')
    } finally {
      setLoading(false)
    }
  }

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 4000)
  }

  const updateField = (sectionId: string, fieldKey: string, value: string) => {
    setSections(prev => prev.map(section =>
      section.id === sectionId
        ? {
            ...section,
            fields: section.fields.map(field =>
              field.key === fieldKey ? { ...field, value } : field
            )
          }
        : section
    ))
    setHasChanges(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Collect all field values
      const items = sections.flatMap(section =>
        section.fields.map(field => ({
          key: field.key,
          value: field.value
        }))
      )

      const success = await updateMultipleContent(items)

      if (success) {
        setHasChanges(false)
        showNotification('success', 'Endringer lagret!')
      } else {
        showNotification('error', 'Kunne ikke lagre endringer')
      }
    } catch (error) {
      console.error('Save error:', error)
      showNotification('error', 'En feil oppstod ved lagring')
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async (sectionId: string, fieldKey: string, file: File) => {
    if (!file.type.startsWith('image/')) {
      showNotification('error', 'Kun bildefiler er tillatt')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      showNotification('error', 'Bildet er for stort (maks 5MB)')
      return
    }

    setUploadingField(fieldKey)
    try {
      const folder = fieldKey.includes('hero') ? 'hero' :
                     fieldKey.includes('team') ? 'team' : 'general'

      const url = await uploadImage(file, folder)

      if (url) {
        updateField(sectionId, fieldKey, url)
        showNotification('success', 'Bilde lastet opp!')
      } else {
        showNotification('error', 'Kunne ikke laste opp bilde')
      }
    } catch (error) {
      console.error('Upload error:', error)
      showNotification('error', 'En feil oppstod ved opplasting')
    } finally {
      setUploadingField(null)
    }
  }

  const handleVideoUpload = async (sectionId: string, fieldKey: string, file: File) => {
    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime']
    if (!allowedTypes.includes(file.type)) {
      showNotification('error', 'Kun MP4, WebM eller MOV er tillatt')
      return
    }

    if (file.size > 50 * 1024 * 1024) {
      showNotification('error', 'Videoen er for stor (maks 50MB)')
      return
    }

    setUploadingField(fieldKey)
    try {
      const url = await uploadVideo(file, 'hero')

      if (url) {
        updateField(sectionId, fieldKey, url)
        showNotification('success', 'Video lastet opp!')
      } else {
        showNotification('error', 'Kunne ikke laste opp video')
      }
    } catch (error) {
      console.error('Video upload error:', error)
      showNotification('error', 'En feil oppstod ved opplasting')
    } finally {
      setUploadingField(null)
    }
  }

  const handleImageDelete = async (sectionId: string, fieldKey: string, currentUrl: string) => {
    if (!currentUrl) return

    try {
      await deleteImage(currentUrl)
      updateField(sectionId, fieldKey, '')
      showNotification('success', 'Bilde slettet')
    } catch (error) {
      console.error('Delete error:', error)
      // Still clear the field even if delete fails
      updateField(sectionId, fieldKey, '')
    }
  }

  const currentSection = sections.find(s => s.id === activeSection)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-[#5F4E9D] animate-spin" />
        <span className="ml-3 text-gray-500">Laster innhold...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6 bg-gray-50 min-h-full p-6">
      {/* Notification */}
      {notification && (
        <div
          className={cn(
            'fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg border animate-in fade-in slide-in-from-top-2',
            notification.type === 'success'
              ? 'bg-white border-green-200 text-green-700'
              : 'bg-white border-red-200 text-red-700'
          )}
        >
          {notification.type === 'success' ? (
            <Check className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span className="text-sm font-medium">{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#1C244B]">Innholdsadministrasjon</h2>
          <p className="text-gray-500 text-sm">Rediger tekst og bilder på nettsiden</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={loadContent}>
            <RefreshCw className="w-4 h-4" />
            Oppdater
          </Button>
          <Button
            variant="accent"
            onClick={handleSave}
            disabled={!hasChanges || saving}
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? 'Lagrer...' : 'Lagre endringer'}
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Seksjoner</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                    activeSection === section.id
                      ? 'bg-[#5F4E9D]/10 text-[#5F4E9D] font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <section.icon className="w-4 h-4" />
                  <span>{section.title}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Content editor */}
        <Card className="lg:col-span-3">
          {currentSection && (
            <div>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-[#1C244B]">
                  <currentSection.icon className="w-5 h-5 text-[#5F4E9D]" />
                  {currentSection.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {currentSection.fields.map((field) => (
                  <div key={field.key} className="space-y-2">
                    <Label>{field.label}</Label>

                    {(field.type === 'text' || field.type === 'url') && (
                      <Input
                        type={field.type === 'url' ? 'url' : 'text'}
                        value={field.value}
                        onChange={(e) => updateField(currentSection.id, field.key, e.target.value)}
                        placeholder={field.placeholder}
                      />
                    )}

                    {field.type === 'textarea' && (
                      <Textarea
                        value={field.value}
                        onChange={(e) => updateField(currentSection.id, field.key, e.target.value)}
                        placeholder={field.placeholder}
                        rows={4}
                      />
                    )}

                    {field.type === 'image' && (
                      <div className="space-y-3">
                        {/* Hidden file input */}
                        <input
                          type="file"
                          ref={(el) => { fileInputRefs.current[field.key] = el }}
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              handleImageUpload(currentSection.id, field.key, file)
                            }
                            e.target.value = ''
                          }}
                          className="hidden"
                        />

                        {field.value ? (
                          <div className="relative group">
                            <img
                              src={field.value}
                              alt={field.label}
                              className="w-full max-h-60 object-cover rounded-lg border border-gray-200"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-3">
                              <Button
                                size="icon"
                                variant="accent"
                                onClick={() => fileInputRefs.current[field.key]?.click()}
                              >
                                <Upload className="w-4 h-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="destructive"
                                onClick={() => handleImageDelete(currentSection.id, field.key, field.value)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => fileInputRefs.current[field.key]?.click()}
                            disabled={uploadingField === field.key}
                            className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#5F4E9D] transition-colors cursor-pointer disabled:opacity-50 bg-white"
                          >
                            {uploadingField === field.key ? (
                              <>
                                <RefreshCw className="w-10 h-10 text-[#5F4E9D] mx-auto mb-3 animate-spin" />
                                <p className="text-[#5F4E9D] text-sm font-medium">Laster opp...</p>
                              </>
                            ) : (
                              <>
                                <Image className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-500 text-sm">Klikk for å laste opp bilde</p>
                                <p className="text-gray-400 text-xs mt-1">PNG, JPG, WebP opptil 5MB</p>
                              </>
                            )}
                          </button>
                        )}

                        {/* URL input for manual entry */}
                        <Input
                          type="url"
                          value={field.value}
                          onChange={(e) => updateField(currentSection.id, field.key, e.target.value)}
                          placeholder="Eller lim inn bilde-URL direkte..."
                          className="text-sm"
                        />
                      </div>
                    )}

                    {field.type === 'video' && (
                      <div className="space-y-3">
                        {/* Hidden file input for video */}
                        <input
                          type="file"
                          ref={(el) => { fileInputRefs.current[field.key] = el }}
                          accept="video/mp4,video/webm,video/quicktime"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              handleVideoUpload(currentSection.id, field.key, file)
                            }
                            e.target.value = ''
                          }}
                          className="hidden"
                        />

                        {field.value ? (
                          <div className="relative group">
                            <video
                              src={field.value}
                              className="w-full max-h-60 object-cover rounded-lg border border-gray-200"
                              controls
                              muted
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-3">
                              <Button
                                size="icon"
                                variant="accent"
                                onClick={() => fileInputRefs.current[field.key]?.click()}
                              >
                                <Upload className="w-4 h-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="destructive"
                                onClick={() => handleImageDelete(currentSection.id, field.key, field.value)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => fileInputRefs.current[field.key]?.click()}
                            disabled={uploadingField === field.key}
                            className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#5F4E9D] transition-colors cursor-pointer disabled:opacity-50 bg-white"
                          >
                            {uploadingField === field.key ? (
                              <>
                                <RefreshCw className="w-10 h-10 text-[#5F4E9D] mx-auto mb-3 animate-spin" />
                                <p className="text-[#5F4E9D] text-sm font-medium">Laster opp video...</p>
                              </>
                            ) : (
                              <>
                                <Video className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-500 text-sm">Klikk for å laste opp video</p>
                                <p className="text-gray-400 text-xs mt-1">MP4, WebM opptil 50MB</p>
                              </>
                            )}
                          </button>
                        )}

                        {/* URL input for manual entry */}
                        <Input
                          type="url"
                          value={field.value}
                          onChange={(e) => updateField(currentSection.id, field.key, e.target.value)}
                          placeholder="Eller lim inn video-URL direkte..."
                          className="text-sm"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </div>
          )}
        </Card>
      </div>

      {/* Info */}
      <Card className="border-l-4 border-l-[#F2DE27]">
        <CardContent className="p-6">
          <h3 className="text-base font-semibold text-[#1C244B] mb-2">Tips</h3>
          <ul className="text-gray-500 text-sm space-y-1">
            <li>Endringer lagres i databasen og oppdateres automatisk på nettsiden</li>
            <li>For bilder kan du enten laste opp en fil eller lime inn en ekstern URL</li>
            <li>Maksimal filstørrelse for bilder er 5MB</li>
            <li>Refresh nettsiden etter lagring for å se endringene</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
