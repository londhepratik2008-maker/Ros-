import { useModelStore } from '../../store/modelStore'
import { useChatStore } from '../../store/chatStore'
import { useEffect, useState } from 'react'

interface AgentStep {
  label: string
  status: 'active' | 'done' | 'pending'
}

export function AgentVisualization() {
  const { isStreaming } = useChatStore()
  const { metrics } = useModelStore()
  const [steps, setSteps] = useState<AgentStep[]>([])

  useEffect(() => {
    if (isStreaming) {
      setSteps([
        { label: 'Processing input', status: 'done' },
        { label: 'Generating tokens', status: 'active' },
        { label: 'Formatting response', status: 'pending' },
      ])
    } else if (steps.length > 0) {
      setSteps(prev => prev.map(s => ({ ...s, status: 'done' })))
      const timer = setTimeout(() => setSteps([]), 1500)
      return () => clearTimeout(timer)
    }
  }, [isStreaming])

  if (steps.length === 0) return null

  return (
    <div className="border-t border-hud-border bg-hud-surface/30 px-4 py-2">
      <div className="flex items-center gap-3 text-[10px] font-mono">
        {/* Mini AICore spinner */}
        <div className="relative w-5 h-5">
          <div className={`absolute inset-0 rounded-full border border-hud-accent/30 ${isStreaming ? 'animate-rotate-ring' : ''}`} />
          <div className={`absolute inset-1 rounded-full border border-hud-accent-alt/40 ${isStreaming ? 'animate-rotate-ring-reverse' : ''}`} />
          <div className={`absolute inset-1.5 rounded-full ${isStreaming ? 'bg-hud-accent/50 animate-pulse' : 'bg-hud-success/50'}`} />
        </div>

        {/* Steps */}
        <div className="flex items-center gap-2">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-hud-border">→</span>}
              <span className={
                step.status === 'active' ? 'text-hud-accent animate-pulse' :
                step.status === 'done' ? 'text-hud-success' :
                'text-hud-text-dim'
              }>
                {step.status === 'done' ? '✓' : step.status === 'active' ? '◉' : '○'} {step.label}
              </span>
            </div>
          ))}
        </div>

        {/* Token counter */}
        {isStreaming && (
          <div className="ml-auto text-hud-text-dim">
            {metrics.tokensPerSecond > 0 && (
              <span>{metrics.tokensPerSecond.toFixed(1)} tok/s</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
