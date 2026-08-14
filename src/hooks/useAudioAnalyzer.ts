import { useState, useRef, useCallback, useEffect } from 'react'

export interface AudioData {
  frequency: Uint8Array
  waveform: Uint8Array
  bass: number
  mid: number
  treble: number
  volume: number
}

export function useAudioAnalyzer() {
  const [isActive, setIsActive] = useState(false)
  const [audioData, setAudioData] = useState<AudioData>({
    frequency: new Uint8Array(64),
    waveform: new Uint8Array(64),
    bass: 0,
    mid: 0,
    treble: 0,
    volume: 0,
  })

  const contextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number>(0)
  const frequencyDataRef = useRef<Uint8Array>(new Uint8Array(64))
  const waveformDataRef = useRef<Uint8Array>(new Uint8Array(64))

  const analyze = useCallback(() => {
    if (!analyserRef.current) return

    analyserRef.current.getByteFrequencyData(frequencyDataRef.current as Uint8Array<ArrayBuffer>)
    analyserRef.current.getByteTimeDomainData(waveformDataRef.current as Uint8Array<ArrayBuffer>)

    const freq = frequencyDataRef.current
    const len = freq.length

    // Split into bass (0-10), mid (10-40), treble (40-64)
    let bassSum = 0, midSum = 0, trebleSum = 0, totalSum = 0
    for (let i = 0; i < len; i++) {
      const val = freq[i] / 255
      totalSum += val
      if (i < 10) bassSum += val
      else if (i < 40) midSum += val
      else trebleSum += val
    }

    setAudioData({
      frequency: new Uint8Array(freq),
      waveform: new Uint8Array(waveformDataRef.current),
      bass: bassSum / 10,
      mid: midSum / 30,
      treble: trebleSum / 24,
      volume: totalSum / len,
    })

    rafRef.current = requestAnimationFrame(analyze)
  }, [])

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const ctx = new AudioContext()
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 128
      analyser.smoothingTimeConstant = 0.8

      const source = ctx.createMediaStreamSource(stream)
      source.connect(analyser)

      contextRef.current = ctx
      analyserRef.current = analyser
      sourceRef.current = source
      streamRef.current = stream

      frequencyDataRef.current = new Uint8Array(analyser.frequencyBinCount)
      waveformDataRef.current = new Uint8Array(analyser.frequencyBinCount)

      setIsActive(true)
      rafRef.current = requestAnimationFrame(analyze)
    } catch (err) {
      console.warn('Microphone access denied:', err)
    }
  }, [analyze])

  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    sourceRef.current?.disconnect()
    streamRef.current?.getTracks().forEach(t => t.stop())
    contextRef.current?.close()
    setIsActive(false)
    setAudioData({
      frequency: new Uint8Array(64),
      waveform: new Uint8Array(64),
      bass: 0,
      mid: 0,
      treble: 0,
      volume: 0,
    })
  }, [])

  const toggle = useCallback(() => {
    if (isActive) stop()
    else start()
  }, [isActive, start, stop])

  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current)
      streamRef.current?.getTracks().forEach(t => t.stop())
      contextRef.current?.close()
    }
  }, [])

  return { isActive, audioData, start, stop, toggle }
}
