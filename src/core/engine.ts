import type { ChatCompletionMessageParam } from '../core/types'

const BASE_URL = ''

export interface EngineCallbacks {
  onProgress?: (progress: number, text?: string) => void
  onReady?: () => void
  onError?: (error: string) => void
}

let currentModelId: string | null = null
let healthCache: { ok: boolean; timestamp: number } | null = null

async function checkHealth(): Promise<boolean> {
  const now = Date.now()
  if (healthCache && now - healthCache.timestamp < 5000) {
    return healthCache.ok
  }
  try {
    const res = await fetch(`${BASE_URL}/health`, { method: 'GET' })
    const ok = res.ok
    healthCache = { ok, timestamp: now }
    return ok
  } catch {
    healthCache = { ok: false, timestamp: now }
    return false
  }
}

export async function loadModel(
  modelId: string,
  callbacks?: EngineCallbacks
): Promise<void> {
  callbacks?.onProgress(0, 'Connecting to backend...')

  const healthy = await checkHealth()
  if (!healthy) {
    const msg = 'Python backend not running. Start it with: python server.py (or run start.bat)'
    callbacks?.onError?.(msg)
    throw new Error(msg)
  }

  callbacks?.onProgress(20, 'Loading model...')

  try {
    const res = await fetch(`${BASE_URL}/load`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: modelId }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Unknown error' }))
      throw new Error(err.detail || `HTTP ${res.status}`)
    }

    callbacks?.onProgress(100, 'Model ready')
    currentModelId = modelId
    healthCache = null
    callbacks?.onReady?.()
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    callbacks?.onError?.(msg)
    throw new Error(msg)
  }
}

export async function unloadModel(): Promise<void> {
  currentModelId = null
}

export interface StreamChunk {
  content: string
  finishReason: string | null
}

export async function* streamChat(
  messages: ChatCompletionMessageParam[],
  modelId: string,
  signal?: AbortSignal
): AsyncGenerator<StreamChunk> {
  const healthy = await checkHealth()
  if (!healthy) {
    throw new Error('Backend not running. Please start the Python server (python server.py) or run start.bat')
  }

  if (currentModelId !== modelId) {
    await loadModel(modelId)
  }

  const res = await fetch(`${BASE_URL}/v1/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: modelId,
      messages,
      temperature: 0.65,
      max_tokens: 1024,
      stream: true,
    }),
    signal,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Unknown error' }))
    throw new Error(err.detail || `HTTP ${res.status}`)
  }

  if (!res.body) {
    throw new Error('No response body')
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      if (signal?.aborted) break

      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || !trimmed.startsWith('data:')) continue

        const data = trimmed.slice(5).trim()
        if (data === '[DONE]') {
          return
        }

        try {
          const parsed = JSON.parse(data)
          const delta = parsed.choices?.[0]?.delta
          const finishReason = parsed.choices?.[0]?.finish_reason ?? null

          if (delta?.content) {
            yield { content: delta.content, finishReason }
          }
          if (finishReason) {
            return
          }
        } catch {
          // Ignore parse errors on malformed SSE chunks
        }
      }
    }
  } finally {
    reader.releaseLock()
  }
}

export function isEngineReady(): boolean {
  return currentModelId !== null
}

export function getEngine() {
  return { currentModelId }
}