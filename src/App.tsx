import { useEffect } from 'react'
import { MessageSquare, Activity, Settings } from 'lucide-react'
import { ChatPanel } from './components/chat/ChatPanel'
import { ChatInput } from './components/chat/ChatInput'
import { AgentVisualization } from './components/core/AgentVisualization'
import { MonitorPanel } from './components/monitor/MonitorPanel'
import { SettingsPanel } from './components/layout/SettingsPanel'
import { RoseNebula } from './components/core/RoseNebula'
import { useAudioAnalyzer } from './hooks/useAudioAnalyzer'
import { useModelStore } from './store/modelStore'
import { useUIStore } from './store/uiStore'
import { detectWebGPU } from './utils/webgpu'
import { isEngineReady } from './core/engine'

export const audioAnalyzer = {
  isActive: false,
  toggle: () => {},
}

function App() {
  const { setGPU, setModelStatus } = useModelStore()
  const { activePanel, theme } = useUIStore()
  const { isActive, audioData, toggle } = useAudioAnalyzer()

  useEffect(() => {
    audioAnalyzer.isActive = isActive
    audioAnalyzer.toggle = toggle
  }, [isActive, toggle])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    detectWebGPU().then(info => {
      setGPU({ available: info.available, name: info.name })
      if (!info.available) {
        setModelStatus({ state: 'error', error: 'WebGPU not available' })
      }
    })
  }, [setGPU, setModelStatus])

  // If UI says "ready" but engine lost state (HMR / reload), reset to idle so user can reload
  useEffect(() => {
    const t = setTimeout(() => {
      const st = useModelStore.getState().model
      if (st.state === 'ready' && !isEngineReady()) {
        useModelStore.getState().setModelStatus({ state: 'idle', progress: 0, progressText: undefined, error: undefined })
      }
    }, 600)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="fixed inset-0 z-10 flex h-screen w-screen overflow-hidden">
      {/* Background */}
      <RoseNebula audioData={isActive ? audioData : undefined} />

      {/* Panel navigation */}
      <nav className="fixed top-4 left-4 z-20 flex items-center gap-1.5 rounded-full glass-pill px-2 py-1.5">
        <PanelNavButton panel="chat" label="Chat" icon={<MessageSquare size={14} />} />
        <PanelNavButton panel="monitor" label="Monitor" icon={<Activity size={14} />} />
        <PanelNavButton panel="settings" label="Settings" icon={<Settings size={14} />} />
      </nav>

      {/* Left side — empty, background visible */}
      <div className="flex-1" />

      {/* Right side — glass chat panel */}
      {activePanel === 'monitor' ? (
        <div className="w-[420px] h-full p-4 pl-0">
          <div className="glass-panel h-full flex flex-col overflow-hidden">
            <MonitorPanel />
          </div>
        </div>
      ) : activePanel === 'settings' ? (
        <div className="w-[420px] h-full p-4 pl-0">
          <div className="glass-panel h-full flex flex-col overflow-hidden">
            <SettingsPanel />
          </div>
        </div>
      ) : (
        <div className="w-[420px] h-full p-4 pl-0">
          <div className="glass-panel h-full flex flex-col overflow-hidden">
            <div className="flex-1 overflow-hidden">
              <ChatPanel />
            </div>
            <AgentVisualization />
            <ChatInput />
          </div>
        </div>
      )}
    </div>
  )
}

export default App

function PanelNavButton({
  panel,
  label,
  icon,
}: {
  panel: 'chat' | 'monitor' | 'settings'
  label: string
  icon: React.ReactNode
}) {
  const active = useUIStore(s => s.activePanel) === panel
  const setActivePanel = useUIStore(s => s.setActivePanel)
  return (
    <button
      onClick={() => setActivePanel(panel)}
      title={label}
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono transition-colors cursor-pointer ${
        active
          ? 'bg-hud-accent/20 text-hud-accent'
          : 'text-hud-text-dim hover:text-hud-accent hover:bg-white/5'
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  )
}
