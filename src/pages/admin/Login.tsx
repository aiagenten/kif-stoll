import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, Mail, Eye, EyeOff, AlertCircle, Gamepad2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
      navigate('/admin')
    } catch (err: any) {
      setError(err.message || 'Innlogging feilet')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#1C244B] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Gamepad2 size={36} className="text-[#F2DE27]" />
            <h1 className="text-3xl font-bold">
              <span className="text-[#F2DE27]">STOLL</span>
              <span className="text-white/60 text-xl font-normal ml-2">Esportsenter</span>
            </h1>
          </div>
          <p className="text-gray-400 mt-2">Admin Panel</p>
        </div>

        {/* Login form */}
        <div className="bg-[#252d5a] rounded-2xl p-8 border border-white/10">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Logg inn</h2>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-2 bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6"
            >
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-400 text-sm">{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-2">E-post</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-lg bg-[#1C244B] border border-white/10 text-white focus:border-[#5F4E9D] focus:outline-none transition-colors"
                  placeholder="admin@stoll.gg"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">Passord</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 rounded-lg bg-[#1C244B] border border-white/10 text-white focus:border-[#5F4E9D] focus:outline-none transition-colors"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-[#5F4E9D] to-[#4a3d7a] rounded-lg text-white font-semibold flex items-center justify-center space-x-2 hover:shadow-lg hover:shadow-purple-500/20 transition-all disabled:opacity-50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <span>Logger inn...</span>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  <span>Logg inn</span>
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <a href="/" className="text-gray-500 hover:text-[#F2DE27] text-sm transition-colors">
              ← Tilbake til nettsiden
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
