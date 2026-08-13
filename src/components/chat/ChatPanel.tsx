import { useRef, useEffect } from 'react'
import { useChatStore } from '../../store/chatStore'
import { useModelStore } from '../../store/modelStore'
import { useLLM } from '../../hooks/useLLM'
import { MarkdownRenderer } from './MarkdownRenderer'
import { MessageSquare, Image, FileText } from 'lucide-react'

export function ChatPanel() {
  const { sessions, activeSessionId, isStreaming } = useChatStore()
  const { model } = useModelStore()
  const activeSession = sessions.find(s => s.id === activeSessionId)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom on new messages or streaming updates
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [activeSession?.messages, isStreaming])

  if (!activeSession || activeSession.messages.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-6 p-8">
        <div className="text-center">
          <h2 className="font-orbitron text-xl text-hud-accent glow-text mb-2">
            ROSEE
          </h2>
          <p className="text-sm text-hud-text-dim font-mono max-w-md">
            AI Assistant powered by Qwen 2.5 7B running entirely in your browser.
            No servers. No API keys. Pure local inference.
          </p>
          {model.state !== 'ready' && (
            <p className="text-xs text-hud-warning mt-2 font-mono">
              Load the model from the sidebar to start chatting.
            </p>
          )}
        </div>
        {model.state === 'ready' && (
          <div className="grid grid-cols-2 gap-3 mt-4">
            <QuickPrompt text="Explain quantum computing" />
            <QuickPrompt text="Write a Python function" />
            <QuickPrompt text="What is WebGPU?" />
            <QuickPrompt text="Tell me a joke" />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeSession.messages.map(msg => (
          <div
            key={msg.id}
            className={`animate-fade-in-up flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`
                max-w-[85%] rounded-lg px-4 py-3 text-sm
                ${msg.role === 'user'
                  ? 'bg-hud-accent/10 border border-hud-accent/30 text-hud-text'
                  : 'bg-hud-surface border border-hud-border text-hud-text'
                }
              `}
            >
              <div className="text-[10px] font-orbitron text-hud-text-dim mb-1 uppercase tracking-wider">
                {msg.role === 'user' ? 'You' : 'Rosee'}
              </div>

              {/* Attachments */}
              {msg.attachments && msg.attachments.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {msg.attachments.map((att, i) => (
                    <div key={i} className="rounded overflow-hidden border border-hud-border">
                      {att.preview ? (
                        <img src={att.preview} alt={att.name} className="max-w-[200px] max-h-[150px] object-cover" />
                      ) : (
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-hud-bg/50 text-[10px] font-mono text-hud-text-dim">
                          {att.type.includes('pdf') ? <FileText size={12} /> : <FileText size={12} />}
                          {att.name}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Message content */}
              {msg.role === 'assistant' ? (
                <div className="font-mono">
                  <MarkdownRenderer content={msg.content} />
                  {msg.isStreaming && (
                    <span className="inline-block w-2 h-4 ml-0.5 bg-hud-accent animate-typewriter-cursor align-text-bottom" />
                  )}
                </div>
              ) : (
                <div className="font-mono whitespace-pre-wrap">{msg.content}</div>
              )}

              {msg.tokens && (
                <div className="text-[10px] text-hud-text-dim mt-2 font-mono">
                  {msg.tokens} tokens
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Streaming indicator at bottom */}
        {isStreaming && (
          <div className="flex items-center gap-2 text-xs text-hud-accent animate-pulse">
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-hud-accent animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-hud-accent animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-hud-accent animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="font-mono">Rosee is thinking...</span>
          </div>
        )}
      </div>
    </div>
  )
}

function QuickPrompt({ text }: { text: string }) {
  const { createSession, activeSessionId } = useChatStore()
  const { model } = useModelStore()
  const { send } = useLLM()

  const handleClick = () => {
    let sessionId = activeSessionId
    if (!sessionId) {
      sessionId = createSession()
    }
    send(text, model.modelName)
  }

  return (
    <button
      onClick={handleClick}
      className="text-left p-3 rounded border border-hud-border bg-hud-surface/50 hover:border-hud-accent/50 hover:bg-hud-accent/5 transition-all text-xs text-hud-text-dim hover:text-hud-text cursor-pointer"
    >
      <MessageSquare size={12} className="inline mr-2 text-hud-accent" />
      {text}
    </button>
  )
}
