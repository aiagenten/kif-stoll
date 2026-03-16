import { useState, useEffect, useMemo } from 'react'
import { Plus, Edit2, Trash2, Eye, EyeOff, Save, X, Image as ImageIcon } from 'lucide-react'
import { supabase, uploadImage } from '@/lib/supabase'
import type { BlogPost } from '@/lib/supabase'
import ReactQuill from 'react-quill-new'
import 'quill/dist/quill.snow.css'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'

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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5F4E9D]" />
      </div>
    )
  }

  // Edit/Create form
  if (editing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {isNew ? 'Nytt innlegg' : 'Rediger innlegg'}
          </h2>
          <div className="flex gap-3">
            <Button variant="outline" size="icon" onClick={handleCancel}>
              <X className="w-5 h-5" />
            </Button>
            <Button variant="accent" onClick={handleSave} disabled={saving}>
              <Save className="w-5 h-5" />
              {saving ? 'Lagrer...' : 'Lagre'}
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Innhold</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label>Tittel *</Label>
              <Input
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value, slug: generateSlug(e.target.value) })}
                placeholder="Artikkeltittel"
              />
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <Label>URL-slug</Label>
              <Input
                value={editing.slug}
                onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                placeholder="url-vennlig-slug"
              />
            </div>

            {/* Featured Image */}
            <div className="space-y-2">
              <Label>Fremhevet bilde</Label>
              <div className="flex gap-4 items-start">
                {editing.featured_image && (
                  <img
                    src={editing.featured_image}
                    alt="Preview"
                    className="w-32 h-20 object-cover rounded-lg"
                  />
                )}
                <label className="cursor-pointer">
                  <Button variant="outline" asChild>
                    <span>
                      <ImageIcon className="w-5 h-5" />
                      {uploadingImage ? 'Laster opp...' : 'Last opp bilde'}
                    </span>
                  </Button>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploadingImage}
                  />
                </label>
                {editing.featured_image && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditing({ ...editing, featured_image: '' })}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                )}
              </div>
            </div>

            {/* Excerpt */}
            <div className="space-y-2">
              <Label>Utdrag</Label>
              <Textarea
                value={editing.excerpt || ''}
                onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })}
                rows={2}
                placeholder="Kort beskrivelse som vises i listen"
              />
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label>Innhold *</Label>
              <div className="rounded-lg border border-gray-200">
                <ReactQuill
                  theme="snow"
                  value={editing.content}
                  onChange={(content) => setEditing({ ...editing, content })}
                  modules={quillModules}
                  className="[&_.ql-editor]:min-h-[300px]"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SEO Section */}
        <Card>
          <CardHeader>
            <CardTitle>SEO</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Meta-tittel</Label>
              <Input
                value={editing.meta_title || ''}
                onChange={(e) => setEditing({ ...editing, meta_title: e.target.value })}
                placeholder="Tittel for søkemotorer (valgfritt)"
              />
            </div>
            <div className="space-y-2">
              <Label>Meta-beskrivelse</Label>
              <Textarea
                value={editing.meta_description || ''}
                onChange={(e) => setEditing({ ...editing, meta_description: e.target.value })}
                rows={2}
                placeholder="Beskrivelse for søkemotorer (valgfritt)"
              />
            </div>
          </CardContent>
        </Card>

        {/* Author & Published */}
        <Card>
          <CardHeader>
            <CardTitle>Innstillinger</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-6 items-end">
              <div className="flex-1 space-y-2">
                <Label>Forfatter</Label>
                <Input
                  value={editing.author || ''}
                  onChange={(e) => setEditing({ ...editing, author: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-3 pb-1">
                <Label>Publisert</Label>
                <Switch
                  checked={editing.published}
                  onCheckedChange={(checked) => setEditing({ ...editing, published: checked })}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Posts list
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Blogg</h2>
        <Button variant="accent" onClick={handleNew}>
          <Plus className="w-5 h-5" />
          Nytt innlegg
        </Button>
      </div>

      {posts.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500 mb-4">Ingen blogginnlegg enn&aring;</p>
          <Button variant="link" onClick={handleNew}>
            Opprett ditt f&oslash;rste innlegg
          </Button>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tittel</TableHead>
                <TableHead className="hidden md:table-cell">Forfatter</TableHead>
                <TableHead className="hidden sm:table-cell">Dato</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Handlinger</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {post.featured_image && (
                        <img
                          src={post.featured_image}
                          alt=""
                          className="w-12 h-8 object-cover rounded hidden sm:block"
                        />
                      )}
                      <span className="font-medium text-gray-900 truncate max-w-[200px]">
                        {post.title}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-500 hidden md:table-cell">
                    {post.author}
                  </TableCell>
                  <TableCell className="text-gray-500 hidden sm:table-cell">
                    {formatDate(post.created_at!)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={post.published ? 'success' : 'secondary'}>
                      {post.published ? 'Publisert' : 'Kladd'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleTogglePublish(post)}
                        title={post.published ? 'Avpubliser' : 'Publiser'}
                      >
                        {post.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(post)}
                        title="Rediger"
                        className="hover:text-[#5F4E9D]"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(post)}
                        title="Slett"
                        className="hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
