import { useModelStore } from '../../store/modelStore'
import { useChatStore } from '../../store/chatStore'
import { HUDPanel } from '../ui/HUDPanel'
import { Activity, Zap, MessageSquare, Cpu } from 'lucide-react'

export function MonitorPanel() {
  const { model, gpu, metrics } = useModelStore()
  const { sessions } = useChatStore()
  const totalMessages = sessions.reduce((acc, s) => acc + s.messages.length, 0)

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <h2 className="font-orbitron text-sm text-hud-accent tracking-wider uppercase flex items-center gap-2">
        <Activity size={16} />
        System Monitor
      </h2>

      <div className="grid grid-cols-2 gap-4">
        {/* Token Speed */}
        <HUDPanel title="Token Speed">
          <div className="flex items-center gap-3">
            <div className="relative w-16 h-16">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="rgba(0,240,255,0.1)"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#00f0ff"
                  strokeWidth="3"
                  strokeDasharray={`${Math.min(metrics.tokensPerSecond * 5, 100)}, 100`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <Zap size={14} className="text-hud-accent" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-orbitron text-hud-accent">{metrics.tokensPerSecond.toFixed(1)}</div>
              <div className="text-[10px] font-mono text-hud-text-dim">tokens/sec</div>
            </div>
          </div>
        </HUDPanel>

        {/* Latency */}
        <HUDPanel title="Latency">
          <div className="flex items-center gap-3">
            <div className="relative w-16 h-16">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="rgba(255,107,53,0.1)"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#ff6b35"
                  strokeWidth="3"
                  strokeDasharray={`${Math.min(metrics.latency / 50, 100)}, 100`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <Activity size={14} className="text-hud-warning" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-orbitron text-hud-warning">{metrics.latency.toFixed(0)}</div>
              <div className="text-[10px] font-mono text-hud-text-dim">ms latency</div>
            </div>
          </div>
        </HUDPanel>

        {/* Messages */}
        <HUDPanel title="Session">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-hud-accent/10 flex items-center justify-center">
              <MessageSquare size={18} className="text-hud-accent" />
            </div>
            <div>
              <div className="text-2xl font-orbitron text-hud-text">{totalMessages}</div>
              <div className="text-[10px] font-mono text-hud-text-dim">total messages</div>
            </div>
          </div>
        </HUDPanel>

        {/* GPU Status */}
        <HUDPanel title="GPU">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-hud-accent-alt/10 flex items-center justify-center">
              <Cpu size={18} className="text-hud-accent-alt" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-mono text-hud-text truncate">{gpu.name || 'Not detected'}</div>
              <div className="text-[10px] font-mono text-hud-text-dim">
                {model.state === 'ready' ? 'Active' : model.state === 'loading' ? 'Loading...' : 'Idle'}
              </div>
            </div>
          </div>
        </HUDPanel>
      </div>

      {/* Model Info */}
      <HUDPanel title="Model">
        <div className="space-y-2 text-xs font-mono">
          <div className="flex justify-between">
            <span className="text-hud-text-dim">Model</span>
            <span className="text-hud-text">{model.modelName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-hud-text-dim">Status</span>
            <span className={model.state === 'ready' ? 'text-hud-success' : 'text-hud-text-dim'}>
              {model.state.toUpperCase()}
            </span>
          </div>
          {model.state === 'loading' && (
            <div className="flex justify-between">
              <span className="text-hud-text-dim">Progress</span>
              <span className="text-hud-accent">{model.progress.toFixed(0)}%</span>
            </div>
          )}
        </div>
      </HUDPanel>
    </div>
  )
}
