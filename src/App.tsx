import { useEffect } from 'react'
import { MainLayout } from './components/layout/MainLayout'
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

  // Expose audio toggle globally
  useEffect(() => {
    audioAnalyzer.isActive = isActive
    audioAnalyzer.toggle = toggle
  }, [isActive, toggle])

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // Detect WebGPU on mount
  useEffect(() => {
    detectWebGPU().then(info => {
      setGPU({ available: info.available, name: info.name })
      if (!info.available) {
        setModelStatus({ state: 'error', error: 'WebGPU not available' })
      }
    })
  }, [setGPU, setModelStatus])

  return (
    <>
      <RoseNebula audioData={isActive ? audioData : undefined} />
      <MainLayout>
        {activePanel === 'monitor' ? (
          <MonitorPanel />
        ) : activePanel === 'settings' ? (
          <SettingsPanel />
        ) : (
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-hidden">
              <ChatPanel />
            </div>
            <AgentVisualization />
            <ChatInput />
          </div>
        )}
      </MainLayout>
    </>
  )
}

export default App
