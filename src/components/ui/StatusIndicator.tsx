interface StatusIndicatorProps {
  status: 'online' | 'loading' | 'error' | 'offline'
  label?: string
  size?: 'sm' | 'md'
}

const statusColors = {
  online: 'bg-hud-success',
  loading: 'bg-hud-warning animate-pulse',
  error: 'bg-hud-danger',
  offline: 'bg-hud-text-dim',
}

const statusGlows = {
  online: 'shadow-[0_0_8px_rgba(0,255,136,0.6)]',
  loading: 'shadow-[0_0_8px_rgba(255,107,53,0.6)]',
  error: 'shadow-[0_0_8px_rgba(255,51,102,0.6)]',
  offline: '',
}

export function StatusIndicator({ status, label, size = 'md' }: StatusIndicatorProps) {
  const dotSize = size === 'sm' ? 'w-2 h-2' : 'w-3 h-3'

  return (
    <div className="flex items-center gap-2">
      <div className={`${dotSize} rounded-full ${statusColors[status]} ${statusGlows[status]}`} />
      {label && (
        <span className="text-xs font-mono text-hud-text-dim uppercase">
          {label}
        </span>
      )}
    </div>
  )
}
