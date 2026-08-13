import { useVoice } from '../../hooks/useVoice'
import { useChatStore } from '../../store/chatStore'
import { useModelStore } from '../../store/modelStore'
import { useLLM } from '../../hooks/useLLM'
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react'

interface VoiceControlProps {
  onTranscript?: (text: string) => void
}

export function VoiceControl({ onTranscript }: VoiceControlProps) {
  const { isStreaming } = useChatStore()
  const { model } = useModelStore()
  const { send } = useLLM()

  const { isListening, isSpeaking, isSupported, toggleListening, stopSpeaking } = useVoice({
    onResult: (transcript) => {
      if (model.state === 'ready' && !isStreaming) {
        send(transcript, model.modelName)
      }
      onTranscript?.(transcript)
    },
  })

  if (!isSupported) return null

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={toggleListening}
        disabled={model.state !== 'ready'}
        className={`
          w-7 h-7 flex items-center justify-center rounded transition-all cursor-pointer text-xs
          ${isListening
            ? 'text-hud-danger bg-hud-danger/20 animate-pulse shadow-[0_0_10px_rgba(255,51,102,0.3)]'
            : 'text-hud-text-dim hover:text-hud-accent hover:bg-hud-accent/10'
          }
          disabled:opacity-30 disabled:cursor-not-allowed
        `}
        title={isListening ? 'Stop listening' : 'Start voice input'}
      >
        {isListening ? <MicOff size={14} /> : <Mic size={14} />}
      </button>

      {isSpeaking && (
        <button
          onClick={stopSpeaking}
          className="w-7 h-7 flex items-center justify-center rounded text-hud-accent bg-hud-accent/10 animate-pulse cursor-pointer"
          title="Stop speaking"
        >
          <VolumeX size={14} />
        </button>
      )}
    </div>
  )
}

export function VoiceIndicator() {
  const { isListening, isSpeaking, isSupported } = useVoice()

  if (!isSupported) return null

  if (isListening) {
    return (
      <div className="flex items-center gap-1.5 text-[10px] font-mono text-hud-danger">
        <div className="w-2 h-2 rounded-full bg-hud-danger animate-pulse" />
        LISTENING
      </div>
    )
  }

  if (isSpeaking) {
    return (
      <div className="flex items-center gap-1.5 text-[10px] font-mono text-hud-accent">
        <Volume2 size={10} className="animate-pulse" />
        SPEAKING
      </div>
    )
  }

  return null
}
