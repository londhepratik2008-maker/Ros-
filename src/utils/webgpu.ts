export async function detectWebGPU(): Promise<{ available: boolean; name?: string }> {
  if (!navigator.gpu) {
    return { available: false }
  }

  try {
    const adapter = await navigator.gpu.requestAdapter()
    if (!adapter) {
      return { available: false }
    }

    const info = (adapter as any).requestAdapterInfo
      ? await (adapter as any).requestAdapterInfo()
      : { device: 'WebGPU', description: 'WebGPU Adapter' }
    return {
      available: true,
      name: info.device || info.description || 'WebGPU Adapter',
    }
  } catch {
    return { available: false }
  }
}
