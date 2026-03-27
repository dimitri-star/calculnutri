/**
 * Extrait le texte d’un PDF (texte sélectionnable). Les PDFs scannés (image seule) renvoient peu ou pas de texte.
 * Charge pdfjs-dist à la demande (code-splitting).
 */
export async function extractTextFromPdfFile(file) {
  const pdfjs = await import('pdfjs-dist')
  const pdfjsWorker = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default
  pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker
  const data = new Uint8Array(await file.arrayBuffer())
  const pdf = await pdfjs.getDocument({ data }).promise
  const chunks = []
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p)
    const content = await page.getTextContent()
    const line = content.items.map((item) => ('str' in item ? item.str : '')).filter(Boolean).join(' ')
    chunks.push(line)
  }
  return chunks.join('\n').trim()
}
