import { useRef, useEffect } from 'react'
import { useChatStore } from '../../store/chatStore'
import { useModelStore } from '../../store/modelStore'
import { useLLM } from '../../hooks/useLLM'
import { MarkdownRenderer } from './MarkdownRenderer'
import { MessageSquare, FileText } from 'lucide-react'

export function ChatPanel() {
  const { sessions, activeSessionId, isStreaming } = useChatStore()
  const { model } = useModelStore()
  const activeSession = sessions.find(s => s.id === activeSessionId)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [activeSession?.messages, isStreaming])

  if (!activeSession || activeSession.messages.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 px-6">
        <div className="text-center">
          <h2 className="font-orbitron text-lg text-hud-accent glow-text mb-1">
            ROSEE
          </h2>
          <p className="text-xs text-hud-text-dim font-mono">
            Ask me anything. Type <span className="text-hud-accent">/</span> for commands.
          </p>
          {model.state !== 'ready' && (
            <p className="text-[10px] text-hud-warning mt-2 font-mono">
              Load the model first to start chatting.
            </p>
          )}
        </div>
        {model.state === 'ready' && (
          <div className="grid grid-cols-1 gap-2 mt-2 w-full">
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
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {activeSession.messages.map(msg => (
          <div
            key={msg.id}
            className={`animate-fade-in-up flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`
                max-w-[90%] rounded-2xl px-3 py-2 text-xs
                ${msg.role === 'user'
                  ? 'bg-hud-accent/15 border border-hud-accent/20 text-hud-text'
                  : 'bg-white/5 border border-white/5 text-hud-text'
                }
              `}
            >
              <div className="text-[9px] font-orbitron text-hud-text-dim mb-0.5 uppercase tracking-wider">
                {msg.role === 'user' ? 'You' : 'Rosee'}
              </div>

              {msg.attachments && msg.attachments.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-1.5">
                  {msg.attachments.map((att, i) => (
                    <div key={i} className="rounded overflow-hidden border border-hud-border">
                      {att.preview ? (
                        <img src={att.preview} alt={att.name} className="max-w-[160px] max-h-[120px] object-cover" />
                      ) : (
                        <div className="flex items-center gap-1 px-1.5 py-0.5 bg-hud-bg/50 text-[9px] font-mono text-hud-text-dim">
                          <FileText size={10} />
                          {att.name}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {msg.role === 'assistant' ? (
                <div className="font-mono">
                  <MarkdownRenderer content={msg.content} />
                  {msg.isStreaming && (
                    <span className="inline-block w-1.5 h-3 ml-0.5 bg-hud-accent animate-typewriter-cursor align-text-bottom" />
                  )}
                </div>
              ) : (
                <div className="font-mono whitespace-pre-wrap">{msg.content}</div>
              )}

              {msg.tokens && (
                <div className="text-[9px] text-hud-text-dim mt-1 font-mono">
                  {msg.tokens} tokens
                </div>
              )}
            </div>
          </div>
        ))}

        {isStreaming && (
          <div className="flex items-center gap-2 text-[10px] text-hud-accent animate-pulse">
            <div className="flex gap-0.5">
              <div className="w-1 h-1 rounded-full bg-hud-accent animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1 h-1 rounded-full bg-hud-accent animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1 h-1 rounded-full bg-hud-accent animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="font-mono">Rosee is thinking...</span>
          </div>
        )}
      </div>
    </div>
  )
}

function QuickPrompt({ text }: { text: string }) {
  const { createSession, activeSessionId, addMessage } = useChatStore()
  const { model } = useModelStore()
  const { send } = useLLM()

  const handleClick = () => {
    let sessionId = activeSessionId
    if (!sessionId) {
      sessionId = createSession()
    }
    if (model.state === 'ready') {
      send(text, model.modelName)
    } else {
      // Offline — just store the message like ChatInput does
      addMessage(sessionId, {
        id: `${Date.now()}-user`,
        role: 'user',
        content: text,
        timestamp: Date.now(),
      })
    }
  }

  return (
    <button
      onClick={handleClick}
      className="text-left p-2.5 rounded-xl border border-white/5 bg-white/3 hover:border-hud-accent/30 hover:bg-hud-accent/5 transition-all text-[11px] text-hud-text-dim hover:text-hud-text cursor-pointer"
    >
      <MessageSquare size={10} className="inline mr-1.5 text-hud-accent" />
      {text}
    </button>
  )
}
