import { useEffect, useState } from 'react'
import { useNavigate, Outlet, Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  FileText, 
  Star, 
  Settings, 
  LogOut, 
  Menu,
  MessageSquare,
  Package,
  BookOpen,
  Search,
  Calendar,
  ClipboardList,
  Users,
  Gamepad2,
  Share2
} from 'lucide-react'
import { supabase } from '../../lib/supabase'

const menuItems = [
  { icon: LayoutDashboard, label: 'Oversikt', path: '/admin' },
  { icon: FileText, label: 'Innhold', path: '/admin/content' },
  { icon: Calendar, label: 'Events', path: '/admin/events' },
  { icon: ClipboardList, label: 'Bookinger', path: '/admin/bookings' },
  { icon: Users, label: 'Sponsorer', path: '/admin/sponsors' },
  { icon: Package, label: 'Pakker', path: '/admin/packages' },
  { icon: BookOpen, label: 'Blogg', path: '/admin/blog' },
  { icon: Star, label: 'Anmeldelser', path: '/admin/reviews' },
  { icon: MessageSquare, label: 'Meldinger', path: '/admin/messages' },
  { icon: Share2, label: 'Sosiale Medier', path: '/admin/some' },
  { icon: Search, label: 'SEO & AEO', path: '/admin/seo' },
  { icon: Settings, label: 'Innstillinger', path: '/admin/settings' },
]

export default function AdminDashboard() {
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      navigate('/admin/login')
    } else {
      setUser(session.user)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/admin/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile menu overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#1C244B] flex flex-col transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold">
            <Gamepad2 size={24} className="text-[#F2DE27]" />
            <span className="text-[#F2DE27]">STOLL</span>
            <span className="text-white/60 text-sm font-normal">Admin</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = item.path === '/admin'
              ? location.pathname === item.path
              : location.pathname === item.path || location.pathname.startsWith(item.path + '/')
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors text-sm ${
                  isActive 
                    ? 'bg-[#5F4E9D] text-white' 
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* User / Logout */}
        <div className="p-4 border-t border-white/10">
          <div className="text-gray-400 text-xs mb-2 truncate">
            {user?.email}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-2.5 rounded-lg text-gray-300 hover:bg-red-500/20 hover:text-red-300 transition-colors w-full text-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>Logg ut</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="bg-white border-b px-4 lg:px-8 py-4 flex items-center justify-between sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 text-gray-600 hover:text-gray-900"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <h1 className="text-lg font-semibold text-gray-900">
            {menuItems.find(item => item.path === location.pathname)?.label || 'Admin'}
          </h1>

          <Link 
            to="/" 
            target="_blank"
            className="text-purple-600 hover:text-purple-700 text-sm font-medium transition-colors"
          >
            Se nettside →
          </Link>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
