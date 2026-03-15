import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Calendar, User, ArrowLeft } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { BlogPost as BlogPostType } from '../lib/supabase'
import { Helmet } from 'react-helmet-async'

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [post, setPost] = useState<BlogPostType | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (slug) {
      fetchPost()
    }
  }, [slug])

  const fetchPost = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .single()

      if (error) throw error
      setPost(data)
    } catch (error) {
      console.error('Error fetching post:', error)
      navigate('/blogg')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('nb-NO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="pt-24 pb-16 min-h-screen bg-[#1a1a1a] flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#c9a227]"></div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="pt-24 pb-16 min-h-screen bg-[#1a1a1a]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Innlegget ble ikke funnet</h1>
          <Link to="/blogg" className="text-[#c9a227] hover:underline">
            ← Tilbake til bloggen
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>{post.meta_title || post.title} | STOLL Esportsenter</title>
        <meta name="description" content={post.meta_description || post.excerpt || ''} />
        {post.featured_image && <meta property="og:image" content={post.featured_image} />}
      </Helmet>

      <div className="pt-24 pb-16 min-h-screen bg-[#1a1a1a]">
        <article className="max-w-4xl mx-auto px-4">
          {/* Back link */}
          <Link 
            to="/blogg" 
            className="inline-flex items-center gap-2 text-gray-400 hover:text-[#c9a227] transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Tilbake til bloggen
          </Link>

          {/* Featured Image */}
          {post.featured_image && (
            <div className="aspect-video rounded-xl overflow-hidden mb-8">
              <img
                src={post.featured_image}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Header */}
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              {post.title}
            </h1>
            
            <div className="flex items-center gap-6 text-gray-400">
              <span className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                {formatDate(post.created_at!)}
              </span>
              <span className="flex items-center gap-2">
                <User className="w-5 h-5" />
                {post.author}
              </span>
            </div>
          </header>

          {/* Content */}
          <div 
            className="prose prose-lg prose-invert max-w-none
              prose-headings:text-white prose-headings:font-bold
              prose-p:text-gray-300 prose-p:leading-relaxed
              prose-a:text-[#c9a227] prose-a:no-underline hover:prose-a:underline
              prose-strong:text-white
              prose-ul:text-gray-300 prose-ol:text-gray-300
              prose-blockquote:border-l-[#c9a227] prose-blockquote:text-gray-400
              prose-img:rounded-lg"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Footer */}
          <footer className="mt-12 pt-8 border-t border-gray-800">
            <Link 
              to="/blogg" 
              className="inline-flex items-center gap-2 text-[#c9a227] hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              Se flere artikler
            </Link>
          </footer>
        </article>
      </div>
    </>
  )
}
