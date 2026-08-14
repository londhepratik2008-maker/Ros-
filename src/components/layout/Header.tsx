import { useChatStore } from '../../store/chatStore'
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react'
import { useState } from 'react'

export function Header() {
  const { isStreaming } = useChatStore()
  const [isListening, setIsListening] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(true)

  return (
    <header className="h-10 bg-hud-surface/50 backdrop-blur-sm border-b border-hud-border flex items-center px-4 justify-between">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-hud-accent to-hud-accent-alt flex items-center justify-center">
          <span className="text-[8px] font-orbitron font-bold text-hud-bg">R</span>
        </div>
        <span className="font-orbitron text-xs text-hud-accent tracking-wider">ROSEE</span>
      </div>

      <div className="flex items-center gap-3">
        {isStreaming && (
          <span className="text-[10px] font-mono text-hud-accent animate-pulse">Generating...</span>
        )}

        <button
          onClick={() => setIsListening(!isListening)}
          className={`w-6 h-6 flex items-center justify-center rounded transition-colors cursor-pointer ${
            isListening
              ? 'text-hud-danger bg-hud-danger/20 animate-pulse'
              : 'text-hud-text-dim hover:text-hud-accent hover:bg-hud-accent/10'
          }`}
        >
          {isListening ? <MicOff size={12} /> : <Mic size={12} />}
        </button>

        <button
          onClick={() => setAudioEnabled(!audioEnabled)}
          className={`w-6 h-6 flex items-center justify-center rounded transition-colors cursor-pointer ${
            audioEnabled
              ? 'text-hud-accent hover:bg-hud-accent/10'
              : 'text-hud-text-dim hover:text-hud-accent hover:bg-hud-accent/10'
          }`}
        >
          {audioEnabled ? <Volume2 size={12} /> : <VolumeX size={12} />}
        </button>

        <span className="text-hud-accent/40 text-[10px]">|</span>
        <span className="font-orbitron text-hud-accent/60 text-[10px] tracking-[0.2em]">v0.1.0</span>
      </div>
    </header>
  )
}
