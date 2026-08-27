export interface ModelConfig {
  id: string
  name: string
  displayName: string
  size: string
  quant: string
  description: string
}

export const AVAILABLE_MODELS: ModelConfig[] = [
  {
    id: 'qwen2.5-3b-instruct-q4_k_m.gguf',
    name: 'Qwen2.5-3B-Instruct',
    displayName: 'Qwen 2.5 3B',
    size: '~2 GB',
    quant: 'Q4_K_M',
    description: 'Local via Python backend — CPU',
  },
]

export const DEFAULT_MODEL_ID = 'qwen2.5-3b-instruct-q4_k_m.gguf'

export function getModelConfig(id: string): ModelConfig | undefined {
  return AVAILABLE_MODELS.find(m => m.id === id)
}