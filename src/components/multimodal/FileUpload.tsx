import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { X, FileText } from 'lucide-react'

export interface AttachedFile {
  id: string
  name: string
  type: string
  preview?: string
  size: number
}

interface FileUploadProps {
  files: AttachedFile[]
  onFilesChange: (files: AttachedFile[]) => void
}

export function FileUpload({ files, onFilesChange }: FileUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: AttachedFile[] = acceptedFiles.map(file => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      name: file.name,
      type: file.type,
      size: file.size,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
    }))
    onFilesChange([...files, ...newFiles])
  }, [files, onFilesChange])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'text/*': ['.txt', '.md', '.json', '.csv', '.xml', '.html', '.css', '.js', '.ts', '.py'],
      'application/pdf': ['.pdf'],
    },
    maxFiles: 5,
    maxSize: 10 * 1024 * 1024,
  })

  const removeFile = (id: string) => {
    const file = files.find(f => f.id === id)
    if (file?.preview) URL.revokeObjectURL(file.preview)
    onFilesChange(files.filter(f => f.id !== id))
  }

  if (files.length === 0 && !isDragActive) {
    return null
  }

  return (
    <div className="space-y-2">
      {isDragActive && (
        <div
          {...getRootProps()}
          className="border-2 border-dashed border-hud-accent rounded-lg p-6 text-center bg-hud-accent/5 cursor-pointer"
        >
          <input {...getInputProps()} />
          <p className="text-sm text-hud-accent font-mono">Drop files here...</p>
        </div>
      )}

      {files.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {files.map(file => (
            <div
              key={file.id}
              className="flex items-center gap-2 px-2 py-1.5 rounded bg-hud-surface border border-hud-border text-xs"
            >
              {file.preview ? (
                <img src={file.preview} alt="" className="w-6 h-6 rounded object-cover" />
              ) : file.type.startsWith('application/pdf') ? (
                <FileText size={14} className="text-hud-danger" />
              ) : (
                <FileText size={14} className="text-hud-accent" />
              )}
              <span className="text-hud-text font-mono truncate max-w-[120px]">{file.name}</span>
              <button
                onClick={() => removeFile(file.id)}
                className="text-hud-text-dim hover:text-hud-danger transition-colors cursor-pointer"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {files.length === 0 && isDragActive && null}
    </div>
  )
}

export function FileDropZone({ children }: { children: React.ReactNode }) {
  const { getRootProps, getInputProps } = useDropzone({
    noClick: true,
    noKeyboard: true,
  })

  return (
    <div {...getRootProps()} className="relative">
      <input {...getInputProps()} />
      {children}
    </div>
  )
}
