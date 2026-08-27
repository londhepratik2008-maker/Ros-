export async function detectWebGPU(): Promise<{ available: boolean; name?: string }> {
  if (!navigator.gpu) {
    return { available: false }
  }

  try {
    const adapter = await navigator.gpu.requestAdapter()
    if (!adapter) {
      return { available: false }
    }

    // Prefer the modern `adapter.info`, fall back to legacy requestAdapterInfo()
    let name: string | undefined
    const info = (adapter as any).info
    if (info && (info.device || info.description || info.vendor)) {
      name = [info.vendor, info.architecture, info.device, info.description]
        .filter(Boolean)
        .join(' ') || undefined
    } else if (typeof (adapter as any).requestAdapterInfo === 'function') {
      try {
        const legacy = await (adapter as any).requestAdapterInfo()
        name = legacy?.device || legacy?.description
      } catch {
        // ignore — keep undefined
      }
    }

    return {
      available: true,
      name: name || 'WebGPU Adapter',
    }
  } catch {
    return { available: false }
  }
}
