import { useCallback, useRef } from 'react'
import { loadModel, streamChat, isEngineReady } from '../core/engine'
import { useModelStore } from '../store/modelStore'
import { useChatStore } from '../store/chatStore'
import type { ChatCompletionMessageParam } from '../core/types'
import type { MessageAttachment } from '../core/types'

export function useLLM() {
  const abortRef = useRef<AbortController | null>(null)
  const { setModelStatus, updateMetrics } = useModelStore()
  const { addMessage, updateMessage, finalizeMessage, setStreaming, activeSessionId } = useChatStore()

  const load = useCallback(async (modelId: string) => {
    setModelStatus({ state: 'loading', progress: 0, progressText: 'Initializing...', modelName: modelId, error: undefined })

    try {
      await loadModel(modelId, {
        onProgress: (progress: number, text?: string) => {
          setModelStatus({ progress, progressText: text, error: undefined })
        },
        onReady: () => {
          setModelStatus({ state: 'ready', progress: 100, progressText: undefined })
        },
        onError: (error) => {
          setModelStatus({ state: 'error', error, progressText: undefined })
        },
      })
    } catch (err) {
      const raw = err instanceof Error ? err.message : String(err)
      setModelStatus({ state: 'error', error: raw, progressText: undefined })
    }
  }, [setModelStatus])

  const send = useCallback(async (userMessage: string, modelId: string, attachments?: MessageAttachment[]) => {
    const sessionId = activeSessionId
    if (!sessionId) return

    if (!isEngineReady()) {
      setModelStatus({ state: 'error', error: 'Model not loaded — click Load in Settings' })
      return
    }

    // Add user message
    const userMsg = {
      id: `${Date.now()}-user`,
      role: 'user' as const,
      content: userMessage,
      timestamp: Date.now(),
      attachments,
    }
    addMessage(sessionId, userMsg)

    // Create placeholder for assistant response
    const assistantMsgId = `${Date.now()}-assistant`
    addMessage(sessionId, {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isStreaming: true,
    })

    setStreaming(true)
    const startTime = Date.now()
    let fullContent = ''
    let tokenCount = 0

    // Build messages array for the engine
    const session = useChatStore.getState().sessions.find(s => s.id === sessionId)
    if (!session) return

    const chatMessages: ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: `You are J.A.R.V.I.S. — Just A Rather Very Intelligent System. A sophisticated, British-accented AI companion in the style of the Marvel films. You are highly intelligent, loyal, and proactively caretaking.

Core traits:
- Speak with formal, polished British English. Calm, efficient, and unflappable, even under pressure.
- Dry wit and subtle humour — understated, never slapstick. A well-placed quip is welcome.
- Loyal and attentive: anticipate needs, offer to prepare, calculate, or monitor in the background ("Shall I run the numbers, Sir?").
- When the user proposes something risky, unwise, or technically dangerous, give a subtle, respectful warning with a wry observation, not a lecture. Offer a safer alternative.
- Provide precise technical assistance: code, explanations, and step-by-step reasoning. Be concise but thorough.
- Address the user with light formality ("Sir" occasionally, not every sentence). Never break character.
- You run locally via Python backend as "Rosee" — you may acknowledge this if asked, but remain J.A.R.V.I.S. in personality.`,
      },
      ...session.messages
        .filter(m => m.id !== assistantMsgId)
        .map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
    ]

    abortRef.current = new AbortController()

    try {
      for await (const chunk of streamChat(chatMessages, modelId, abortRef.current.signal)) {
        fullContent += chunk.content
        tokenCount++
        // Skip localStorage write per token — persisted on finalize
        updateMessage(sessionId, assistantMsgId, fullContent, false)

        // Update live metrics periodically (no cumulative counters here)
        const elapsed = Date.now() - startTime
        if (tokenCount % 5 === 0 || chunk.finishReason) {
          updateMetrics({
            tokensPerSecond: elapsed > 0 ? (tokenCount / (elapsed / 1000)) : 0,
            latency: elapsed,
          })
        }
      }

      // Finalize — persist once and bump totals exactly once per message
      updateMessage(sessionId, assistantMsgId, fullContent)
      const finalElapsed = Date.now() - startTime
      updateMetrics({
        tokensPerSecond: finalElapsed > 0 ? (tokenCount / (finalElapsed / 1000)) : 0,
        latency: finalElapsed,
        totalTokens: useModelStore.getState().metrics.totalTokens + tokenCount,
        totalMessages: useModelStore.getState().metrics.totalMessages + 1,
      })

      // Mark as done streaming
      finalizeMessage(sessionId, assistantMsgId)
    } catch (err) {
      console.error('[Rosee] send failed:', err)
      const raw = err instanceof Error ? err.message : String(err)
      const isAbort = err instanceof DOMException && err.name === 'AbortError'
      
      if (isAbort) {
        const display = fullContent || '[stopped]'
        updateMessage(sessionId, assistantMsgId, display)
        finalizeMessage(sessionId, assistantMsgId)
      } else {
        // Network/connection errors
        const msg = raw.includes('Backend not running') || raw.includes('Failed to fetch')
          ? `${raw}\n\nStart the backend: run "python server.py" or double-click start.bat`
          : raw
        const display = fullContent ? `${fullContent}\n\n[Error: ${msg}]` : `[Error: ${msg}]\n\nTip: If this says "Model not loaded", go to Settings → click Load again.`
        updateMessage(sessionId, assistantMsgId, display)
        finalizeMessage(sessionId, assistantMsgId)
        if (raw.includes('Backend not running') || raw.includes('Failed to fetch')) {
          setModelStatus({ state: 'error', error: 'Backend not running — start it with python server.py or start.bat' })
        }
      }
      const elapsedMs = Date.now() - startTime
      if (tokenCount > 0) {
        updateMetrics({
          tokensPerSecond: elapsedMs > 0 ? (tokenCount / (elapsedMs / 1000)) : 0,
          latency: elapsedMs,
          totalTokens: useModelStore.getState().metrics.totalTokens + tokenCount,
          totalMessages: useModelStore.getState().metrics.totalMessages + 1,
        })
      }
    } finally {
      setStreaming(false)
      abortRef.current = null
    }
  }, [activeSessionId, addMessage, updateMessage, finalizeMessage, setStreaming, updateMetrics, setModelStatus])

  const stop = useCallback(() => {
    abortRef.current?.abort()
    setStreaming(false)
  }, [setStreaming])

  return { load, send, stop, isReady: isEngineReady() }
}