import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Plus, Edit2, Trash2, X, Save, Loader2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface Review {
  id: string
  created_at?: string
  author: string
  rating: number
  text: string
  visible: boolean
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingReview, setEditingReview] = useState<Review | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)

  const [formData, setFormData] = useState({
    author: '',
    rating: 5,
    text: '',
    visible: true,
  })

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setReviews(data || [])
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (editingReview) {
        // Update existing review
        const { error } = await supabase
          .from('reviews')
          .update({
            author: formData.author,
            rating: formData.rating,
            text: formData.text,
            visible: formData.visible,
          })
          .eq('id', editingReview.id)

        if (error) throw error
        
        setReviews(prev => prev.map(r => 
          r.id === editingReview.id 
            ? { ...r, ...formData, author: formData.author }
            : r
        ))
      } else {
        // Insert new review
        const { data, error } = await supabase
          .from('reviews')
          .insert([{
            author: formData.author,
            rating: formData.rating,
            text: formData.text,
            visible: formData.visible,
          }])
          .select()
          .single()

        if (error) throw error
        if (data) {
          setReviews(prev => [data, ...prev])
        }
      }
      resetForm()
    } catch (error) {
      console.error('Error saving review:', error)
      alert('Kunne ikke lagre anmeldelse. Sjekk konsollen for detaljer.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Er du sikker på at du vil slette denne anmeldelsen?')) return

    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', id)

      if (error) throw error
      setReviews(prev => prev.filter(r => r.id !== id))
    } catch (error) {
      console.error('Error deleting review:', error)
      alert('Kunne ikke slette anmeldelse.')
    }
  }

  const handleEdit = (review: Review) => {
    setEditingReview(review)
    setFormData({
      author: review.author,
      rating: review.rating,
      text: review.text,
      visible: review.visible,
    })
    setIsAddingNew(true)
  }

  const resetForm = () => {
    setEditingReview(null)
    setIsAddingNew(false)
    setFormData({ author: '', rating: 5, text: '', visible: true })
  }

  const toggleVisibility = async (id: string, currentVisible: boolean) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ visible: !currentVisible })
        .eq('id', id)

      if (error) throw error
      setReviews(prev => prev.map(r =>
        r.id === id ? { ...r, visible: !currentVisible } : r
      ))
    } catch (error) {
      console.error('Error toggling visibility:', error)
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
          <h2 className="text-xl font-bold text-white">Anmeldelser</h2>
          <p className="text-gray-500 text-sm">Administrer kundeomtaler som vises på nettsiden</p>
        </div>
        <motion.button
          onClick={() => setIsAddingNew(true)}
          className="flex items-center space-x-2 px-4 py-2 gradient-gold rounded-lg text-[#1a1a1a] font-semibold"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="w-5 h-5" />
          <span>Legg til</span>
        </motion.button>
      </div>

      {/* Add/Edit modal */}
      <AnimatePresence>
        {isAddingNew && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && resetForm()}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass rounded-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">
                  {editingReview ? 'Rediger anmeldelse' : 'Ny anmeldelse'}
                </h3>
                <button onClick={resetForm} className="text-gray-400 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Navn</label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg bg-[#2a2a2a] border border-gray-700 text-white focus:border-[#c9a227] focus:outline-none"
                    placeholder="Kundens navn"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">Vurdering</label>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                        className="p-1"
                      >
                        <Star
                          className={`w-8 h-8 transition-colors ${
                            star <= formData.rating 
                              ? 'text-yellow-400 fill-yellow-400' 
                              : 'text-gray-600'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">Anmeldelse</label>
                  <textarea
                    value={formData.text}
                    onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg bg-[#2a2a2a] border border-gray-700 text-white focus:border-[#c9a227] focus:outline-none resize-none"
                    placeholder="Hva sa kunden?"
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="visible"
                    checked={formData.visible}
                    onChange={(e) => setFormData(prev => ({ ...prev, visible: e.target.checked }))}
                    className="w-5 h-5 rounded border-gray-700 bg-[#2a2a2a] text-[#c9a227] focus:ring-[#c9a227]"
                  />
                  <label htmlFor="visible" className="text-gray-300">Vis på nettsiden</label>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={resetForm}
                    className="flex-1 py-3 border border-gray-600 rounded-lg text-gray-300 font-semibold hover:bg-white/5 transition-colors"
                  >
                    Avbryt
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!formData.author || !formData.text || saving}
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

      {/* Reviews list */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="glass rounded-xl p-8 text-center">
            <p className="text-gray-400">Ingen anmeldelser ennå. Klikk "Legg til" for å opprette den første!</p>
          </div>
        ) : (
          reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`glass rounded-xl p-6 ${!review.visible ? 'opacity-50' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="font-semibold text-white">{review.author}</span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating 
                              ? 'text-yellow-400 fill-yellow-400' 
                              : 'text-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                    {!review.visible && (
                      <span className="px-2 py-1 rounded text-xs bg-gray-700 text-gray-400">
                        Skjult
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400">{review.text}</p>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => toggleVisibility(review.id, review.visible)}
                    className={`p-2 rounded-lg transition-colors ${
                      review.visible 
                        ? 'text-green-400 hover:bg-green-500/10' 
                        : 'text-gray-500 hover:bg-gray-500/10'
                    }`}
                    title={review.visible ? 'Skjul' : 'Vis'}
                  >
                    {review.visible ? '👁' : '👁‍🗨'}
                  </button>
                  <button
                    onClick={() => handleEdit(review)}
                    className="p-2 rounded-lg text-gray-400 hover:bg-white/5 hover:text-[#c9a227] transition-colors"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(review.id)}
                    className="p-2 rounded-lg text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Info box */}
      <div className="glass rounded-xl p-6 border-l-4 border-[#c9a227]">
        <h3 className="text-lg font-semibold text-white mb-2">💡 Tips</h3>
        <p className="text-gray-400 text-sm">
          For å synkronisere med Google Reviews, koble til Google My Business API i innstillingene.
          Foreløpig kan du manuelt legge til anmeldelser fra Google her.
        </p>
      </div>
    </div>
  )
}
