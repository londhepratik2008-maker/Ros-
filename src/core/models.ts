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
    id: 'Qwen2.5-7B-Instruct-q4f32_1',
    name: 'Qwen2.5-7B-Instruct',
    displayName: 'Qwen 2.5 7B',
    size: '~4.5 GB',
    quant: 'Q4F32_1',
    description: 'Balanced performance and quality',
  },
  {
    id: 'Qwen2.5-3B-Instruct-q4f32_1',
    name: 'Qwen2.5-3B-Instruct',
    displayName: 'Qwen 2.5 3B',
    size: '~2.2 GB',
    quant: 'Q4F32_1',
    description: 'Lightweight, faster inference',
  },
  {
    id: 'Llama-3.1-8B-Instruct-q4f32_1',
    name: 'Llama-3.1-8B-Instruct',
    displayName: 'Llama 3.1 8B',
    size: '~5 GB',
    quant: 'Q4F32_1',
    description: 'Meta\'s latest, strong reasoning',
  },
]

export const DEFAULT_MODEL_ID = 'Qwen2.5-7B-Instruct-q4f32_1'

export function getModelConfig(id: string): ModelConfig | undefined {
  return AVAILABLE_MODELS.find(m => m.id === id)
}
