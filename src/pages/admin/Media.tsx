import { useState, useEffect, useCallback } from 'react'
import { Upload, Trash2, Copy, Check, Film, Image as ImageIcon, Search, FolderPlus, Folder, ArrowLeft, Grid, List, Download } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

const BUCKET = 'media'

interface MediaFile {
  name: string
  id: string
  created_at: string
  metadata: {
    size: number
    mimetype: string
  }
  publicUrl: string
}

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

function isVideo(mime: string) {
  return mime?.startsWith('video/')
}

function isImage(mime: string) {
  return mime?.startsWith('image/')
}

export default function AdminMedia() {
  const [files, setFiles] = useState<MediaFile[]>([])
  const [folders, setFolders] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [currentFolder, setCurrentFolder] = useState('')
  const [search, setSearch] = useState('')
  const [copied, setCopied] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [newFolderName, setNewFolderName] = useState('')
  const [showNewFolder, setShowNewFolder] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set())

  const loadFiles = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.storage
        .from(BUCKET)
        .list(currentFolder || '', {
          limit: 200,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' },
        })

      if (error) throw error

      const dirs: string[] = []
      const fileList: MediaFile[] = []

      for (const item of data || []) {
        if (item.id === null) {
          // It's a folder
          dirs.push(item.name)
        } else if (item.name !== '.emptyFolderPlaceholder') {
          const path = currentFolder ? `${currentFolder}/${item.name}` : item.name
          const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path)
          fileList.push({
            name: item.name,
            id: item.id,
            created_at: item.created_at || '',
            metadata: item.metadata as MediaFile['metadata'],
            publicUrl: urlData.publicUrl,
          })
        }
      }

      setFolders(dirs)
      setFiles(fileList)
    } catch (err) {
      console.error('Error loading media:', err)
    } finally {
      setLoading(false)
    }
  }, [currentFolder])

  useEffect(() => {
    loadFiles()
  }, [loadFiles])

  const handleUpload = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return
    setUploading(true)

    try {
      for (const file of Array.from(fileList)) {
        const ext = file.name.split('.').pop()
        const safeName = file.name
          .replace(/\.[^/.]+$/, '')
          .replace(/[^a-zA-Z0-9_-]/g, '_')
          .substring(0, 60)
        const fileName = `${safeName}-${Date.now()}.${ext}`
        const path = currentFolder ? `${currentFolder}/${fileName}` : fileName

        const { error } = await supabase.storage
          .from(BUCKET)
          .upload(path, file, { cacheControl: '3600', upsert: false })

        if (error) {
          console.error(`Upload failed for ${file.name}:`, error)
          alert(`Feil ved opplasting av ${file.name}: ${error.message}`)
        }
      }
      await loadFiles()
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (fileName: string) => {
    if (!confirm(`Slett ${fileName}?`)) return
    const path = currentFolder ? `${currentFolder}/${fileName}` : fileName
    const { error } = await supabase.storage.from(BUCKET).remove([path])
    if (error) {
      alert('Feil ved sletting: ' + error.message)
    } else {
      await loadFiles()
    }
  }

  const handleBulkDelete = async () => {
    if (selectedFiles.size === 0) return
    if (!confirm(`Slett ${selectedFiles.size} filer?`)) return
    const paths = Array.from(selectedFiles).map(name =>
      currentFolder ? `${currentFolder}/${name}` : name
    )
    const { error } = await supabase.storage.from(BUCKET).remove(paths)
    if (error) {
      alert('Feil ved sletting: ' + error.message)
    } else {
      setSelectedFiles(new Set())
      await loadFiles()
    }
  }

  const copyUrl = (url: string, name: string) => {
    navigator.clipboard.writeText(url)
    setCopied(name)
    setTimeout(() => setCopied(null), 2000)
  }

  const createFolder = async () => {
    if (!newFolderName.trim()) return
    const folderPath = currentFolder
      ? `${currentFolder}/${newFolderName.trim()}/.emptyFolderPlaceholder`
      : `${newFolderName.trim()}/.emptyFolderPlaceholder`

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(folderPath, new Blob([''], { type: 'text/plain' }), { upsert: true })

    if (error) {
      alert('Feil: ' + error.message)
    } else {
      setNewFolderName('')
      setShowNewFolder(false)
      await loadFiles()
    }
  }

  const filteredFiles = search
    ? files.filter(f => f.name.toLowerCase().includes(search.toLowerCase()))
    : files

  const imageCount = files.filter(f => isImage(f.metadata?.mimetype)).length
  const videoCount = files.filter(f => isVideo(f.metadata?.mimetype)).length
  const totalSize = files.reduce((sum, f) => sum + (f.metadata?.size || 0), 0)

  const toggleSelect = (name: string) => {
    setSelectedFiles(prev => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Mediebibliotek</h1>
          <p className="text-sm text-zinc-400 mt-1">
            {imageCount} bilder · {videoCount} videoer · {formatBytes(totalSize)} totalt
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowNewFolder(!showNewFolder)}
          >
            <FolderPlus className="h-4 w-4 mr-1" /> Ny mappe
          </Button>
          <label>
            <Button size="sm" disabled={uploading} asChild>
              <span>
                <Upload className="h-4 w-4 mr-1" />
                {uploading ? 'Laster opp...' : 'Last opp'}
              </span>
            </Button>
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              className="hidden"
              onChange={e => handleUpload(e.target.files)}
            />
          </label>
        </div>
      </div>

      {/* New folder input */}
      {showNewFolder && (
        <Card className="p-4 flex items-center gap-2">
          <Input
            placeholder="Mappenavn..."
            value={newFolderName}
            onChange={e => setNewFolderName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && createFolder()}
            className="max-w-xs"
          />
          <Button size="sm" onClick={createFolder}>Opprett</Button>
          <Button size="sm" variant="ghost" onClick={() => setShowNewFolder(false)}>Avbryt</Button>
        </Card>
      )}

      {/* Breadcrumb + search */}
      <div className="flex items-center gap-4">
        {currentFolder && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const parts = currentFolder.split('/')
              parts.pop()
              setCurrentFolder(parts.join('/'))
              setSelectedFiles(new Set())
            }}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Tilbake
          </Button>
        )}
        <div className="text-sm text-zinc-400">
          <span className="cursor-pointer hover:text-white" onClick={() => { setCurrentFolder(''); setSelectedFiles(new Set()) }}>
            media
          </span>
          {currentFolder && currentFolder.split('/').map((part, i, arr) => (
            <span key={i}>
              <span className="mx-1">/</span>
              <span
                className="cursor-pointer hover:text-white"
                onClick={() => { setCurrentFolder(arr.slice(0, i + 1).join('/')); setSelectedFiles(new Set()) }}
              >
                {part}
              </span>
            </span>
          ))}
        </div>
        <div className="flex-1" />
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Søk i filer..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Bulk actions */}
      {selectedFiles.size > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800 border border-zinc-700">
          <span className="text-sm text-zinc-300">{selectedFiles.size} valgt</span>
          <Button size="sm" variant="destructive" onClick={handleBulkDelete}>
            <Trash2 className="h-4 w-4 mr-1" /> Slett valgte
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setSelectedFiles(new Set())}>
            Avbryt
          </Button>
        </div>
      )}

      {/* Drop zone */}
      <div
        className={`relative min-h-[200px] rounded-xl border-2 border-dashed transition-colors ${
          dragOver ? 'border-purple-500 bg-purple-500/10' : 'border-zinc-700'
        }`}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); handleUpload(e.dataTransfer.files) }}
      >
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
          </div>
        ) : (
          <>
            {/* Folders */}
            {folders.length > 0 && (
              <div className="p-4 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {folders.map(folder => (
                  <button
                    key={folder}
                    onClick={() => { setCurrentFolder(currentFolder ? `${currentFolder}/${folder}` : folder); setSelectedFiles(new Set()) }}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-zinc-800 transition-colors"
                  >
                    <Folder className="h-10 w-10 text-yellow-500" />
                    <span className="text-xs text-zinc-300 truncate max-w-full">{folder}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Files */}
            {filteredFiles.length === 0 && folders.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-zinc-500">
                <Upload className="h-12 w-12 mb-3" />
                <p className="text-lg font-medium">Dra og slipp filer her</p>
                <p className="text-sm">eller bruk Last opp-knappen</p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filteredFiles.map(file => (
                  <div
                    key={file.id}
                    className={`group relative rounded-xl overflow-hidden border transition-all cursor-pointer ${
                      selectedFiles.has(file.name)
                        ? 'border-purple-500 ring-2 ring-purple-500/30'
                        : 'border-zinc-700 hover:border-zinc-500'
                    }`}
                    onClick={() => toggleSelect(file.name)}
                  >
                    {/* Thumbnail */}
                    <div className="aspect-square bg-zinc-900 flex items-center justify-center overflow-hidden">
                      {isImage(file.metadata?.mimetype) ? (
                        <img
                          src={file.publicUrl}
                          alt={file.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : isVideo(file.metadata?.mimetype) ? (
                        <div className="relative w-full h-full flex items-center justify-center bg-zinc-800">
                          <Film className="h-12 w-12 text-zinc-500" />
                          <Badge className="absolute top-2 left-2" variant="secondary">Video</Badge>
                        </div>
                      ) : (
                        <ImageIcon className="h-12 w-12 text-zinc-600" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-2 bg-zinc-800/80">
                      <p className="text-xs text-zinc-300 truncate" title={file.name}>{file.name}</p>
                      <p className="text-[10px] text-zinc-500">{formatBytes(file.metadata?.size || 0)}</p>
                    </div>

                    {/* Actions overlay */}
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={e => { e.stopPropagation(); copyUrl(file.publicUrl, file.name) }}
                        className="p-1.5 rounded-lg bg-black/70 hover:bg-black text-white"
                        title="Kopier URL"
                      >
                        {copied === file.name ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                      <a
                        href={file.publicUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="p-1.5 rounded-lg bg-black/70 hover:bg-black text-white"
                        title="Åpne"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </a>
                      <button
                        onClick={e => { e.stopPropagation(); handleDelete(file.name) }}
                        className="p-1.5 rounded-lg bg-black/70 hover:bg-red-900 text-white"
                        title="Slett"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Select indicator */}
                    {selectedFiles.has(file.name) && (
                      <div className="absolute top-2 left-2">
                        <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              /* List view */
              <div className="p-4 space-y-1">
                {filteredFiles.map(file => (
                  <div
                    key={file.id}
                    className={`flex items-center gap-4 p-3 rounded-lg transition-colors cursor-pointer ${
                      selectedFiles.has(file.name)
                        ? 'bg-purple-500/10 border border-purple-500/30'
                        : 'hover:bg-zinc-800 border border-transparent'
                    }`}
                    onClick={() => toggleSelect(file.name)}
                  >
                    {/* Thumbnail */}
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0 flex items-center justify-center">
                      {isImage(file.metadata?.mimetype) ? (
                        <img src={file.publicUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
                      ) : isVideo(file.metadata?.mimetype) ? (
                        <Film className="h-5 w-5 text-zinc-500" />
                      ) : (
                        <ImageIcon className="h-5 w-5 text-zinc-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-zinc-200 truncate">{file.name}</p>
                      <p className="text-xs text-zinc-500">
                        {formatBytes(file.metadata?.size || 0)} · {file.metadata?.mimetype} · {new Date(file.created_at).toLocaleDateString('nb-NO')}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={e => { e.stopPropagation(); copyUrl(file.publicUrl, file.name) }}
                        className="p-2 rounded-lg hover:bg-zinc-700 text-zinc-400 hover:text-white"
                      >
                        {copied === file.name ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); handleDelete(file.name) }}
                        className="p-2 rounded-lg hover:bg-red-900/50 text-zinc-400 hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
