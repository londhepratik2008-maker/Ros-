import { useEffect } from 'react'
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

  return (
    <div className="fixed inset-0 z-10 flex h-screen w-screen overflow-hidden">
      {/* Background */}
      <RoseNebula audioData={isActive ? audioData : undefined} />

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
