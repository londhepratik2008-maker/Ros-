import type { ReactNode } from 'react'

interface HUDPanelProps {
  children: ReactNode
  title?: string
  className?: string
  glow?: boolean
}

export function HUDPanel({ children, title, className = '', glow = false }: HUDPanelProps) {
  return (
    <div className={`
      bg-hud-surface/80 backdrop-blur-sm
      ${glow ? 'glow-border-accent' : 'glow-border'}
      rounded-lg overflow-hidden
      ${className}
    `}>
      {title && (
        <div className="px-4 py-2 border-b border-hud-border flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-hud-accent animate-pulse-glow" />
          <span className="text-xs font-orbitron text-hud-accent uppercase tracking-widest">
            {title}
          </span>
        </div>
      )}
      <div className="p-4">
        {children}
      </div>
    </div>
  )
}
