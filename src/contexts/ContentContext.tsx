import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { getAllContent, defaultContent, updateContent as updateContentInDb, uploadImage } from '../lib/supabase'

interface ContentContextType {
  content: Record<string, string>
  loading: boolean
  error: string | null
  getContentValue: (key: string, fallback?: string) => string
  updateContent: (key: string, value: string) => Promise<boolean>
  uploadContentImage: (file: File, key: string) => Promise<string | null>
  refreshContent: () => Promise<void>
}

const ContentContext = createContext<ContentContextType | undefined>(undefined)

export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<Record<string, string>>(defaultContent)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchContent = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getAllContent()
      
      // Merge with defaults (database values take precedence)
      setContent({ ...defaultContent, ...data })
    } catch (err) {
      console.error('Failed to fetch content:', err)
      setError('Kunne ikke laste innhold')
      // Keep using defaults on error
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchContent()
  }, [fetchContent])

  const getContentValue = useCallback((key: string, fallback?: string): string => {
    return content[key] ?? fallback ?? defaultContent[key] ?? ''
  }, [content])

  const updateContent = useCallback(async (key: string, value: string): Promise<boolean> => {
    const success = await updateContentInDb(key, value)
    if (success) {
      setContent(prev => ({ ...prev, [key]: value }))
    }
    return success
  }, [])

  const uploadContentImage = useCallback(async (file: File, key: string): Promise<string | null> => {
    const folder = key.includes('hero') ? 'hero' : 
                   key.includes('about') ? 'about' : 
                   key.includes('team') ? 'team' : 'general'
    
    const url = await uploadImage(file, folder)
    if (url) {
      // Also update the content in database
      await updateContent(key, url)
    }
    return url
  }, [updateContent])

  const refreshContent = useCallback(async () => {
    await fetchContent()
  }, [fetchContent])

  return (
    <ContentContext.Provider
      value={{
        content,
        loading,
        error,
        getContentValue,
        updateContent,
        uploadContentImage,
        refreshContent
      }}
    >
      {children}
    </ContentContext.Provider>
  )
}

export function useContent() {
  const context = useContext(ContentContext)
  if (context === undefined) {
    throw new Error('useContent must be used within a ContentProvider')
  }
  return context
}

// Hook for getting a single content value with optional fallback
export function useContentValue(key: string, fallback?: string): string {
  const { getContentValue, loading } = useContent()
  return loading ? (fallback ?? defaultContent[key] ?? '') : getContentValue(key, fallback)
}
