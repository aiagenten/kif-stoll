import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Bot, Loader2 } from 'lucide-react'
import { getChatMessageCount, saveChatMessage } from '../lib/supabase'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const MONTHLY_QUOTA = 500
const SESSION_ID = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`
const AUTO_POPUP_KEY = 'stoll_chat_autopopup_shown'

const welcomeMessage: Message = {
  role: 'assistant',
  content: 'Hei! 👋 Jeg er STOLL sin AI-assistent. Spør meg om events, treninger, booking eller medlemskap!',
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([welcomeMessage])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [quotaExceeded, setQuotaExceeded] = useState(false)
  const [monthlyCount, setMonthlyCount] = useState(0)
  const [pulsing, setPulsing] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getChatMessageCount().then(count => {
      setMonthlyCount(count)
      if (count >= MONTHLY_QUOTA) setQuotaExceeded(true)
    })
  }, [])

  // Auto-popup after 10 seconds (only first time)
  useEffect(() => {
    const alreadyShown = localStorage.getItem(AUTO_POPUP_KEY)
    if (alreadyShown) return

    // Start pulsing after 7s to draw attention
    const pulseTimer = setTimeout(() => setPulsing(true), 7000)
    // Open chat after 10s
    const popupTimer = setTimeout(() => {
      setOpen(true)
      setPulsing(false)
      localStorage.setItem(AUTO_POPUP_KEY, '1')
    }, 10000)

    return () => {
      clearTimeout(pulseTimer)
      clearTimeout(popupTimer)
    }
  }, [])

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, open])

  const sendMessage = async () => {
    if (!input.trim() || loading || quotaExceeded) return

    const userMsg: Message = { role: 'user', content: input.trim() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    // Save user message
    await saveChatMessage(userMsg.content, 'user', SESSION_ID)
    const newCount = monthlyCount + 1
    setMonthlyCount(newCount)
    if (newCount >= MONTHLY_QUOTA) setQuotaExceeded(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg.content, history: messages }),
      })

      let assistantContent: string
      if (res.ok) {
        const data = await res.json()
        assistantContent = data.reply || data.message || 'Beklager, jeg forstod ikke det.'
      } else {
        // Fallback response when API not implemented yet
        assistantContent = getFallbackResponse(userMsg.content)
      }

      const assistantMsg: Message = { role: 'assistant', content: assistantContent }
      setMessages(prev => [...prev, assistantMsg])
      await saveChatMessage(assistantContent, 'assistant', SESSION_ID)
    } catch {
      const fallback = getFallbackResponse(userMsg.content)
      setMessages(prev => [...prev, { role: 'assistant', content: fallback }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 rounded-2xl overflow-hidden shadow-2xl"
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              boxShadow: '0 0 40px rgba(95,78,157,0.3)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3"
              style={{ background: 'var(--gradient-primary)' }}>
              <div className="flex items-center gap-2">
                <Bot size={18} className="text-white" />
                <div>
                  <p className="text-sm font-black text-white">STOLL AI</p>
                  <p className="text-xs text-white/70">
                    {quotaExceeded ? 'Kvote nådd' : `${MONTHLY_QUOTA - monthlyCount} meldinger igjen`}
                  </p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="h-72 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className="max-w-[80%] px-3 py-2 rounded-xl text-sm leading-relaxed"
                    style={msg.role === 'user'
                      ? { background: 'var(--color-primary)', color: '#fff' }
                      : { background: 'var(--color-surface-light)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }
                    }
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="px-3 py-2 rounded-xl" style={{ background: 'var(--color-surface-light)', border: '1px solid var(--color-border)' }}>
                    <Loader2 size={16} className="animate-spin" style={{ color: 'var(--color-text-muted)' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
              {quotaExceeded ? (
                <p className="text-xs text-center py-2" style={{ color: 'var(--color-text-muted)' }}>
                  Månedlig kvote nådd. Prøv igjen neste måned! 🙏
                </p>
              ) : (
                <form
                  onSubmit={(e) => { e.preventDefault(); sendMessage() }}
                  className="flex gap-2"
                >
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Skriv en melding..."
                    className="flex-1 px-3 py-2 rounded-xl text-sm text-white placeholder-gray-500 outline-none"
                    style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}
                    disabled={loading}
                  />
                  <motion.button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-50"
                    style={{ background: 'var(--gradient-primary)' }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Send size={14} className="text-white" />
                  </motion.button>
                </form>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <motion.button
        onClick={() => { setOpen(!open); setPulsing(false) }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
        style={{ background: 'var(--gradient-primary)' }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Åpne chat"
        animate={pulsing ? { scale: [1, 1.15, 1] } : {}}
        transition={pulsing ? { repeat: Infinity, duration: 1.2 } : {}}
      >
        {/* Pulse ring */}
        {pulsing && (
          <>
            <motion.span
              className="absolute w-14 h-14 rounded-full"
              style={{ background: 'var(--gradient-primary)', opacity: 0.5 }}
              animate={{ scale: [1, 1.6], opacity: [0.5, 0] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
            />
            <motion.span
              className="absolute w-14 h-14 rounded-full"
              style={{ background: 'var(--gradient-primary)', opacity: 0.3 }}
              animate={{ scale: [1, 2], opacity: [0.3, 0] }}
              transition={{ repeat: Infinity, duration: 1.2, delay: 0.3 }}
            />
          </>
        )}
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X size={24} className="text-white" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageCircle size={24} className="text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  )
}

function getFallbackResponse(message: string): string {
  const m = message.toLowerCase()
  if (m.includes('booking') || m.includes('book')) return 'For booking, klikk på et event i "Events"-seksjonen og trykk "Reserver Plass". 🎮'
  if (m.includes('turne') || m.includes('turnerin')) return 'Vi arrangerer turneringer jevnlig! Sjekk events-seksjonen for kommende turneringer. 🏆'
  if (m.includes('pris') || m.includes('kost') || m.includes('betale')) return 'Ta kontakt via skjemaet for prisinformasjon, eller ring oss direkte! 📞'
  if (m.includes('åpn') || m.includes('tider')) return 'Vi er åpne Man-Fre: 14-22, Lørdag: 11-23, Søndag: 12-20. 🕹️'
  if (m.includes('med') || m.includes('member')) return 'Bli medlem og få tilgang til alle fasiliteter og rabatter! Kontakt oss for info. ⚡'
  return 'Takk for din melding! Vi er ikke tilgjengelig akkurat nå. Du kan nå oss via kontaktskjemaet eller ring oss direkte. 🙌'
}
