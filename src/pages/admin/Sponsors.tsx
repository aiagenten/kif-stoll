import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit2, Trash2, Save, X, Image as ImageIcon, Eye, EyeOff, GripVertical } from 'lucide-react'
import { getAllSponsors, createSponsor, updateSponsor, deleteSponsor, uploadImage } from '../../lib/supabase'
import type { Sponsor } from '../../lib/supabase'

const emptySponsor: Omit<Sponsor, 'id' | 'created_at'> = {
  name: '',
  logo_url: '',
  website: '',
  order_index: 0,
  visible: true,
}

export default function AdminSponsors() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Sponsor | null>(null)
  const [formData, setFormData] = useState<Omit<Sponsor, 'id' | 'created_at'>>(emptySponsor)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  useEffect(() => {
    loadSponsors()
  }, [])

  const loadSponsors = async () => {
    setLoading(true)
    try {
      const data = await getAllSponsors()
      setSponsors(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (sponsor: Sponsor) => {
    setEditing(sponsor)
    setFormData({
      name: sponsor.name,
      logo_url: sponsor.logo_url || '',
      website: sponsor.website || '',
      order_index: sponsor.order_index,
      visible: sponsor.visible,
    })
    setShowForm(true)
  }

  const handleNew = () => {
    setEditing(null)
    setFormData({ ...emptySponsor, order_index: sponsors.length })
    setShowForm(true)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditing(null)
    setFormData(emptySponsor)
  }

  const handleSave = async () => {
    if (!formData.name) {
      alert('Navn er påkrevd')
      return
    }
    setSaving(true)
    try {
      if (editing?.id) {
        await updateSponsor(editing.id, formData)
      } else {
        await createSponsor(formData)
      }
      await loadSponsors()
      handleCancel()
    } catch (err) {
      console.error(err)
      alert('Kunne ikke lagre sponsor')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Slett sponsor "${name}"?`)) return
    try {
      await deleteSponsor(id)
      await loadSponsors()
    } catch (err) {
      console.error(err)
      alert('Kunne ikke slette sponsor')
    }
  }

  const handleToggleVisible = async (sponsor: Sponsor) => {
    if (!sponsor.id) return
    try {
      await updateSponsor(sponsor.id, { visible: !sponsor.visible })
      await loadSponsors()
    } catch (err) {
      console.error(err)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingImage(true)
    try {
      const url = await uploadImage(file, 'sponsors')
      if (url) setFormData({ ...formData, logo_url: url })
    } catch (err) {
      console.error(err)
      alert('Feil ved opplasting av logo')
    } finally {
      setUploadingImage(false)
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sponsorer</h1>
          <p className="text-gray-600">Administrer sponsorlogoer som vises på nettsiden</p>
        </div>
        <button
          onClick={handleNew}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <Plus size={18} /> Ny sponsor
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl w-full max-w-lg"
          >
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold">{editing ? 'Rediger sponsor' : 'Ny sponsor'}</h2>
              <button onClick={handleCancel} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium mb-1">Navn *</label>
                <input
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="F.eks. Logitech"
                />
              </div>

              {/* Website */}
              <div>
                <label className="block text-sm font-medium mb-1">Nettside</label>
                <input
                  value={formData.website || ''}
                  onChange={e => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="https://logitech.com"
                />
              </div>

              {/* Logo */}
              <div>
                <label className="block text-sm font-medium mb-2">Logo</label>
                <div className="space-y-2">
                  {formData.logo_url && (
                    <div className="flex items-center gap-3">
                      <img
                        src={formData.logo_url}
                        alt="Logo preview"
                        className="h-16 max-w-[160px] object-contain rounded border bg-gray-50 p-2"
                      />
                      <button
                        onClick={() => setFormData({ ...formData, logo_url: '' })}
                        className="p-2 text-red-400 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                  <label className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg text-gray-500 hover:text-purple-600 hover:border-purple-400 cursor-pointer transition-colors w-fit">
                    <ImageIcon size={18} />
                    {uploadingImage ? 'Laster opp...' : 'Last opp logo'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                  </label>
                </div>
              </div>

              {/* Order & Visible */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Rekkefølge</label>
                  <input
                    type="number"
                    value={formData.order_index}
                    onChange={e => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-lg"
                    min={0}
                  />
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.visible}
                      onChange={e => setFormData({ ...formData, visible: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm font-medium">Synlig</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="p-6 border-t flex justify-end gap-3">
              <button onClick={handleCancel} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                Avbryt
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !formData.name}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                <Save size={16} /> {saving ? 'Lagrer...' : 'Lagre'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Sponsors list */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Laster...</div>
      ) : sponsors.length === 0 ? (
        <div className="text-center py-12">
          <ImageIcon size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 mb-3">Ingen sponsorer enda</p>
          <button
            onClick={handleNew}
            className="text-purple-600 hover:underline text-sm"
          >
            Legg til første sponsor
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {sponsors
            .sort((a, b) => a.order_index - b.order_index)
            .map(sponsor => (
              <motion.div
                key={sponsor.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-center gap-4 p-4 bg-white rounded-xl border hover:shadow-sm transition-shadow ${
                  !sponsor.visible ? 'opacity-60' : ''
                }`}
              >
                <GripVertical size={18} className="text-gray-300 cursor-grab" />

                {/* Logo */}
                <div className="w-20 h-12 flex items-center justify-center bg-gray-50 rounded border flex-shrink-0">
                  {sponsor.logo_url ? (
                    <img
                      src={sponsor.logo_url}
                      alt={sponsor.name}
                      className="max-w-full max-h-full object-contain p-1"
                    />
                  ) : (
                    <ImageIcon size={20} className="text-gray-300" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{sponsor.name}</h3>
                    {!sponsor.visible && (
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">Skjult</span>
                    )}
                  </div>
                  {sponsor.website && (
                    <a
                      href={sponsor.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-purple-600 hover:underline"
                    >
                      {sponsor.website}
                    </a>
                  )}
                  <p className="text-xs text-gray-400 mt-0.5">Rekkefølge: {sponsor.order_index}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleVisible(sponsor)}
                    className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg"
                    title={sponsor.visible ? 'Skjul' : 'Vis'}
                  >
                    {sponsor.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                  <button
                    onClick={() => handleEdit(sponsor)}
                    className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg"
                    title="Rediger"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => sponsor.id && handleDelete(sponsor.id, sponsor.name)}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    title="Slett"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
        </div>
      )}
    </div>
  )
}
