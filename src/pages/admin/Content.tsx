import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { FileText, Save, RefreshCw, Image, Type, AlignLeft, Phone, Sparkles, Clock, Upload, Trash2, Check, AlertCircle, Video } from 'lucide-react'
import { getAllContent, updateMultipleContent, uploadImage, uploadVideo, deleteImage, defaultContent } from '../../lib/supabase'

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
        <RefreshCw className="w-8 h-8 text-[#c9a227] animate-spin" />
        <span className="ml-3 text-gray-400">Laster innhold...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`fixed top-4 right-4 z-50 flex items-center space-x-2 px-4 py-3 rounded-lg shadow-lg ${
            notification.type === 'success' 
              ? 'bg-green-500/20 border border-green-500/30 text-green-400'
              : 'bg-red-500/20 border border-red-500/30 text-red-400'
          }`}
        >
          {notification.type === 'success' ? (
            <Check className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{notification.message}</span>
        </motion.div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Innholdsadministrasjon</h2>
          <p className="text-gray-500 text-sm">Rediger tekst og bilder på nettsiden</p>
        </div>
        <div className="flex items-center space-x-3">
          <motion.button
            onClick={loadContent}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <RefreshCw className="w-5 h-5" />
            <span>Oppdater</span>
          </motion.button>
          <motion.button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-all ${
              hasChanges 
                ? 'gradient-gold text-[#1a1a1a]' 
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
            whileHover={hasChanges ? { scale: 1.05 } : {}}
            whileTap={hasChanges ? { scale: 0.95 } : {}}
          >
            {saving ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            <span>{saving ? 'Lagrer...' : 'Lagre endringer'}</span>
          </motion.button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="glass rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-400 mb-4">SEKSJONER</h3>
          <div className="space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  activeSection === section.id
                    ? 'bg-[#c9a227]/10 text-[#c9a227]'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <section.icon className="w-5 h-5" />
                <span>{section.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content editor */}
        <div className="lg:col-span-3 glass rounded-xl p-6">
          {currentSection && (
            <motion.div
              key={currentSection.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                <currentSection.icon className="w-5 h-5 text-[#c9a227]" />
                <span>{currentSection.title}</span>
              </h3>

              <div className="space-y-4">
                {currentSection.fields.map((field) => (
                  <div key={field.key}>
                    <label className="block text-gray-400 text-sm mb-2">{field.label}</label>
                    
                    {(field.type === 'text' || field.type === 'url') && (
                      <input
                        type={field.type === 'url' ? 'url' : 'text'}
                        value={field.value}
                        onChange={(e) => updateField(currentSection.id, field.key, e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full px-4 py-3 rounded-lg bg-[#2a2a2a] border border-gray-700 text-white focus:border-[#c9a227] focus:outline-none placeholder-gray-600"
                      />
                    )}

                    {field.type === 'textarea' && (
                      <textarea
                        value={field.value}
                        onChange={(e) => updateField(currentSection.id, field.key, e.target.value)}
                        placeholder={field.placeholder}
                        rows={4}
                        className="w-full px-4 py-3 rounded-lg bg-[#2a2a2a] border border-gray-700 text-white focus:border-[#c9a227] focus:outline-none resize-none placeholder-gray-600"
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
                              className="w-full max-h-60 object-cover rounded-lg border border-gray-700"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-3">
                              <button
                                onClick={() => fileInputRefs.current[field.key]?.click()}
                                className="p-3 bg-[#c9a227] rounded-lg text-[#1a1a1a] hover:bg-[#d4af37] transition-colors"
                              >
                                <Upload className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleImageDelete(currentSection.id, field.key, field.value)}
                                className="p-3 bg-red-500 rounded-lg text-white hover:bg-red-600 transition-colors"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => fileInputRefs.current[field.key]?.click()}
                            disabled={uploadingField === field.key}
                            className="w-full border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-[#c9a227] transition-colors cursor-pointer disabled:opacity-50"
                          >
                            {uploadingField === field.key ? (
                              <>
                                <RefreshCw className="w-12 h-12 text-[#c9a227] mx-auto mb-3 animate-spin" />
                                <p className="text-[#c9a227] text-sm">Laster opp...</p>
                              </>
                            ) : (
                              <>
                                <Image className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                                <p className="text-gray-500 text-sm">Klikk for å laste opp bilde</p>
                                <p className="text-gray-600 text-xs mt-1">PNG, JPG, WebP opptil 5MB</p>
                              </>
                            )}
                          </button>
                        )}

                        {/* URL input for manual entry */}
                        <input
                          type="url"
                          value={field.value}
                          onChange={(e) => updateField(currentSection.id, field.key, e.target.value)}
                          placeholder="Eller lim inn bilde-URL direkte..."
                          className="w-full px-4 py-2 rounded-lg bg-[#2a2a2a] border border-gray-700 text-white text-sm focus:border-[#c9a227] focus:outline-none placeholder-gray-600"
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
                              className="w-full max-h-60 object-cover rounded-lg border border-gray-700"
                              controls
                              muted
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-3">
                              <button
                                onClick={() => fileInputRefs.current[field.key]?.click()}
                                className="p-3 bg-[#c9a227] rounded-lg text-[#1a1a1a] hover:bg-[#d4af37] transition-colors"
                              >
                                <Upload className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleImageDelete(currentSection.id, field.key, field.value)}
                                className="p-3 bg-red-500 rounded-lg text-white hover:bg-red-600 transition-colors"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => fileInputRefs.current[field.key]?.click()}
                            disabled={uploadingField === field.key}
                            className="w-full border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-[#c9a227] transition-colors cursor-pointer disabled:opacity-50"
                          >
                            {uploadingField === field.key ? (
                              <>
                                <RefreshCw className="w-12 h-12 text-[#c9a227] mx-auto mb-3 animate-spin" />
                                <p className="text-[#c9a227] text-sm">Laster opp video...</p>
                              </>
                            ) : (
                              <>
                                <Video className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                                <p className="text-gray-500 text-sm">Klikk for å laste opp video</p>
                                <p className="text-gray-600 text-xs mt-1">MP4, WebM opptil 50MB</p>
                              </>
                            )}
                          </button>
                        )}

                        {/* URL input for manual entry */}
                        <input
                          type="url"
                          value={field.value}
                          onChange={(e) => updateField(currentSection.id, field.key, e.target.value)}
                          placeholder="Eller lim inn video-URL direkte..."
                          className="w-full px-4 py-2 rounded-lg bg-[#2a2a2a] border border-gray-700 text-white text-sm focus:border-[#c9a227] focus:outline-none placeholder-gray-600"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="glass rounded-xl p-6 border-l-4 border-[#c9a227]">
        <h3 className="text-lg font-semibold text-white mb-2">📝 Tips</h3>
        <ul className="text-gray-400 text-sm space-y-1">
          <li>• Endringer lagres i databasen og oppdateres automatisk på nettsiden</li>
          <li>• For bilder kan du enten laste opp en fil eller lime inn en ekstern URL</li>
          <li>• Maksimal filstørrelse for bilder er 5MB</li>
          <li>• Refresh nettsiden etter lagring for å se endringene</li>
        </ul>
      </div>
    </div>
  )
}
