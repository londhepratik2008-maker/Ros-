import { ThemeSwitcher } from '../ui/ThemeSwitcher'
import { HUDPanel } from '../ui/HUDPanel'
import { Settings, Download, CheckCircle2, Loader2, AlertTriangle } from 'lucide-react'
import { AVAILABLE_MODELS } from '../../core/models'
import { useModelStore } from '../../store/modelStore'
import { useLLM } from '../../hooks/useLLM'

export function SettingsPanel() {
  const { model } = useModelStore()
  const { load } = useLLM()

  const handleLoad = (modelId: string) => {
    if (model.state === 'loading' || (model.modelName === modelId && model.state === 'ready')) return
    void load(modelId)
  }

  const handleCancel = () => {
    // Best-effort cancel — reload page clears WebGPU loading state
    window.location.reload()
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <h2 className="font-orbitron text-sm text-hud-accent tracking-wider uppercase flex items-center gap-2">
        <Settings size={16} />
        Settings
      </h2>

      <HUDPanel title="Model">
        <div className="space-y-2">
          {AVAILABLE_MODELS.map(m => {
            const isActive = model.state === 'ready' && model.modelName === m.id
            const isLoading = model.state === 'loading' && model.modelName === m.id
            return (
              <div
                key={m.id}
                className={`flex items-center gap-3 rounded-lg border px-3 py-2 transition-colors ${
                  isActive
                    ? 'border-hud-accent/50 bg-hud-accent/10'
                    : 'border-hud-border bg-hud-bg/40 hover:border-hud-accent/30'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-orbitron text-hud-text">{m.displayName}</span>
                    <span className="text-[9px] font-mono text-hud-text-dim uppercase">{m.quant}</span>
                    <span className="text-[9px] font-mono text-hud-text-dim">{m.size}</span>
                  </div>
                  <div className="text-[10px] font-mono text-hud-text-dim truncate">{m.description}</div>
                  {isLoading && (
                    <>
                      <div className="mt-1 h-1 rounded-full bg-hud-surface overflow-hidden">
                        <div
                          className="h-full bg-hud-accent transition-all"
                          style={{ width: `${Math.min(100, model.progress)}%` }}
                        />
                      </div>
                      {model.progressText && (
                        <div className="text-[9px] font-mono text-hud-accent truncate mt-1">{model.progressText}</div>
                      )}
                    </>
                  )}
                </div>
                {isActive ? (
                  <span className="flex items-center gap-1 text-[10px] font-mono text-hud-success shrink-0">
                    <CheckCircle2 size={12} />
                    Active
                  </span>
                ) : isLoading ? (
                  <span className="flex items-center gap-1 text-[10px] font-mono text-hud-accent shrink-0">
                    <Loader2 size={12} className="animate-spin" />
                    {model.progress.toFixed(0)}%
                    <button onClick={handleCancel} className="ml-1 text-hud-text-dim hover:text-hud-danger underline cursor-pointer">Cancel</button>
                  </span>
                ) : (
                  <button
                    onClick={() => handleLoad(m.id)}
                    disabled={model.state === 'loading'}
                    className="flex items-center gap-1 px-2 py-1 rounded border border-hud-accent/40 text-[10px] font-mono text-hud-accent hover:bg-hud-accent/15 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
                  >
                    <Download size={11} />
                    Load
                  </button>
                )}
              </div>
            )
          })}

          {model.state === 'error' && (
            <div className="flex items-start gap-2 rounded-lg border border-hud-danger/40 bg-hud-danger/10 px-3 py-2">
              <AlertTriangle size={13} className="text-hud-danger mt-0.5 shrink-0" />
              <span className="text-[10px] font-mono text-hud-danger break-all">{model.error}</span>
            </div>
          )}

          <p className="text-[9px] font-mono text-hud-text-dim pt-1">
            First load downloads weights to browser cache (~GBs). Cached after that.
          </p>
        </div>
      </HUDPanel>

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
