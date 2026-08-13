import type { ChatCompletionMessageParam, CreateMLCEngineConfig } from '@mlc-ai/web-llm'

type EngineInstance = Awaited<ReturnType<typeof createEngine>> | null

let engineInstance: EngineInstance = null

async function createEngine() {
  const { CreateMLCEngine } = await import('@mlc-ai/web-llm')
  return CreateMLCEngine
}

export interface EngineCallbacks {
  onProgress?: (progress: number, text?: string) => void
  onReady?: () => void
  onError?: (error: string) => void
}

export async function loadModel(
  modelId: string,
  callbacks?: EngineCallbacks
): Promise<void> {
  if (engineInstance) {
    await unloadModel()
  }

  callbacks?.onProgress(0, 'Initializing WebGPU...')

  try {
    const CreateMLCEngine = await createEngine()

    const config: CreateMLCEngineConfig = {
      model: modelId,
      log_level: 'WARN',
    }

    engineInstance = await CreateMLCEngine(config, {
      initProgressCallback: (report: { progress: number; text?: string }) => {
        callbacks?.onProgress(report.progress * 100, report.text)
      },
    })

    callbacks?.onProgress(100, 'Model ready')
    callbacks?.onReady?.()
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    callbacks?.onError?.(msg)
    throw err
  }
}

export async function unloadModel(): Promise<void> {
  if (engineInstance) {
    try {
      await engineInstance.unloadModel()
    } catch {
      // ignore unload errors
    }
    engineInstance = null
  }
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
  if (!engineInstance) {
    throw new Error('Engine not loaded')
  }

  const response = await engineInstance.chat.completions.create({
    messages,
    model: modelId,
    stream: true,
    temperature: 0.7,
    max_tokens: 2048,
  })

  for await (const chunk of response) {
    if (signal?.aborted) {
      break
    }

    const delta = chunk.choices[0]?.delta
    const finishReason = chunk.choices[0]?.finish_reason ?? null

    yield {
      content: delta?.content ?? '',
      finishReason,
    }
  }
}

export function isEngineReady(): boolean {
  return engineInstance !== null
}

export function getEngine() {
  return engineInstance
}
