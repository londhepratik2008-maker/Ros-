import { useUIStore } from '../../store/uiStore'
import { Monitor, Flame, Zap } from 'lucide-react'
import type { ThemeName } from '../../core/types'

const themes: { name: ThemeName; label: string; icon: React.ReactNode }[] = [
  { name: 'default', label: 'Cyber', icon: <Zap size={14} /> },
  { name: 'matrix', label: 'Matrix', icon: <Monitor size={14} /> },
  { name: 'fire', label: 'Fire', icon: <Flame size={14} /> },
]

export function ThemeSwitcher() {
  const { theme, setTheme } = useUIStore()

  return (
    <div className="space-y-2">
      <div className="text-[10px] font-orbitron text-hud-text-dim uppercase tracking-wider">
        Theme
      </div>
      <div className="flex gap-2">
        {themes.map(t => (
          <button
            key={t.name}
            onClick={() => setTheme(t.name)}
            className={`
              flex items-center gap-1.5 px-3 py-2 rounded text-xs font-mono transition-all cursor-pointer
              ${theme === t.name
                ? 'bg-hud-accent/20 border border-hud-accent/50 text-hud-accent'
                : 'bg-hud-surface border border-hud-border text-hud-text-dim hover:border-hud-accent/30 hover:text-hud-text'
              }
            `}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>
    </div>
  )
}
