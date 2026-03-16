import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { ContentProvider } from './contexts/ContentContext'
import { ThemeProvider } from './contexts/ThemeContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ChatWidget from './components/ChatWidget'
import CookieBanner from './components/CookieBanner'
import GamingBackground from './components/GamingBackground'
import Home from './pages/Home'
import Blog from './pages/Blog'
import BlogPost from './pages/BlogPost'
import AdminLogin from './pages/admin/Login'
import AdminDashboard from './pages/admin/Dashboard'
import AdminOverview from './pages/admin/Overview'
import AdminMessages from './pages/admin/Messages'
import AdminReviews from './pages/admin/Reviews'
import AdminContent from './pages/admin/Content'
import AdminPackages from './pages/admin/Packages'
import AdminBlog from './pages/admin/Blog'
import AdminSettings from './pages/admin/Settings'
import AdminSEO from './pages/admin/SEO'
import AdminEvents from './pages/admin/Events'
import AdminBookings from './pages/admin/Bookings'
import AdminSponsors from './pages/admin/Sponsors'
import AdminSoMe from './pages/admin/SoMe'
import AdminSoMeEditor from './pages/admin/SoMeEditor'
import AdminSoMeSettings from './pages/admin/SoMeSettings'
import AdminChatbot from './pages/admin/Chatbot'

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <GamingBackground>
      <div className="min-h-screen" style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}>
        <Navbar />
        {children}
        <Footer />
        <ChatWidget />
        <CookieBanner />
      </div>
    </GamingBackground>
  )
}

function App() {
  return (
    <HelmetProvider>
      <ContentProvider>
        <ThemeProvider>
          <BrowserRouter>
            <Routes>
              {/* Admin routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminDashboard />}>
                <Route index element={<AdminOverview />} />
                <Route path="content" element={<AdminContent />} />
                <Route path="packages" element={<AdminPackages />} />
                <Route path="reviews" element={<AdminReviews />} />
                <Route path="messages" element={<AdminMessages />} />
                <Route path="blog" element={<AdminBlog />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="seo" element={<AdminSEO />} />
                <Route path="events" element={<AdminEvents />} />
                <Route path="bookings" element={<AdminBookings />} />
                <Route path="sponsors" element={<AdminSponsors />} />
                <Route path="some" element={<AdminSoMe />} />
                <Route path="some/new" element={<AdminSoMeEditor />} />
                <Route path="some/edit/:id" element={<AdminSoMeEditor />} />
                <Route path="some/settings" element={<AdminSoMeSettings />} />
              </Route>

              {/* Chatbot admin */}
              <Route path="chatbot" element={<AdminChatbot />} />

              {/* Blog / Nyheter */}
              <Route path="/blogg" element={<Navigate to="/nyheter" replace />} />
              <Route path="/blogg/:slug" element={
                <PublicLayout><BlogPost /></PublicLayout>
              } />
              <Route path="/nyheter" element={
                <PublicLayout><Blog /></PublicLayout>
              } />
              <Route path="/nyheter/:slug" element={
                <PublicLayout><BlogPost /></PublicLayout>
              } />

              {/* Main site */}
              <Route path="/" element={
                <PublicLayout><Home /></PublicLayout>
              } />
            </Routes>
          </BrowserRouter>
        </ThemeProvider>
      </ContentProvider>
    </HelmetProvider>
  )
}

export default App
