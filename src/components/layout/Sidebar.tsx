import { useChatStore } from '../../store/chatStore'
import { useUIStore } from '../../store/uiStore'
import { StatusIndicator } from '../ui/StatusIndicator'
import { useModelStore } from '../../store/modelStore'
import { useLLM } from '../../hooks/useLLM'
import { MessageSquare, Activity, Settings, Plus, ChevronLeft, ChevronRight, Download, Trash2 } from 'lucide-react'

export function Sidebar() {
  const { sessions, activeSessionId, createSession, setActiveSession, deleteSession } = useChatStore()
  const { sidebarOpen, toggleSidebar, activePanel, setActivePanel } = useUIStore()
  const { model } = useModelStore()
  const { load } = useLLM()

  if (!sidebarOpen) {
    return (
      <div className="w-12 bg-hud-surface/50 border-r border-hud-border flex flex-col items-center py-4 gap-4">
        <button
          onClick={toggleSidebar}
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-hud-accent/20 text-hud-text-dim hover:text-hud-accent transition-colors cursor-pointer"
        >
          <ChevronRight size={16} />
        </button>
        <button
          onClick={() => createSession()}
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-hud-accent/20 text-hud-text-dim hover:text-hud-accent transition-colors cursor-pointer"
        >
          <Plus size={16} />
        </button>
        <div className="flex flex-col gap-2 mt-auto">
          <NavIcon active={activePanel === 'chat'} onClick={() => setActivePanel('chat')}>
            <MessageSquare size={16} />
          </NavIcon>
          <NavIcon active={activePanel === 'monitor'} onClick={() => setActivePanel('monitor')}>
            <Activity size={16} />
          </NavIcon>
          <NavIcon active={activePanel === 'settings'} onClick={() => setActivePanel('settings')}>
            <Settings size={16} />
          </NavIcon>
        </div>
      </div>
    )
  }

  return (
    <div className="w-64 bg-hud-surface/50 border-r border-hud-border flex flex-col">
      <div className="p-3 border-b border-hud-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-hud-accent to-hud-accent-alt flex items-center justify-center">
            <span className="text-xs font-orbitron font-bold text-hud-bg">R</span>
          </div>
          <span className="font-orbitron text-sm text-hud-accent tracking-wider">ROSEE</span>
        </div>
        <button
          onClick={toggleSidebar}
          className="w-6 h-6 flex items-center justify-center rounded hover:bg-hud-accent/20 text-hud-text-dim hover:text-hud-accent transition-colors cursor-pointer"
        >
          <ChevronLeft size={14} />
        </button>
      </div>

      <div className="p-3 border-b border-hud-border">
        <button
          onClick={() => createSession()}
          className="w-full py-2 px-3 rounded border border-dashed border-hud-border hover:border-hud-accent text-hud-text-dim hover:text-hud-accent text-xs font-orbitron uppercase tracking-wider transition-all cursor-pointer"
        >
          + New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
        {sessions.map(session => (
          <div
            key={session.id}
            className={`
              group flex items-center gap-1 rounded transition-all
              ${session.id === activeSessionId
                ? 'bg-hud-accent/10 border border-hud-accent/30'
                : 'border border-transparent hover:bg-hud-surface-light'
              }
            `}
          >
            <button
              onClick={() => setActiveSession(session.id)}
              className="flex-1 text-left px-3 py-2 text-sm truncate cursor-pointer"
            >
              <span className={session.id === activeSessionId ? 'text-hud-accent' : 'text-hud-text-dim group-hover:text-hud-text'}>
                {session.title}
              </span>
              <span className="text-[10px] text-hud-text-dim ml-2">
                {session.messages.length}
              </span>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); deleteSession(session.id) }}
              className="w-6 h-6 flex items-center justify-center rounded text-hud-text-dim hover:text-hud-danger hover:bg-hud-danger/10 opacity-0 group-hover:opacity-100 transition-all cursor-pointer mr-1"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>

      {/* Model Status Section */}
      <div className="p-3 border-t border-hud-border space-y-3">
        <div className="flex items-center justify-between">
          <StatusIndicator
            status={model.state === 'ready' ? 'online' : model.state === 'loading' ? 'loading' : model.state === 'error' ? 'error' : 'offline'}
            label={model.state === 'ready' ? 'READY' : model.state === 'loading' ? 'LOADING' : 'OFFLINE'}
          />
        </div>

        {/* Model name */}
        <div className="text-[10px] font-mono text-hud-text-dim truncate">
          {model.modelName}
        </div>

        {/* Progress bar when loading */}
        {model.state === 'loading' && (
          <div className="space-y-1">
            <div className="h-1.5 bg-hud-bg rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-hud-accent to-hud-accent-alt transition-all duration-300"
                style={{ width: `${model.progress}%` }}
              />
            </div>
            <div className="text-[10px] font-mono text-hud-accent text-right">
              {model.progress.toFixed(0)}%
            </div>
          </div>
        )}

        {/* Load button */}
        {model.state === 'idle' && (
          <button
            onClick={() => load(model.modelName)}
            className="w-full py-2 px-3 rounded bg-hud-accent/10 border border-hud-accent/30 text-hud-accent text-xs font-orbitron uppercase tracking-wider hover:bg-hud-accent/20 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Download size={12} />
            Load Model
          </button>
        )}

        {/* Error state */}
        {model.state === 'error' && (
          <div className="space-y-2">
            <div className="text-[10px] font-mono text-hud-danger truncate">
              {model.error}
            </div>
            <button
              onClick={() => load(model.modelName)}
              className="w-full py-2 px-3 rounded bg-hud-danger/10 border border-hud-danger/30 text-hud-danger text-xs font-orbitron uppercase tracking-wider hover:bg-hud-danger/20 transition-all cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        <div className="flex gap-2">
          <NavIcon active={activePanel === 'chat'} onClick={() => setActivePanel('chat')}>
            <MessageSquare size={14} />
          </NavIcon>
          <NavIcon active={activePanel === 'monitor'} onClick={() => setActivePanel('monitor')}>
            <Activity size={14} />
          </NavIcon>
          <NavIcon active={activePanel === 'settings'} onClick={() => setActivePanel('settings')}>
            <Settings size={14} />
          </NavIcon>
        </div>
      </div>
    </div>
  )
}

function NavIcon({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`
        w-8 h-8 flex items-center justify-center rounded transition-all cursor-pointer
        ${active ? 'bg-hud-accent/20 text-hud-accent' : 'text-hud-text-dim hover:bg-hud-surface-light hover:text-hud-text'}
      `}
    >
      {children}
    </button>
  )
}
