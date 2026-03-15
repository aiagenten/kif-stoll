import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'

export type ThemeName = 'gold' | 'red' | 'neon'

interface ThemeContextType {
  theme: ThemeName
  setTheme: (theme: ThemeName) => void
  darkMode: boolean
  setDarkMode: (dark: boolean) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>(() => {
    const saved = localStorage.getItem('dd-theme')
    return (saved as ThemeName) || 'gold'
  })
  const [darkMode, setDarkMode] = useState(true)

  const setTheme = (newTheme: ThemeName) => {
    setThemeState(newTheme)
    localStorage.setItem('dd-theme', newTheme)
  }

  useEffect(() => {
    // Remove all theme classes
    document.documentElement.classList.remove('theme-gold', 'theme-red', 'theme-neon')
    // Add current theme class
    document.documentElement.classList.add(`theme-${theme}`)
    
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme, darkMode])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, darkMode, setDarkMode }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
