import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useChatStore } from '../../store/chatStore'
import { useModelStore } from '../../store/modelStore'
import { useUIStore } from '../../store/uiStore'
import { useLLM } from '../../hooks/useLLM'
import { useVoice } from '../../hooks/useVoice'
import { FileUpload, type AttachedFile } from '../multimodal/FileUpload'
import { Mic, MicOff, Paperclip, Send, Square, Plus, List, Trash2, ArrowRight } from 'lucide-react'

interface Command {
  name: string
  description: string
  icon: React.ReactNode
  action: (args?: string | undefined) => void
}

export function ChatInput() {
  const [input, setInput] = useState('')
  const [files, setFiles] = useState<AttachedFile[]>([])
  const [showCommands, setShowCommands] = useState(false)
  const [commandFeedback, setCommandFeedback] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { sessions, activeSessionId, createSession, setActiveSession, deleteSession, addMessage, isStreaming } = useChatStore()
  const { model } = useModelStore()
  const { send, stop } = useLLM()
  const triggerShatter = useUIStore(s => s.triggerShatter)
  const triggerAssemble = useUIStore(s => s.triggerAssemble)

  const { isListening, isSupported, toggleListening } = useVoice({
    onResult: (transcript) => {
      if (model.state === 'ready' && !isStreaming) {
        send(transcript, model.modelName)
      } else {
        // Store voice message directly
        let sessionId = activeSessionId
        if (!sessionId) {
          sessionId = createSession()
        }
        addMessage(sessionId, {
          id: `${Date.now()}-user`,
          role: 'user',
          content: transcript,
          timestamp: Date.now(),
        })
      }
    },
  })

  const showFeedback = useCallback((msg: string) => {
    setCommandFeedback(msg)
    setTimeout(() => setCommandFeedback(null), 3000)
  }, [])

  const commands: Command[] = useMemo(() => [
    {
      name: '/new',
      description: 'Start a new chat session',
      icon: <Plus size={14} />,
      action: () => {
        createSession()
        showFeedback('New session created')
      },
    },
    {
      name: '/sessions',
      description: 'List all chat sessions',
      icon: <List size={14} />,
      action: () => {
        if (sessions.length === 0) {
          showFeedback('No sessions yet')
          return
        }
        const list = sessions
          .map(s => `${s.id === activeSessionId ? '→' : ' '} ${s.title} (${s.messages.length} msgs)`)
          .join('\n')
        showFeedback(list)
      },
    },
    {
      name: '/switch',
      description: 'Switch to a session by ID or index',
      icon: <ArrowRight size={14} />,
      action: (args: string | undefined) => {
        if (!args) {
          showFeedback('Usage: /switch <session-id or index>')
          return
        }
        const index = parseInt(args, 10)
        if (!isNaN(index) && index >= 0 && index < sessions.length) {
          setActiveSession(sessions[index].id)
          showFeedback(`Switched to: ${sessions[index].title}`)
          return
        }
        const found = sessions.find(s => s.id === args || s.title.toLowerCase().includes(args.toLowerCase()))
        if (found) {
          setActiveSession(found.id)
          showFeedback(`Switched to: ${found.title}`)
        } else {
          showFeedback(`Session not found: ${args}`)
        }
      },
    },
    {
      name: '/delete',
      description: 'Delete a session by ID or index',
      icon: <Trash2 size={14} />,
      action: (args: string | undefined) => {
        if (!args) {
          showFeedback('Usage: /delete <session-id or index>')
          return
        }
        const index = parseInt(args, 10)
        if (!isNaN(index) && index >= 0 && index < sessions.length) {
          const title = sessions[index].title
          deleteSession(sessions[index].id)
          showFeedback(`Deleted: ${title}`)
          return
        }
        const found = sessions.find(s => s.id === args || s.title.toLowerCase().includes(args.toLowerCase()))
        if (found) {
          deleteSession(found.id)
          showFeedback(`Deleted: ${found.title}`)
        } else {
          showFeedback(`Session not found: ${args}`)
        }
      },
    },
    {
      name: '/commands',
      description: 'Show this help message',
      icon: <List size={14} />,
      action: () => {
        const help = [
          '/new — Start a new chat session',
          '/sessions — List all chat sessions',
          '/switch <id> — Switch to a session',
          '/delete <id> — Delete a session',
          '/commands — Show this help',
        ].join('\n')
        showFeedback(help)
      },
    },
  ], [sessions, activeSessionId, createSession, setActiveSession, deleteSession, showFeedback])

  const handleCommand = useCallback((text: string) => {
    const trimmed = text.trim()
    if (!trimmed.startsWith('/')) return false

    const parts = trimmed.split(/\s+/)
    const cmdName = parts[0].toLowerCase()
    const args = parts.slice(1).join(' ')

    const cmd = commands.find(c => c.name === cmdName)
    if (cmd) {
      cmd.action(args)
      setInput('')
      return true
    }
    return false
  }, [commands])

  const handleSubmit = useCallback(() => {
    if (!input.trim() && files.length === 0) return
    if (isStreaming) return

    // Handle commands
    if (input.trim().startsWith('/')) {
      handleCommand(input)
      return
    }

    // Detect "log off" — trigger shatter
    if (input.trim().toLowerCase() === 'log off') {
      let sessionId = activeSessionId
      if (!sessionId) {
        sessionId = createSession()
      }
      addMessage(sessionId, {
        id: `${Date.now()}-user`,
        role: 'user',
        content: input.trim(),
        timestamp: Date.now(),
      })
      setInput('')
      triggerShatter()
      return
    }

    // Detect "log in" — trigger assemble
    if (input.trim().toLowerCase() === 'log in') {
      let sessionId = activeSessionId
      if (!sessionId) {
        sessionId = createSession()
      }
      addMessage(sessionId, {
        id: `${Date.now()}-user`,
        role: 'user',
        content: input.trim(),
        timestamp: Date.now(),
      })
      setInput('')
      triggerAssemble()
      return
    }

    let sessionId = activeSessionId
    if (!sessionId) {
      sessionId = createSession()
    }

    const messageContent = input.trim() || `[${files.length} file(s) attached]`

    // If model is ready, send via LLM. Otherwise, just store the message.
    if (model.state === 'ready') {
      send(messageContent, model.modelName)
    } else {
      addMessage(sessionId, {
        id: `${Date.now()}-user`,
        role: 'user',
        content: messageContent,
        timestamp: Date.now(),
      })
    }

    files.forEach(f => { if (f.preview) URL.revokeObjectURL(f.preview) })
    setFiles([])
    setInput('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }, [input, files, isStreaming, activeSessionId, createSession, send, model, handleCommand, addMessage, triggerShatter, triggerAssemble])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (isStreaming) {
        stop()
      } else {
        handleSubmit()
      }
    }
    if (e.key === 'Escape') {
      setShowCommands(false)
    }
  }

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }, [input])

  useEffect(() => {
    setShowCommands(input.startsWith('/') && input.length > 0 && input.length < 20)
  }, [input])

  const filteredCommands = commands.filter(c =>
    c.name.toLowerCase().startsWith(input.toLowerCase())
  )

  const modelReady = model.state === 'ready'

  return (
    <div className="border-t border-hud-border bg-hud-surface/50 p-3">
      <FileUpload files={files} onFilesChange={setFiles} />

      {/* Command palette */}
      {showCommands && filteredCommands.length > 0 && (
        <div className="mb-2 rounded-lg border border-hud-border bg-hud-bg/95 backdrop-blur-sm overflow-hidden">
          {filteredCommands.map(cmd => (
            <button
              key={cmd.name}
              onClick={() => {
                setInput(cmd.name + ' ')
                setShowCommands(false)
                textareaRef.current?.focus()
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-hud-accent/10 transition-colors cursor-pointer"
            >
              <span className="text-hud-accent">{cmd.icon}</span>
              <div>
                <span className="text-xs font-mono text-hud-text">{cmd.name}</span>
                <span className="text-[10px] text-hud-text-dim ml-2">{cmd.description}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Command feedback */}
      {commandFeedback && (
        <div className="mb-2 rounded-lg border border-hud-accent/30 bg-hud-accent/5 p-3">
          <pre className="text-xs font-mono text-hud-text whitespace-pre-wrap">{commandFeedback}</pre>
        </div>
      )}

      <div className="glass-pill flex items-center gap-1.5 p-1.5 pl-3 mt-2 mx-3 mb-3">
        <label className="w-6 h-6 flex items-center justify-center rounded-full text-hud-text-dim hover:text-hud-accent hover:bg-white/5 transition-colors cursor-pointer shrink-0">
          <Paperclip size={13} />
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
          placeholder="Type a message or / for commands..."
          rows={1}
          className="flex-1 bg-transparent text-hud-text text-xs font-mono resize-none outline-none placeholder:text-hud-text-dim/40 min-h-[24px] max-h-[80px] py-0.5"
        />

        <button
          onClick={toggleListening}
          disabled={!isSupported}
          className={`w-6 h-6 flex items-center justify-center rounded-full transition-colors cursor-pointer shrink-0 ${
            isListening
              ? 'text-hud-danger bg-hud-danger/20 animate-pulse'
              : 'text-hud-text-dim hover:text-hud-accent hover:bg-white/5'
          } disabled:opacity-30 disabled:cursor-not-allowed`}
        >
          {isListening ? <MicOff size={12} /> : <Mic size={12} />}
        </button>

        {isStreaming ? (
          <button
            onClick={stop}
            className="w-6 h-6 flex items-center justify-center rounded-full bg-hud-danger/20 text-hud-danger hover:bg-hud-danger/30 transition-colors cursor-pointer shrink-0"
          >
            <Square size={12} />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={(!input.trim() && files.length === 0)}
            className="w-6 h-6 flex items-center justify-center rounded-full bg-hud-accent/20 text-hud-accent hover:bg-hud-accent/30 transition-colors cursor-pointer shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Send size={12} />
          </button>
        )}
      </div>

      <div className="flex items-center justify-between mt-2 px-1">
        <span className="text-[10px] font-mono text-hud-text-dim/50">
          {modelReady ? 'Model ready' : 'Load model for AI responses'}
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
