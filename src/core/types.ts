export interface MessageAttachment {
  name: string
  type: string
  preview?: string
}

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
  tokens?: number
  isStreaming?: boolean
  attachments?: MessageAttachment[]
}

export interface ChatSession {
  id: string
  title: string
  messages: Message[]
  createdAt: number
  updatedAt: number
}

export interface ModelStatus {
  state: 'idle' | 'loading' | 'ready' | 'error'
  progress: number
  downloadProgress?: number
  error?: string
  modelName: string
}

export interface InferenceMetrics {
  tokensPerSecond: number
  latency: number
  totalTokens: number
  totalMessages: number
}

export interface GPUInfo {
  available: boolean
  name?: string
  adapter?: string
}

export type ThemeName = 'default' | 'matrix' | 'fire'

export interface HUDTheme {
  name: ThemeName
  accent: string
  accentAlt: string
  glow: string
}
