import { useRef, useState } from 'react'
import { isPdfFile } from '../../lib/pdfFile.js'
import Button from '../ui/Button.jsx'
import Spinner from '../ui/Spinner.jsx'

const TARGET_LABELS = {
  current: 'Aliments consommés actuellement',
  likes: 'Aliments aimés',
  dislikes: 'Aliments exclus / allergies',
}

function parseItems(text) {
  return text
    .split(/[\n,;]+/)
    .map(s => s.trim().toLowerCase().replace(/^[-•*]\s*/, ''))
    .filter(s => s.length > 1 && s.length < 80)
}

export default function FoodListImport({ foods, setFoods }) {
  const inputRef = useRef(null)
  const [target, setTarget] = useState('current')
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const selectStyle = {
    padding: '10px 16px',
    borderRadius: 9999,
    border: '1px solid var(--line)',
    background: 'var(--card)',
    color: 'var(--text)',
    fontSize: 13,
    fontWeight: 500,
    fontFamily: 'inherit',
    cursor: 'pointer',
    outline: 'none',
  }

  async function loadFile(file) {
    if (isPdfFile(file)) {
      const { extractTextFromPdfFile } = await import('../../lib/extractTextFromPdf.js')
      const text = await extractTextFromPdfFile(file)
      if (!text?.trim()) throw new Error('Ce PDF ne contient pas de texte lisible (scan ou image). Exporte en .txt si besoin.')
      return text
    }
    return file.text()
  }

  async function onFileChange(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setMessage(null)
    setError(null)
    setLoading(true)
    try {
      const text = await loadFile(file)
      const items = parseItems(text)
      if (!items.length) {
        setError('Aucun aliment détecté. Vérifie le format (un aliment par ligne ou séparés par des virgules).')
        return
      }
      const existing = foods[target] || []
      const merged = [...new Set([...existing, ...items])]
      setFoods({ [target]: merged })
      setMessage(`${items.length} aliment(s) ajouté(s) dans « ${TARGET_LABELS[target]} ».`)
    } catch (err) {
      setError(err.message || 'Impossible de lire ce fichier.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      padding: '14px 16px', borderRadius: 16,
      border: '1px solid var(--line)', background: 'var(--surface-input)',
      marginBottom: 20, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12,
    }}>
      <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600 }}>
        Importer depuis un fichier <span style={{ opacity: 0.7 }}>(.txt, .csv, .pdf)</span>
      </span>

      <select style={selectStyle} value={target} onChange={(e) => setTarget(e.target.value)}>
        {Object.entries(TARGET_LABELS).map(([val, label]) => (
          <option key={val} value={val}>{label}</option>
        ))}
      </select>

      <input
        ref={inputRef}
        type="file"
        accept=".txt,.csv,.pdf,text/plain,text/csv,application/pdf"
        style={{ display: 'none' }}
        onChange={onFileChange}
      />
      <Button
        variant="secondary"
        style={{ padding: '9px 16px', fontSize: 13 }}
        disabled={loading}
        onClick={() => inputRef.current?.click()}
      >
        {loading ? <><Spinner size={14} /> Lecture…</> : 'Choisir un fichier'}
      </Button>

      {message && <span style={{ fontSize: 12, color: '#2E7D32', fontWeight: 600 }}>✓ {message}</span>}
      {error && <span style={{ fontSize: 12, color: '#C62828', fontWeight: 600 }}>⚠ {error}</span>}
    </div>
  )
}
