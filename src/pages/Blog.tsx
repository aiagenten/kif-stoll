import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, User, ArrowRight } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { BlogPost } from '../lib/supabase'
import { Helmet } from 'react-helmet-async'

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      setPosts(data || [])
    } catch (error) {
      console.error('Error fetching posts:', error)
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

  return (
    <>
      <Helmet>
        <title>Blogg | STOLL Esportsenter</title>
        <meta name="description" content="Les de siste nyhetene og artiklene fra STOLL Esportsenter. Esportnyheter, turneringer og gaming-tips." />
      </Helmet>

      <div className="pt-24 pb-16 min-h-screen bg-[#1a1a1a]">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Vår <span className="text-[#c9a227]">Blogg</span>
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Les våre siste artikler om esport, gaming-tips og nyheter fra STOLL Esportsenter.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#c9a227]"></div>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg">Ingen blogginnlegg ennå. Kom tilbake snart!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  to={`/blogg/${post.slug}`}
                  className="group glass rounded-xl overflow-hidden hover:border-[#c9a227]/50 transition-all duration-300"
                >
                  {/* Featured Image */}
                  {post.featured_image ? (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={post.featured_image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-gradient-to-br from-[#c9a227]/20 to-[#c9a227]/5 flex items-center justify-center">
                      <span className="text-[#c9a227] text-4xl font-bold">DD</span>
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-white mb-3 group-hover:text-[#c9a227] transition-colors line-clamp-2">
                      {post.title}
                    </h2>
                    
                    {post.excerpt && (
                      <p className="text-gray-400 mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(post.created_at!)}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {post.author}
                        </span>
                      </div>
                      <ArrowRight className="w-5 h-5 text-[#c9a227] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
