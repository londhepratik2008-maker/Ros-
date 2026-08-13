import { useState, useRef, useEffect, useCallback } from 'react'
import { useChatStore } from '../../store/chatStore'
import { useModelStore } from '../../store/modelStore'
import { useLLM } from '../../hooks/useLLM'
import { FileUpload, type AttachedFile } from '../multimodal/FileUpload'
import { Mic, MicOff, Paperclip, Send, Square } from 'lucide-react'

export function ChatInput() {
  const [input, setInput] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [files, setFiles] = useState<AttachedFile[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { createSession, activeSessionId, isStreaming } = useChatStore()
  const { model } = useModelStore()
  const { send, stop } = useLLM()

  const handleSubmit = useCallback(() => {
    if (!input.trim() && files.length === 0) return
    if (isStreaming) return

    let sessionId = activeSessionId
    if (!sessionId) {
      sessionId = createSession()
    }

    // Send message with attachments info in content if any
    const messageContent = input.trim() || `[${files.length} file(s) attached]`
    send(messageContent, model.modelName)

    // Clean up
    files.forEach(f => { if (f.preview) URL.revokeObjectURL(f.preview) })
    setFiles([])
    setInput('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }, [input, files, isStreaming, activeSessionId, createSession, send, model.modelName])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (isStreaming) {
        stop()
      } else {
        handleSubmit()
      }
    }
  }

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }, [input])

  const modelReady = model.state === 'ready'

  return (
    <div className="border-t border-hud-border bg-hud-surface/50 p-3">
      {/* File attachments */}
      <FileUpload files={files} onFilesChange={setFiles} />

      <div className="glow-border rounded-lg bg-hud-bg/50 flex items-end gap-2 p-2 mt-2">
        <label className="w-8 h-8 flex items-center justify-center rounded text-hud-text-dim hover:text-hud-accent hover:bg-hud-accent/10 transition-colors cursor-pointer shrink-0 mb-0.5">
          <Paperclip size={16} />
          <input
            type="file"
            className="hidden"
            multiple
            accept="image/*,.txt,.md,.json,.csv,.xml,.html,.css,.js,.ts,.py,.pdf"
            onChange={(e) => {
              const newFiles = Array.from(e.target.files || []).map(file => ({
                id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
                name: file.name,
                type: file.type,
                size: file.size,
                preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
              }))
              setFiles(prev => [...prev, ...newFiles])
              e.target.value = ''
            }}
          />
        </label>

        <textarea
          ref={textareaRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={modelReady ? 'Type a message...' : 'Load model first...'}
          rows={1}
          disabled={!modelReady}
          className="flex-1 bg-transparent text-hud-text text-sm font-mono resize-none outline-none placeholder:text-hud-text-dim/50 min-h-[32px] max-h-[120px] py-1 disabled:opacity-40"
        />

        <button
          onClick={() => setIsListening(!isListening)}
          className={`w-8 h-8 flex items-center justify-center rounded transition-colors cursor-pointer shrink-0 mb-0.5 ${
            isListening
              ? 'text-hud-danger bg-hud-danger/20 animate-pulse'
              : 'text-hud-text-dim hover:text-hud-accent hover:bg-hud-accent/10'
          }`}
        >
          {isListening ? <MicOff size={16} /> : <Mic size={16} />}
        </button>

        {isStreaming ? (
          <button
            onClick={stop}
            className="w-8 h-8 flex items-center justify-center rounded bg-hud-danger/20 text-hud-danger hover:bg-hud-danger/30 transition-colors cursor-pointer shrink-0 mb-0.5"
          >
            <Square size={16} />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={(!input.trim() && files.length === 0) || !modelReady}
            className="w-8 h-8 flex items-center justify-center rounded bg-hud-accent/20 text-hud-accent hover:bg-hud-accent/30 transition-colors cursor-pointer shrink-0 mb-0.5 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Send size={16} />
          </button>
        )}
      </div>

      <div className="flex items-center justify-between mt-2 px-1">
        <span className="text-[10px] font-mono text-hud-text-dim/50">
          {!modelReady ? 'Load model to chat' : 'Shift+Enter for new line'}
        </span>
        <span className="text-[10px] font-mono text-hud-text-dim/50">
          {isStreaming ? (
            <span className="text-hud-accent animate-pulse">Generating...</span>
          ) : modelReady ? (
            'Ready'
          ) : (
            'Offline'
          )}
        </span>
      </div>
    </div>
  )
}
