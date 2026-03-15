import { useState } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import type { ThemeName } from '../contexts/ThemeContext'

const themes: { name: ThemeName; label: string; icon: string; colors: string[] }[] = [
  { 
    name: 'gold', 
    label: 'Gold Classic', 
    icon: '✨',
    colors: ['#1a1a1a', '#c9a227', '#a67c00']
  },
  { 
    name: 'red', 
    label: 'Racing Red', 
    icon: '🔴',
    colors: ['#1a1a1a', '#dc2626', '#991b1b']
  },
  { 
    name: 'neon', 
    label: 'Neon Nights', 
    icon: '⚡',
    colors: ['#0a0a1a', '#00f0ff', '#ff00ff']
  },
]

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  const currentTheme = themes.find(t => t.name === theme)

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Theme selector panel */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 glass rounded-2xl p-4 w-64 shadow-2xl border border-[var(--color-secondary)]/20 animate-slide-up">
          <div className="text-sm font-semibold mb-3 text-[var(--color-secondary)]">
            🎨 Velg Design
          </div>
          <div className="space-y-2">
            {themes.map((t) => (
              <button
                key={t.name}
                onClick={() => {
                  setTheme(t.name)
                  setIsOpen(false)
                }}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                  theme === t.name 
                    ? 'bg-[var(--color-secondary)]/20 ring-2 ring-[var(--color-secondary)]' 
                    : 'hover:bg-white/5'
                }`}
              >
                <span className="text-2xl">{t.icon}</span>
                <div className="flex-1 text-left">
                  <div className="font-medium text-sm">{t.label}</div>
                  <div className="flex gap-1 mt-1">
                    {t.colors.map((color, i) => (
                      <div 
                        key={i} 
                        className="w-4 h-4 rounded-full border border-white/20"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                {theme === t.name && (
                  <span className="text-[var(--color-secondary)]">✓</span>
                )}
              </button>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-white/10 text-xs text-gray-400 text-center">
            Demo for STOLL Esportsenter
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-[var(--color-secondary)] text-[var(--color-primary)] shadow-lg shadow-[var(--color-secondary)]/30 flex items-center justify-center text-2xl hover:scale-110 transition-transform active:scale-95"
        title="Bytt design"
      >
        {isOpen ? '✕' : currentTheme?.icon || '🎨'}
      </button>
    </div>
  )
}
