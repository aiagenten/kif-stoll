import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit2, Trash2, X, Save, Check, Crown, Star, Award, Medal, Loader2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'

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
  diamant: { icon: Crown, label: 'Diamant', color: 'text-purple-400' },
  gull: { icon: Star, label: 'Gull', color: 'text-yellow-400' },
  solv: { icon: Award, label: 'Sølv', color: 'text-gray-300' },
  bronse: { icon: Medal, label: 'Bronse', color: 'text-orange-400' },
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
        <Loader2 className="w-8 h-8 text-[#c9a227] animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Medlemspakker</h2>
          <p className="text-gray-500 text-sm">Administrer priser og innhold i pakkene</p>
        </div>
        <motion.button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-4 py-2 gradient-gold rounded-lg text-[#1a1a1a] font-semibold"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="w-5 h-5" />
          <span>Ny pakke</span>
        </motion.button>
      </div>

      {/* Packages grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {packages.length === 0 ? (
          <div className="col-span-2 glass rounded-xl p-8 text-center">
            <p className="text-gray-400">Ingen pakker ennå. Klikk "Ny pakke" for å opprette den første!</p>
          </div>
        ) : (
          packages.map((pkg, index) => {
            const config = tierConfig[pkg.tier] || tierConfig.bronse
            const Icon = config.icon
            return (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`glass rounded-xl p-6 ${pkg.popular ? 'ring-2 ring-[#c9a227]' : ''}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 gradient-gold rounded-lg">
                      <Icon className="w-6 h-6 text-[#1a1a1a]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{pkg.name}</h3>
                      <p className="text-gray-500 text-sm">{pkg.description}</p>
                    </div>
                  </div>
                  {pkg.popular && (
                    <span className="px-2 py-1 gradient-gold rounded text-xs font-bold text-[#1a1a1a]">
                      Mest populær
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-[#2a2a2a] rounded-lg p-3">
                    <div className="text-[#c9a227] font-bold">{pkg.durability}</div>
                    <div className="text-gray-500 text-xs">holdbarhet</div>
                  </div>
                  <div className="bg-[#2a2a2a] rounded-lg p-3">
                    <div className="text-white font-medium text-sm">{pkg.checkup_price} kr årlig</div>
                    <div className="text-gray-500 text-xs">etterkontroll</div>
                  </div>
                </div>

                <div className="text-gray-400 text-sm mb-4">
                  {pkg.features?.length || 0} inkluderte tjenester
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => togglePopular(pkg.id, pkg.popular)}
                    className={`py-2 px-3 border rounded-lg transition-colors ${
                      pkg.popular 
                        ? 'border-[#c9a227] text-[#c9a227]' 
                        : 'border-gray-600 text-gray-400 hover:border-[#c9a227]'
                    }`}
                  >
                    ⭐
                  </button>
                  <button
                    onClick={() => handleEdit(pkg)}
                    className="flex-1 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-white/5 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Rediger</span>
                  </button>
                  <button
                    onClick={() => handleDelete(pkg.id)}
                    className="py-2 px-4 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )
          })
        )}
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={(e) => e.target === e.currentTarget && resetForm()}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass rounded-2xl p-6 w-full max-w-2xl my-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">
                  {editingPackage ? 'Rediger pakke' : 'Ny pakke'}
                </h3>
                <button onClick={resetForm} className="text-gray-400 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Pakkenavn</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 rounded-lg bg-[#2a2a2a] border border-gray-700 text-white focus:border-[#c9a227] focus:outline-none"
                      placeholder="f.eks. Diamant"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Tier</label>
                    <select
                      value={formData.tier}
                      onChange={(e) => setFormData(prev => ({ ...prev, tier: e.target.value as CarPackage['tier'] }))}
                      className="w-full px-4 py-3 rounded-lg bg-[#2a2a2a] border border-gray-700 text-white focus:border-[#c9a227] focus:outline-none"
                    >
                      <option value="diamant">💎 Diamant</option>
                      <option value="gull">⭐ Gull</option>
                      <option value="solv">🥈 Sølv</option>
                      <option value="bronse">🥉 Bronse</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">Beskrivelse</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg bg-[#2a2a2a] border border-gray-700 text-white focus:border-[#c9a227] focus:outline-none"
                    placeholder="f.eks. Komplett premium pakke"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Holdbarhet</label>
                    <input
                      type="text"
                      value={formData.durability}
                      onChange={(e) => setFormData(prev => ({ ...prev, durability: e.target.value }))}
                      className="w-full px-4 py-3 rounded-lg bg-[#2a2a2a] border border-gray-700 text-white focus:border-[#c9a227] focus:outline-none"
                      placeholder="f.eks. 6-9 år"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Etterkontroll (kr)</label>
                    <input
                      type="number"
                      value={formData.checkup_price}
                      onChange={(e) => setFormData(prev => ({ ...prev, checkup_price: parseInt(e.target.value) || 0 }))}
                      className="w-full px-4 py-3 rounded-lg bg-[#2a2a2a] border border-gray-700 text-white focus:border-[#c9a227] focus:outline-none"
                      placeholder="500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Rekkefølge</label>
                    <input
                      type="number"
                      value={formData.order_index}
                      onChange={(e) => setFormData(prev => ({ ...prev, order_index: parseInt(e.target.value) || 0 }))}
                      className="w-full px-4 py-3 rounded-lg bg-[#2a2a2a] border border-gray-700 text-white focus:border-[#c9a227] focus:outline-none"
                      placeholder="1"
                    />
                  </div>
                  <div className="flex items-end">
                    <div className="flex items-center space-x-3 pb-3">
                      <input
                        type="checkbox"
                        id="popular"
                        checked={formData.popular}
                        onChange={(e) => setFormData(prev => ({ ...prev, popular: e.target.checked }))}
                        className="w-5 h-5 rounded border-gray-700 bg-[#2a2a2a] text-[#c9a227] focus:ring-[#c9a227]"
                      />
                      <label htmlFor="popular" className="text-gray-300">Mest populær</label>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Inkluderte tjenester</label>
                  <div className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                      className="flex-1 px-4 py-2 rounded-lg bg-[#2a2a2a] border border-gray-700 text-white focus:border-[#c9a227] focus:outline-none text-sm"
                      placeholder="Legg til tjeneste..."
                    />
                    <button
                      type="button"
                      onClick={addFeature}
                      className="px-4 py-2 gradient-gold rounded-lg text-[#1a1a1a]"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                    {formData.features?.map((item, index) => (
                      <span
                        key={index}
                        className="flex items-center space-x-1 px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-sm"
                      >
                        <Check className="w-3 h-3" />
                        <span>{item}</span>
                        <button type="button" onClick={() => removeFeature(index)} className="ml-1 hover:text-red-400">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 py-3 border border-gray-600 rounded-lg text-gray-300 font-semibold hover:bg-white/5 transition-colors"
                  >
                    Avbryt
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={!formData.name || !formData.durability || saving}
                    className="flex-1 py-3 gradient-gold rounded-lg text-[#1a1a1a] font-semibold flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        <span>Lagre</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
