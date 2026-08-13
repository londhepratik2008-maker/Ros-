import { ThemeSwitcher } from '../ui/ThemeSwitcher'
import { HUDPanel } from '../ui/HUDPanel'
import { Settings } from 'lucide-react'

export function SettingsPanel() {
  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <h2 className="font-orbitron text-sm text-hud-accent tracking-wider uppercase flex items-center gap-2">
        <Settings size={16} />
        Settings
      </h2>

      <HUDPanel title="Appearance">
        <ThemeSwitcher />
      </HUDPanel>

      <HUDPanel title="About">
        <div className="space-y-2 text-xs font-mono text-hud-text-dim">
          <div className="flex justify-between">
            <span>Version</span>
            <span className="text-hud-accent">0.1.0</span>
          </div>
          <div className="flex justify-between">
            <span>Engine</span>
            <span className="text-hud-text">@mlc-ai/web-llm</span>
          </div>
          <div className="flex justify-between">
            <span>Framework</span>
            <span className="text-hud-text">React 19 + Vite</span>
          </div>
          <p className="text-hud-text-dim pt-2 border-t border-hud-border">
            Rosee runs AI models entirely in your browser using WebGPU.
            No data is sent to any server.
          </p>
        </div>
      </HUDPanel>
    </div>
  )
}
