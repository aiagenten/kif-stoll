import { useState, useEffect, useMemo } from 'react'
import { Plus, Edit2, Trash2, Eye, EyeOff, Save, X, Image as ImageIcon } from 'lucide-react'
import { supabase, uploadImage } from '../../lib/supabase'
import type { BlogPost } from '../../lib/supabase'
import ReactQuill from 'react-quill-new'
import 'quill/dist/quill.snow.css'

export default function AdminBlog() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<BlogPost | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  const quillModules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['blockquote', 'link', 'image'],
      ['clean']
    ]
  }), [])

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setPosts(data || [])
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[æ]/g, 'ae')
      .replace(/[ø]/g, 'o')
      .replace(/[å]/g, 'a')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleNew = () => {
    setEditing({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      featured_image: '',
      author: 'STOLL Esportsenter',
      published: false,
      meta_title: '',
      meta_description: ''
    })
    setIsNew(true)
  }

  const handleEdit = (post: BlogPost) => {
    setEditing({ ...post })
    setIsNew(false)
  }

  const handleCancel = () => {
    setEditing(null)
    setIsNew(false)
  }

  const handleSave = async () => {
    if (!editing) return
    
    if (!editing.title || !editing.content) {
      alert('Tittel og innhold er påkrevd')
      return
    }

    setSaving(true)
    try {
      const slug = editing.slug || generateSlug(editing.title)
      const postData = {
        ...editing,
        slug,
        updated_at: new Date().toISOString()
      }

      if (isNew) {
        const { error } = await supabase
          .from('blog_posts')
          .insert([postData])
        
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', editing.id)
        
        if (error) throw error
      }

      await fetchPosts()
      handleCancel()
    } catch (error: any) {
      console.error('Error saving post:', error)
      alert('Feil ved lagring: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (post: BlogPost) => {
    if (!confirm(`Vil du slette "${post.title}"?`)) return

    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', post.id)

      if (error) throw error
      await fetchPosts()
    } catch (error) {
      console.error('Error deleting post:', error)
      alert('Feil ved sletting')
    }
  }

  const handleTogglePublish = async (post: BlogPost) => {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .update({ published: !post.published })
        .eq('id', post.id)

      if (error) throw error
      await fetchPosts()
    } catch (error) {
      console.error('Error toggling publish:', error)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !editing) return

    setUploadingImage(true)
    try {
      const url = await uploadImage(file, 'blog')
      if (url) {
        setEditing({ ...editing, featured_image: url })
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Feil ved opplasting av bilde')
    } finally {
      setUploadingImage(false)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('nb-NO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#c9a227]"></div>
      </div>
    )
  }

  // Edit/Create form
  if (editing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">
            {isNew ? 'Nytt innlegg' : 'Rediger innlegg'}
          </h2>
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-600 text-gray-400 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-[#c9a227] text-black font-semibold rounded-lg hover:bg-[#b8922a] transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Lagrer...' : 'Lagre'}
            </button>
          </div>
        </div>

        <div className="glass rounded-xl p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Tittel *</label>
            <input
              type="text"
              value={editing.title}
              onChange={(e) => setEditing({ ...editing, title: e.target.value, slug: generateSlug(e.target.value) })}
              className="w-full px-4 py-3 bg-[#2a2a2a] border border-gray-700 rounded-lg text-white focus:border-[#c9a227] focus:outline-none"
              placeholder="Artikkeltittel"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">URL-slug</label>
            <input
              type="text"
              value={editing.slug}
              onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
              className="w-full px-4 py-3 bg-[#2a2a2a] border border-gray-700 rounded-lg text-white focus:border-[#c9a227] focus:outline-none"
              placeholder="url-vennlig-slug"
            />
          </div>

          {/* Featured Image */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Fremhevet bilde</label>
            <div className="flex gap-4 items-start">
              {editing.featured_image && (
                <img 
                  src={editing.featured_image} 
                  alt="Preview" 
                  className="w-32 h-20 object-cover rounded-lg"
                />
              )}
              <label className="flex items-center gap-2 px-4 py-3 bg-[#2a2a2a] border border-gray-700 rounded-lg text-gray-400 hover:text-white hover:border-[#c9a227] cursor-pointer transition-colors">
                <ImageIcon className="w-5 h-5" />
                {uploadingImage ? 'Laster opp...' : 'Last opp bilde'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploadingImage}
                />
              </label>
              {editing.featured_image && (
                <button
                  onClick={() => setEditing({ ...editing, featured_image: '' })}
                  className="px-3 py-3 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Utdrag</label>
            <textarea
              value={editing.excerpt || ''}
              onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })}
              rows={2}
              className="w-full px-4 py-3 bg-[#2a2a2a] border border-gray-700 rounded-lg text-white focus:border-[#c9a227] focus:outline-none resize-none"
              placeholder="Kort beskrivelse som vises i listen"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Innhold *</label>
            <div className="bg-white rounded-lg">
              <ReactQuill
                theme="snow"
                value={editing.content}
                onChange={(content) => setEditing({ ...editing, content })}
                modules={quillModules}
                className="[&_.ql-editor]:min-h-[300px]"
              />
            </div>
          </div>

          {/* SEO Section */}
          <div className="border-t border-gray-700 pt-6">
            <h3 className="text-lg font-semibold text-white mb-4">SEO</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Meta-tittel</label>
                <input
                  type="text"
                  value={editing.meta_title || ''}
                  onChange={(e) => setEditing({ ...editing, meta_title: e.target.value })}
                  className="w-full px-4 py-3 bg-[#2a2a2a] border border-gray-700 rounded-lg text-white focus:border-[#c9a227] focus:outline-none"
                  placeholder="Tittel for søkemotorer (valgfritt)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Meta-beskrivelse</label>
                <textarea
                  value={editing.meta_description || ''}
                  onChange={(e) => setEditing({ ...editing, meta_description: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-3 bg-[#2a2a2a] border border-gray-700 rounded-lg text-white focus:border-[#c9a227] focus:outline-none resize-none"
                  placeholder="Beskrivelse for søkemotorer (valgfritt)"
                />
              </div>
            </div>
          </div>

          {/* Author & Published */}
          <div className="flex gap-6 items-center border-t border-gray-700 pt-6">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-400 mb-2">Forfatter</label>
              <input
                type="text"
                value={editing.author || ''}
                onChange={(e) => setEditing({ ...editing, author: e.target.value })}
                className="w-full px-4 py-3 bg-[#2a2a2a] border border-gray-700 rounded-lg text-white focus:border-[#c9a227] focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-400">Publisert</label>
              <button
                type="button"
                onClick={() => setEditing({ ...editing, published: !editing.published })}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  editing.published ? 'bg-[#c9a227]' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    editing.published ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Posts list
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Blogg</h2>
        <button
          onClick={handleNew}
          className="px-4 py-2 bg-[#c9a227] text-black font-semibold rounded-lg hover:bg-[#b8922a] transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nytt innlegg
        </button>
      </div>

      {posts.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center">
          <p className="text-gray-400 mb-4">Ingen blogginnlegg ennå</p>
          <button
            onClick={handleNew}
            className="text-[#c9a227] hover:underline"
          >
            Opprett ditt første innlegg
          </button>
        </div>
      ) : (
        <div className="glass rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="border-b border-gray-700">
              <tr className="text-left text-gray-400 text-sm">
                <th className="px-6 py-4">Tittel</th>
                <th className="px-6 py-4 hidden md:table-cell">Forfatter</th>
                <th className="px-6 py-4 hidden sm:table-cell">Dato</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Handlinger</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-white/5">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {post.featured_image && (
                        <img 
                          src={post.featured_image} 
                          alt="" 
                          className="w-12 h-8 object-cover rounded hidden sm:block"
                        />
                      )}
                      <span className="text-white font-medium truncate max-w-[200px]">
                        {post.title}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-400 hidden md:table-cell">
                    {post.author}
                  </td>
                  <td className="px-6 py-4 text-gray-400 hidden sm:table-cell">
                    {formatDate(post.created_at!)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      post.published 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {post.published ? 'Publisert' : 'Kladd'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleTogglePublish(post)}
                        className="p-2 text-gray-400 hover:text-white transition-colors"
                        title={post.published ? 'Avpubliser' : 'Publiser'}
                      >
                        {post.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleEdit(post)}
                        className="p-2 text-gray-400 hover:text-[#c9a227] transition-colors"
                        title="Rediger"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(post)}
                        className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                        title="Slett"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
