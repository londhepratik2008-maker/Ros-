import { useState, useRef, useCallback, useEffect } from 'react'

interface UseVoiceOptions {
  onResult?: (transcript: string) => void
  onSpeak?: () => void
  onSpeakEnd?: () => void
  continuous?: boolean
  language?: string
}

export function useVoice(options: UseVoiceOptions = {}) {
  const { onResult, onSpeak, onSpeakEnd, continuous = false, language = 'en-US' } = options
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const recognitionRef = useRef<any>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    setIsSupported(!!SpeechRecognition && !!window.speechSynthesis)
    synthRef.current = window.speechSynthesis || null
  }, [])

  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) return

    const recognition = new SpeechRecognition()
    recognition.lang = language
    recognition.interimResults = true
    recognition.continuous = continuous
    recognition.maxAlternatives = 1

    recognition.onstart = () => setIsListening(true)
    recognition.onend = () => setIsListening(false)
    recognition.onerror = () => setIsListening(false)

    recognition.onresult = (event: any) => {
      let finalTranscript = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript
        }
      }
      if (finalTranscript) {
        onResult?.(finalTranscript.trim())
      }
    }

    recognitionRef.current = recognition
    recognition.start()
  }, [language, continuous, onResult])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setIsListening(false)
  }, [])

  const speak = useCallback((text: string) => {
    if (!synthRef.current) return

    synthRef.current.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = language
    utterance.rate = 1.0
    utterance.pitch = 1.0

    utterance.onstart = () => { setIsSpeaking(true); onSpeak?.() }
    utterance.onend = () => { setIsSpeaking(false); onSpeakEnd?.() }
    utterance.onerror = () => { setIsSpeaking(false); onSpeakEnd?.() }

    synthRef.current.speak(utterance)
  }, [language, onSpeak, onSpeakEnd])

  const stopSpeaking = useCallback(() => {
    synthRef.current?.cancel()
    setIsSpeaking(false)
  }, [])

  const toggleListening = useCallback(() => {
    if (isListening) stopListening()
    else startListening()
  }, [isListening, startListening, stopListening])

  return {
    isListening,
    isSpeaking,
    isSupported,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    toggleListening,
  }
}
