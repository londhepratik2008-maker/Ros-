import { Component, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-full flex items-center justify-center bg-hud-bg p-8">
          <div className="glow-border rounded-lg bg-hud-surface p-8 max-w-md text-center space-y-4">
            <AlertTriangle size={48} className="text-hud-warning mx-auto" />
            <h2 className="font-orbitron text-lg text-hud-warning">Something went wrong</h2>
            <p className="text-sm text-hud-text-dim font-mono">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 mx-auto px-4 py-2 rounded bg-hud-accent/20 border border-hud-accent text-hud-accent text-xs font-orbitron uppercase tracking-wider hover:bg-hud-accent/30 transition-all cursor-pointer"
            >
              <RefreshCw size={14} />
              Reload
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
