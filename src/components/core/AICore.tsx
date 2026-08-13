import { useModelStore } from '../../store/modelStore'
import { useChatStore } from '../../store/chatStore'

interface AICoreProps {
  size?: number
}

export function AICore({ size = 200 }: AICoreProps) {
  const { model } = useModelStore()
  const { isStreaming } = useChatStore()
  const isReady = model.state === 'ready'
  const isThinking = isStreaming
  const isActive = isReady || model.state === 'loading'

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {/* Outer ring - slow rotation */}
      <div
        className={`absolute inset-0 rounded-full border border-hud-accent/20 ${isActive ? 'animate-rotate-ring' : ''}`}
        style={{
          background: `conic-gradient(from 0deg, transparent, ${isThinking ? 'rgba(0,240,255,0.4)' : isActive ? 'rgba(0,240,255,0.1)' : 'transparent'}, transparent)`,
        }}
      />

      {/* Middle ring - reverse rotation */}
      <div
        className={`absolute inset-3 rounded-full border border-hud-accent-alt/30 ${isActive ? 'animate-rotate-ring-reverse' : ''}`}
        style={{
          background: `conic-gradient(from 180deg, transparent, ${isThinking ? 'rgba(123,47,247,0.25)' : 'rgba(123,47,247,0.1)'}, transparent)`,
        }}
      />

      {/* Inner ring - pulse */}
      <div
        className={`absolute inset-6 rounded-full border ${isThinking ? 'border-hud-accent/60' : 'border-hud-accent/40'} ${isActive ? 'animate-pulse-glow' : ''}`}
        style={{
          boxShadow: isThinking
            ? '0 0 40px rgba(0,240,255,0.5), inset 0 0 40px rgba(0,240,255,0.15)'
            : isActive
              ? '0 0 30px rgba(0,240,255,0.3), inset 0 0 30px rgba(0,240,255,0.1)'
              : '0 0 10px rgba(0,240,255,0.1)',
        }}
      />

      {/* Core center */}
      <div
        className={`absolute inset-10 rounded-full bg-gradient-to-br from-hud-accent/30 to-hud-accent-alt/30 flex items-center justify-center ${isActive ? 'animate-pulse-glow' : ''}`}
      >
        <div
          className={`w-6 h-6 rounded-full ${isThinking ? 'bg-hud-accent-alt shadow-[0_0_30px_rgba(123,47,247,0.9)]' : 'bg-hud-accent shadow-[0_0_20px_rgba(0,240,255,0.8)]'}`}
          style={{
            transition: 'all 0.3s ease',
          }}
        />
      </div>

      {/* Thinking pulse rings */}
      {isThinking && (
        <>
          <div className="absolute inset-0 rounded-full border border-hud-accent/20 animate-ping" style={{ animationDuration: '2s' }} />
          <div className="absolute inset-4 rounded-full border border-hud-accent-alt/15 animate-ping" style={{ animationDuration: '2.5s' }} />
        </>
      )}

      {/* Scan arc decorations */}
      {isActive && (
        <>
          <div className="absolute top-0 left-1/2 w-px h-4 bg-gradient-to-b from-hud-accent/60 to-transparent" />
          <div className="absolute bottom-0 left-1/2 w-px h-4 bg-gradient-to-t from-hud-accent/60 to-transparent" />
          <div className="absolute left-0 top-1/2 h-px w-4 bg-gradient-to-r from-hud-accent/60 to-transparent" />
          <div className="absolute right-0 top-1/2 h-px w-4 bg-gradient-to-l from-hud-accent/60 to-transparent" />
        </>
      )}

      {/* Corner brackets */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
        <path d="M10,20 L10,10 L20,10" fill="none" stroke={isThinking ? 'rgba(123,47,247,0.5)' : 'rgba(0,240,255,0.3)'} strokeWidth="0.5" />
        <path d="M80,10 L90,10 L90,20" fill="none" stroke={isThinking ? 'rgba(123,47,247,0.5)' : 'rgba(0,240,255,0.3)'} strokeWidth="0.5" />
        <path d="M90,80 L90,90 L80,90" fill="none" stroke={isThinking ? 'rgba(123,47,247,0.5)' : 'rgba(0,240,255,0.3)'} strokeWidth="0.5" />
        <path d="M20,90 L10,90 L10,80" fill="none" stroke={isThinking ? 'rgba(123,47,247,0.5)' : 'rgba(0,240,255,0.3)'} strokeWidth="0.5" />
      </svg>
    </div>
  )
}
