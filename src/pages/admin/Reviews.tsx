import { useState, useEffect } from 'react'
import { Star, Plus, Edit2, Trash2, Save, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from '@/components/ui/dialog'

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
    if (!confirm('Er du sikker p\u00e5 at du vil slette denne anmeldelsen?')) return

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
        <Loader2 className="w-8 h-8 text-[#5F4E9D] animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Anmeldelser</h2>
          <p className="text-gray-500 text-sm">Administrer kundeomtaler som vises p&aring; nettsiden</p>
        </div>
        <Button variant="accent" onClick={() => setIsAddingNew(true)}>
          <Plus className="w-5 h-5" />
          Legg til
        </Button>
      </div>

      {/* Add/Edit modal */}
      <Dialog open={isAddingNew} onOpenChange={(open) => { if (!open) resetForm() }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingReview ? 'Rediger anmeldelse' : 'Ny anmeldelse'}
            </DialogTitle>
          </DialogHeader>

          <DialogBody className="space-y-4">
            <div className="space-y-2">
              <Label>Navn</Label>
              <Input
                value={formData.author}
                onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                placeholder="Kundens navn"
              />
            </div>

            <div className="space-y-2">
              <Label>Vurdering</Label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                    className="p-1"
                    type="button"
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        star <= formData.rating
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Anmeldelse</Label>
              <Textarea
                value={formData.text}
                onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
                rows={4}
                placeholder="Hva sa kunden?"
              />
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="visible"
                checked={formData.visible}
                onChange={(e) => setFormData(prev => ({ ...prev, visible: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-300 text-[#5F4E9D] focus:ring-[#5F4E9D]"
              />
              <Label htmlFor="visible" className="cursor-pointer">Vis p&aring; nettsiden</Label>
            </div>
          </DialogBody>

          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>
              Avbryt
            </Button>
            <Button
              variant="accent"
              onClick={handleSave}
              disabled={!formData.author || !formData.text || saving}
            >
              {saving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Lagre
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reviews list */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500">Ingen anmeldelser enn&aring;. Klikk "Legg til" for &aring; opprette den f&oslash;rste!</p>
          </Card>
        ) : (
          reviews.map((review) => (
            <Card key={review.id} className={!review.visible ? 'opacity-50' : ''}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="font-semibold text-gray-900">{review.author}</span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      {!review.visible && (
                        <Badge variant="secondary">Skjult</Badge>
                      )}
                    </div>
                    <p className="text-gray-600">{review.text}</p>
                  </div>

                  <div className="flex items-center space-x-1 ml-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleVisibility(review.id, review.visible)}
                      title={review.visible ? 'Skjul' : 'Vis'}
                      className={review.visible ? 'text-green-600 hover:text-green-700' : 'text-gray-400'}
                    >
                      {review.visible ? (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/></svg>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(review)}
                      className="hover:text-[#5F4E9D]"
                    >
                      <Edit2 className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(review.id)}
                      className="hover:text-red-500"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Info box */}
      <Card className="border-l-4 border-l-[#F2DE27]">
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Tips</h3>
          <p className="text-gray-500 text-sm">
            For &aring; synkronisere med Google Reviews, koble til Google My Business API i innstillingene.
            Forel&oslash;pig kan du manuelt legge til anmeldelser fra Google her.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
