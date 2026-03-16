import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Save, Check, Crown, Star, Award, Medal, Loader2, X } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from '@/components/ui/dialog'

interface CarPackage {
  id: string
  name: string
  tier: 'bronse' | 'solv' | 'gull' | 'diamant'
  description: string
  features: string[]
  durability: string
  checkup_price: number
  popular: boolean
  order_index: number
}

const tierConfig = {
  diamant: { icon: Crown, label: 'Diamant', color: 'text-purple-600' },
  gull: { icon: Star, label: 'Gull', color: 'text-yellow-600' },
  solv: { icon: Award, label: 'Solv', color: 'text-gray-500' },
  bronse: { icon: Medal, label: 'Bronse', color: 'text-orange-600' },
}

export default function AdminPackages() {
  const [packages, setPackages] = useState<CarPackage[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingPackage, setEditingPackage] = useState<CarPackage | null>(null)
  const [showModal, setShowModal] = useState(false)

  const [formData, setFormData] = useState<Partial<CarPackage>>({
    name: '',
    tier: 'bronse',
    description: '',
    features: [],
    durability: '',
    checkup_price: 500,
    popular: false,
    order_index: 0,
  })

  const [newFeature, setNewFeature] = useState('')

  useEffect(() => {
    fetchPackages()
  }, [])

  const fetchPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .order('order_index', { ascending: true })

      if (error) throw error
      setPackages(data || [])
    } catch (error) {
      console.error('Error fetching packages:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (pkg: CarPackage) => {
    setEditingPackage(pkg)
    setFormData({
      name: pkg.name,
      tier: pkg.tier,
      description: pkg.description,
      features: pkg.features || [],
      durability: pkg.durability,
      checkup_price: pkg.checkup_price,
      popular: pkg.popular,
      order_index: pkg.order_index,
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (editingPackage) {
        // Update existing package
        const { error } = await supabase
          .from('packages')
          .update({
            name: formData.name,
            tier: formData.tier,
            description: formData.description,
            features: formData.features,
            durability: formData.durability,
            checkup_price: formData.checkup_price,
            popular: formData.popular,
            order_index: formData.order_index,
          })
          .eq('id', editingPackage.id)

        if (error) throw error

        setPackages(prev => prev.map(p =>
          p.id === editingPackage.id ? { ...p, ...formData } as CarPackage : p
        ))
      } else {
        // Insert new package
        const { data, error } = await supabase
          .from('packages')
          .insert([{
            name: formData.name,
            tier: formData.tier,
            description: formData.description,
            features: formData.features,
            durability: formData.durability,
            checkup_price: formData.checkup_price,
            popular: formData.popular,
            order_index: formData.order_index || packages.length + 1,
          }])
          .select()
          .single()

        if (error) throw error
        if (data) {
          setPackages(prev => [...prev, data].sort((a, b) => a.order_index - b.order_index))
        }
      }
      resetForm()
    } catch (error) {
      console.error('Error saving package:', error)
      alert('Kunne ikke lagre pakke. Sjekk konsollen for detaljer.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Er du sikker på at du vil slette denne pakken?')) return

    try {
      const { error } = await supabase
        .from('packages')
        .delete()
        .eq('id', id)

      if (error) throw error
      setPackages(prev => prev.filter(p => p.id !== id))
    } catch (error) {
      console.error('Error deleting package:', error)
      alert('Kunne ikke slette pakke.')
    }
  }

  const resetForm = () => {
    setEditingPackage(null)
    setShowModal(false)
    setFormData({
      name: '',
      tier: 'bronse',
      description: '',
      features: [],
      durability: '',
      checkup_price: 500,
      popular: false,
      order_index: 0,
    })
    setNewFeature('')
  }

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...(prev.features || []), newFeature.trim()]
      }))
      setNewFeature('')
    }
  }

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features?.filter((_, i) => i !== index) || []
    }))
  }

  const togglePopular = async (id: string, currentPopular: boolean) => {
    try {
      const { error } = await supabase
        .from('packages')
        .update({ popular: !currentPopular })
        .eq('id', id)

      if (error) throw error
      setPackages(prev => prev.map(p =>
        p.id === id ? { ...p, popular: !currentPopular } : p
      ))
    } catch (error) {
      console.error('Error toggling popular:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-[#5F4E9D] animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Medlemspakker</h2>
          <p className="text-gray-500 text-sm">Administrer priser og innhold i pakkene</p>
        </div>
        <Button variant="accent" onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4" />
          <span>Ny pakke</span>
        </Button>
      </div>

      {/* Packages grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {packages.length === 0 ? (
          <Card className="col-span-2">
            <CardContent className="p-8 text-center">
              <p className="text-gray-400">Ingen pakker enna. Klikk "Ny pakke" for å opprette den forste!</p>
            </CardContent>
          </Card>
        ) : (
          packages.map((pkg) => {
            const config = tierConfig[pkg.tier] || tierConfig.bronse
            const Icon = config.icon
            return (
              <Card
                key={pkg.id}
                className={pkg.popular ? 'ring-2 ring-[#F2DE27]' : ''}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#5F4E9D] rounded-lg">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle>{pkg.name}</CardTitle>
                        <p className="text-gray-500 text-sm mt-1">{pkg.description}</p>
                      </div>
                    </div>
                    {pkg.popular && (
                      <Badge variant="warning">Mest populaer</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-[#5F4E9D] font-bold">{pkg.durability}</div>
                      <div className="text-gray-500 text-xs">holdbarhet</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-gray-900 font-medium text-sm">{pkg.checkup_price} kr årlig</div>
                      <div className="text-gray-500 text-xs">etterkontroll</div>
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm">
                    {pkg.features?.length || 0} inkluderte tjenester
                  </p>
                </CardContent>
                <CardFooter className="gap-2">
                  <Button
                    variant={pkg.popular ? 'outline' : 'ghost'}
                    size="icon"
                    onClick={() => togglePopular(pkg.id, pkg.popular)}
                    className={pkg.popular ? 'border-[#F2DE27] text-[#F2DE27]' : ''}
                  >
                    <Star className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleEdit(pkg)}
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Rediger</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(pkg.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardFooter>
              </Card>
            )
          })
        )}
      </div>

      {/* Edit Modal */}
      <Dialog open={showModal} onOpenChange={(open) => { if (!open) resetForm() }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingPackage ? 'Rediger pakke' : 'Ny pakke'}
            </DialogTitle>
          </DialogHeader>

          <DialogBody className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pkg-name">Pakkenavn</Label>
                <Input
                  id="pkg-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="f.eks. Diamant"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pkg-tier">Tier</Label>
                <Select
                  id="pkg-tier"
                  value={formData.tier}
                  onChange={(e) => setFormData(prev => ({ ...prev, tier: e.target.value as CarPackage['tier'] }))}
                >
                  <option value="diamant">Diamant</option>
                  <option value="gull">Gull</option>
                  <option value="solv">Solv</option>
                  <option value="bronse">Bronse</option>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pkg-desc">Beskrivelse</Label>
              <Input
                id="pkg-desc"
                type="text"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="f.eks. Komplett premium pakke"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pkg-dur">Holdbarhet</Label>
                <Input
                  id="pkg-dur"
                  type="text"
                  value={formData.durability}
                  onChange={(e) => setFormData(prev => ({ ...prev, durability: e.target.value }))}
                  placeholder="f.eks. 6-9 år"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pkg-price">Etterkontroll (kr)</Label>
                <Input
                  id="pkg-price"
                  type="number"
                  value={formData.checkup_price}
                  onChange={(e) => setFormData(prev => ({ ...prev, checkup_price: parseInt(e.target.value) || 0 }))}
                  placeholder="500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pkg-order">Rekkefolge</Label>
                <Input
                  id="pkg-order"
                  type="number"
                  value={formData.order_index}
                  onChange={(e) => setFormData(prev => ({ ...prev, order_index: parseInt(e.target.value) || 0 }))}
                  placeholder="1"
                />
              </div>
              <div className="flex items-end pb-1">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="popular"
                    checked={formData.popular}
                    onChange={(e) => setFormData(prev => ({ ...prev, popular: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-300 text-[#5F4E9D] focus:ring-[#5F4E9D]"
                  />
                  <Label htmlFor="popular">Mest populaer</Label>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-2">
              <Label>Inkluderte tjenester</Label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                  placeholder="Legg til tjeneste..."
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="accent"
                  size="icon"
                  onClick={addFeature}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                {formData.features?.map((item, index) => (
                  <Badge
                    key={index}
                    variant="success"
                    className="gap-1"
                  >
                    <Check className="w-3 h-3" />
                    <span>{item}</span>
                    <button type="button" onClick={() => removeFeature(index)} className="ml-1 hover:text-red-600">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </DialogBody>

          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>
              Avbryt
            </Button>
            <Button
              variant="accent"
              onClick={handleSave}
              disabled={!formData.name || !formData.durability || saving}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Lagre</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
