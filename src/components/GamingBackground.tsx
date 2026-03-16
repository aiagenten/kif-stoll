import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

// Single floating pixel/particle
interface Particle {
  id: number
  x: number
  y: number
  size: number
  color: string
  speed: number
  opacity: number
  delay: number
}

const PARTICLE_COLORS = ['#5F4E9D', '#F2DE27', '#a78bfa', '#7c3aed', '#4ade80']

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
    speed: Math.random() * 20 + 15,
    opacity: Math.random() * 0.4 + 0.1,
    delay: Math.random() * 8,
  }))
}

// Grid overlay component
function GridOverlay() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0"
      style={{
        backgroundImage: `
          linear-gradient(rgba(95,78,157,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(95,78,157,0.04) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
      }}
    />
  )
}

// Scanlines overlay
function Scanlines() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0"
      style={{
        backgroundImage: `repeating-linear-gradient(
          0deg,
          transparent,
          transparent 2px,
          rgba(0,0,0,0.03) 2px,
          rgba(0,0,0,0.03) 4px
        )`,
        backgroundSize: '100% 4px',
      }}
    />
  )
}

// Floating particles
function FloatingParticles({ particles }: { particles: Particle[] }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-sm"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            opacity: p.opacity,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [p.opacity, p.opacity * 1.5, p.opacity],
          }}
          transition={{
            duration: p.speed,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

// Corner decorative elements
function CornerDecorations() {
  return (
    <>
      {/* Top-left */}
      <div className="pointer-events-none fixed top-0 left-0 z-0" style={{ opacity: 0.08 }}>
        <svg width="200" height="200" viewBox="0 0 200 200" fill="none">
          <path d="M0 0 L80 0 L80 4 L4 4 L4 80 L0 80 Z" fill="#5F4E9D" />
          <path d="M0 0 L40 0 L40 2 L2 2 L2 40 L0 40 Z" fill="#F2DE27" />
        </svg>
      </div>
      {/* Bottom-right */}
      <div className="pointer-events-none fixed bottom-0 right-0 z-0" style={{ opacity: 0.08 }}>
        <svg width="200" height="200" viewBox="0 0 200 200" fill="none">
          <path d="M200 200 L120 200 L120 196 L196 196 L196 120 L200 120 Z" fill="#5F4E9D" />
          <path d="M200 200 L160 200 L160 198 L198 198 L198 160 L200 160 Z" fill="#F2DE27" />
        </svg>
      </div>
    </>
  )
}

// Glitch line that appears occasionally
function GlitchLine() {
  const [visible, setVisible] = useState(false)
  const [position, setPosition] = useState(30)

  useEffect(() => {
    const interval = setInterval(() => {
      setPosition(Math.random() * 80 + 10)
      setVisible(true)
      setTimeout(() => setVisible(false), 150)
    }, 6000 + Math.random() * 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <motion.div
      className="pointer-events-none fixed left-0 right-0 z-0 h-px"
      style={{
        top: `${position}%`,
        background: 'linear-gradient(90deg, transparent, rgba(242,222,39,0.6), transparent)',
      }}
      animate={{ opacity: visible ? 1 : 0, scaleX: visible ? 1 : 0 }}
      transition={{ duration: 0.08 }}
    />
  )
}

// Scroll-reactive glow
function ScrollGlow() {
  const { scrollYProgress } = useScroll()
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 0.06, 0])
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.4, 1])

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-0"
      style={{
        background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(95,78,157,0.4), transparent)',
        opacity,
        scale,
      }}
    />
  )
}

// Main wrapper component
interface GamingBackgroundProps {
  children: React.ReactNode
}

export default function GamingBackground({ children }: GamingBackgroundProps) {
  const particlesRef = useRef<Particle[]>(generateParticles(18))

  return (
    <div className="relative">
      {/* Background elements */}
      <GridOverlay />
      <Scanlines />
      <FloatingParticles particles={particlesRef.current} />
      <CornerDecorations />
      <GlitchLine />
      <ScrollGlow />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
