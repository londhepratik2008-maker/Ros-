import { audioAnalyzer } from '../../App'
import { Waves, WavesLadder } from 'lucide-react'
import { useState, useEffect } from 'react'

export function AudioToggle() {
  const [active, setActive] = useState(false)

  useEffect(() => {
    const check = () => setActive(audioAnalyzer.isActive)
    const interval = setInterval(check, 200)
    return () => clearInterval(interval)
  }, [])

  return (
    <button
      onClick={() => {
        audioAnalyzer.toggle()
        setActive(audioAnalyzer.isActive)
      }}
      className={`
        flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-mono transition-all cursor-pointer
        ${active
          ? 'text-hud-accent bg-hud-accent/15 border border-hud-accent/40 shadow-[0_0_10px_rgba(214,51,132,0.3)]'
          : 'text-hud-text-dim hover:text-hud-accent border border-transparent hover:border-hud-accent/20'
        }
      `}
      title={active ? 'Nebula mic ON - click to disable' : 'Enable nebula audio reactivity'}
    >
      {active ? <Waves size={12} className="animate-pulse" /> : <WavesLadder size={12} />}
      <span className="hidden sm:inline">{active ? 'AUDIO' : 'NEBULA'}</span>
    </button>
  )
}
