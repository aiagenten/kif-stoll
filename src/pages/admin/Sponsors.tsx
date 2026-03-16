import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Save, Image as ImageIcon, Eye, EyeOff, GripVertical } from 'lucide-react'
import { getAllSponsors, createSponsor, updateSponsor, deleteSponsor, uploadImage } from '@/lib/supabase'
import type { Sponsor } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from '@/components/ui/dialog'

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
          <p className="text-gray-600 text-sm mt-1">Administrer sponsorlogoer som vises på nettsiden</p>
        </div>
        <Button onClick={handleNew}>
          <Plus size={18} /> Ny sponsor
        </Button>
      </div>

      {/* Form modal */}
      <Dialog open={showForm} onOpenChange={(open) => !open && handleCancel()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Rediger sponsor' : 'Ny sponsor'}</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-4">
            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="sponsor-name">Navn *</Label>
              <Input
                id="sponsor-name"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="F.eks. Logitech"
              />
            </div>

            {/* Website */}
            <div className="space-y-1.5">
              <Label htmlFor="sponsor-website">Nettside</Label>
              <Input
                id="sponsor-website"
                value={formData.website || ''}
                onChange={e => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://logitech.com"
              />
            </div>

            {/* Logo */}
            <div className="space-y-2">
              <Label>Logo</Label>
              {formData.logo_url && (
                <div className="flex items-center gap-3">
                  <img
                    src={formData.logo_url}
                    alt="Logo preview"
                    className="h-16 max-w-[160px] object-contain rounded border bg-gray-50 p-2"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-400 hover:text-red-600 hover:bg-red-50"
                    onClick={() => setFormData({ ...formData, logo_url: '' })}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              )}
              <label className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg text-gray-500 hover:text-[#5F4E9D] hover:border-[#5F4E9D] cursor-pointer transition-colors w-fit text-sm">
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

            {/* Order & Visible */}
            <div className="flex gap-4">
              <div className="flex-1 space-y-1.5">
                <Label htmlFor="sponsor-order">Rekkefølge</Label>
                <Input
                  id="sponsor-order"
                  type="number"
                  value={formData.order_index}
                  onChange={e => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
                  min={0}
                />
              </div>
              <div className="flex items-end pb-1">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.visible}
                    onCheckedChange={(checked) => setFormData({ ...formData, visible: checked })}
                  />
                  <Label className="cursor-pointer">Synlig</Label>
                </div>
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              Avbryt
            </Button>
            <Button onClick={handleSave} disabled={saving || !formData.name}>
              <Save size={16} /> {saving ? 'Lagrer...' : 'Lagre'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sponsors list */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Laster...</div>
      ) : sponsors.length === 0 ? (
        <div className="text-center py-12">
          <ImageIcon size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 mb-3">Ingen sponsorer enda</p>
          <Button variant="link" onClick={handleNew}>
            Legg til første sponsor
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {sponsors
            .sort((a, b) => a.order_index - b.order_index)
            .map(sponsor => (
              <Card
                key={sponsor.id}
                className={`flex items-center gap-4 p-4 hover:shadow-md transition-shadow ${
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
                      <Badge variant="secondary">Skjult</Badge>
                    )}
                  </div>
                  {sponsor.website && (
                    <a
                      href={sponsor.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[#5F4E9D] hover:underline"
                    >
                      {sponsor.website}
                    </a>
                  )}
                  <p className="text-xs text-gray-400 mt-0.5">Rekkefølge: {sponsor.order_index}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleToggleVisible(sponsor)}
                    title={sponsor.visible ? 'Skjul' : 'Vis'}
                  >
                    {sponsor.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(sponsor)}
                    title="Rediger"
                  >
                    <Edit2 size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:text-red-600 hover:bg-red-50"
                    onClick={() => sponsor.id && handleDelete(sponsor.id, sponsor.name)}
                    title="Slett"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </Card>
            ))}
        </div>
      )}
    </div>
  )
}
