export async function detectWebGPU(): Promise<{ available: boolean; name?: string }> {
  if (!navigator.gpu) {
    return { available: false }
  }

  try {
    const adapter = await navigator.gpu.requestAdapter()
    if (!adapter) {
      return { available: false }
    }

    const info = await adapter.requestAdapterInfo()
    return {
      available: true,
      name: info.device || info.description || 'WebGPU Adapter',
    }
  } catch {
    return { available: false }
  }
}
