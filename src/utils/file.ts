export function isTextLikeFile(file: { type: string; name: string }): boolean {
  if (file.type.startsWith('text/')) return true
  const textExt = ['.txt', '.md', '.json', '.csv', '.xml', '.html', '.css', '.js', '.ts', '.jsx', '.tsx', '.py', '.yml', '.yaml']
  return textExt.some(ext => file.name.toLowerCase().endsWith(ext))
}

export async function readFileText(file: File, maxChars = 50000): Promise<string | null> {
  try {
    const text = await file.text()
    return text.length > maxChars ? `${text.slice(0, maxChars)}\n...[truncated]` : text
  } catch {
    return null
  }
}
