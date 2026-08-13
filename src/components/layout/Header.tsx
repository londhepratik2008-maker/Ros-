import { useModelStore } from '../../store/modelStore'
import { useChatStore } from '../../store/chatStore'
import { StatusIndicator } from '../ui/StatusIndicator'
import { VoiceIndicator } from '../voice/VoiceControl'
import { AudioToggle } from '../voice/AudioToggle'
import { Cpu, Zap, Clock } from 'lucide-react'

export function Header() {
  const { model, gpu, metrics } = useModelStore()
  const { isStreaming } = useChatStore()

  return (
    <header className="h-10 bg-hud-surface/50 backdrop-blur-sm border-b border-hud-border flex items-center px-4 justify-between">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs font-mono text-hud-text-dim">
          <Cpu size={12} className="text-hud-accent" />
          <span>{gpu.name || 'GPU: Detecting...'}</span>
        </div>
        <StatusIndicator
          status={isStreaming ? 'loading' : model.state === 'ready' ? 'online' : 'offline'}
          label={isStreaming ? 'GENERATING' : model.state === 'ready' ? 'IDLE' : model.state.toUpperCase()}
          size="sm"
        />
        <VoiceIndicator />
        <AudioToggle />
      </div>

      <div className="flex items-center gap-4 text-xs font-mono text-hud-text-dim">
        <div className="flex items-center gap-1.5">
          <Zap size={12} className="text-hud-success" />
          <span>{metrics.tokensPerSecond.toFixed(1)} tok/s</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock size={12} className="text-hud-warning" />
          <span>{metrics.latency.toFixed(0)}ms</span>
        </div>
        <span className="text-hud-accent/60">|</span>
        <span className="font-orbitron text-hud-accent text-[10px] tracking-[0.2em]">v0.1.0</span>
      </div>
    </header>
  )
}
