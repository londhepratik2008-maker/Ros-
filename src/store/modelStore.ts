import { create } from 'zustand'
import type { ModelStatus, InferenceMetrics, GPUInfo } from '../core/types'

interface ModelState {
  model: ModelStatus
  gpu: GPUInfo
  metrics: InferenceMetrics

  setModelStatus: (status: Partial<ModelStatus>) => void
  setGPU: (gpu: GPUInfo) => void
  updateMetrics: (update: Partial<InferenceMetrics>) => void
}

export const useModelStore = create<ModelState>((set) => ({
  model: {
    state: 'idle',
    progress: 0,
    modelName: 'Qwen2.5-7B-Instruct-q4f32_1',
  },
  gpu: { available: false },
  metrics: {
    tokensPerSecond: 0,
    latency: 0,
    totalTokens: 0,
    totalMessages: 0,
  },

  setModelStatus: (status) =>
    set(state => ({ model: { ...state.model, ...status } })),

  setGPU: (gpu) => set({ gpu }),

  updateMetrics: (update) =>
    set(state => ({ metrics: { ...state.metrics, ...update } })),
}))
