import { useCallback, useRef } from 'react'
import { loadModel, streamChat, isEngineReady } from '../core/engine'
import { useModelStore } from '../store/modelStore'
import { useChatStore } from '../store/chatStore'
import type { ChatCompletionMessageParam } from '@mlc-ai/web-llm'

export function useLLM() {
  const abortRef = useRef<AbortController | null>(null)
  const { setModelStatus, updateMetrics } = useModelStore()
  const { addMessage, updateMessage, finalizeMessage, setStreaming, activeSessionId } = useChatStore()

  const load = useCallback(async (modelId: string) => {
    setModelStatus({ state: 'loading', progress: 0, error: undefined })

    try {
      await loadModel(modelId, {
        onProgress: (progress: number, _text?: string) => {
          setModelStatus({ progress, error: undefined })
        },
        onReady: () => {
          setModelStatus({ state: 'ready', progress: 100 })
        },
        onError: (error) => {
          setModelStatus({ state: 'error', error })
        },
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setModelStatus({ state: 'error', error: msg })
    }
  }, [setModelStatus])

  const send = useCallback(async (userMessage: string, modelId: string) => {
    const sessionId = activeSessionId
    if (!sessionId) return

    if (!isEngineReady()) {
      setModelStatus({ state: 'error', error: 'Model not loaded' })
      return
    }

    // Add user message
    const userMsg = {
      id: `${Date.now()}-user`,
      role: 'user' as const,
      content: userMessage,
      timestamp: Date.now(),
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
        content: 'You are Rosee, a helpful AI assistant. Be concise and helpful.',
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
        updateMessage(sessionId, assistantMsgId, fullContent)

        // Update metrics periodically
        const elapsed = Date.now() - startTime
        if (tokenCount % 5 === 0 || chunk.finishReason) {
          updateMetrics({
            tokensPerSecond: elapsed > 0 ? (tokenCount / (elapsed / 1000)) : 0,
            latency: elapsed,
            totalTokens: useModelStore.getState().metrics.totalTokens + tokenCount,
            totalMessages: useModelStore.getState().metrics.totalMessages + 1,
          })
        }
      }

      // Finalize
      updateMessage(sessionId, assistantMsgId, fullContent)
      const finalElapsed = Date.now() - startTime
      updateMetrics({
        tokensPerSecond: finalElapsed > 0 ? (tokenCount / (finalElapsed / 1000)) : 0,
        latency: finalElapsed,
      })

      // Mark as done streaming
      finalizeMessage(sessionId, assistantMsgId)
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        // User cancelled
      } else {
        const msg = err instanceof Error ? err.message : String(err)
        updateMessage(sessionId, assistantMsgId, fullContent + `\n\n[Error: ${msg}]`)
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
