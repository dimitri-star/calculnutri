export function isPdfFile(file) {
  if (!file?.name) return false
  const n = file.name.toLowerCase()
  return n.endsWith('.pdf') || file.type === 'application/pdf'
}
