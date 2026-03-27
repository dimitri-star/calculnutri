import { useRef, useState } from 'react'
import { parseFoodListFromText, mergeFoodLists } from '../../lib/parseFoodListFile.js'
import { isPdfFile } from '../../lib/pdfFile.js'
import Button from '../ui/Button.jsx'
import Spinner from '../ui/Spinner.jsx'

const boxStyle = {
  padding: '16px 18px',
  borderRadius: 20,
  border: '1px solid var(--line)',
  background: 'var(--surface-input)',
  marginBottom: 8,
}

const labelStyle = { display: 'block', fontSize: 13, color: 'var(--muted)', marginBottom: 8, fontWeight: 600 }

const selectStyle = {
  width: '100%',
  padding: '10px 16px',
  borderRadius: 9999,
  border: '1px solid var(--line)',
  background: 'var(--card)',
  color: 'var(--text)',
  fontSize: 13,
  fontWeight: 500,
  fontFamily: 'inherit',
  cursor: 'pointer',
}

export default function FoodListImport({ foods, setFoods }) {
  const inputRef = useRef(null)
  const [flatTarget, setFlatTarget] = useState('current')
  const [replace, setReplace] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)
  const [loadingPdf, setLoadingPdf] = useState(false)

  function applyStructured(parsed) {
    if (replace) {
      setFoods({
        current: parsed.current,
        likes: parsed.likes,
        dislikes: parsed.dislikes,
      })
    } else {
      setFoods({
        current: mergeFoodLists(foods.current, parsed.current, false),
        likes: mergeFoodLists(foods.likes, parsed.likes, false),
        dislikes: mergeFoodLists(foods.dislikes, parsed.dislikes, false),
      })
    }
    const sum = parsed.current.length + parsed.likes.length + parsed.dislikes.length
    setMessage(
      sum
        ? `Import structuré : ${parsed.current.length} actuel(s), ${parsed.likes.length} aimé(s), ${parsed.dislikes.length} exclu(s).`
        : 'Sections détectées mais aucun aliment : vérifie les lignes sous chaque titre.'
    )
    setError(null)
  }

  function applyFlat(parsed) {
    const key = flatTarget
    const next = mergeFoodLists(foods[key], parsed.items, replace)
    setFoods({ [key]: next })
    setMessage(`${parsed.items.length} aliment(s) ${replace ? 'chargés dans' : 'ajoutés à'} « ${TARGET_LABELS[key]} ».`)
    setError(null)
  }

  async function loadFileAsText(file) {
    if (isPdfFile(file)) {
      setLoadingPdf(true)
      try {
        const { extractTextFromPdfFile } = await import('../../lib/extractTextFromPdf.js')
        return await extractTextFromPdfFile(file)
      } finally {
        setLoadingPdf(false)
      }
    }
    return file.text()
  }

  async function onFileChange(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setMessage(null)
    setError(null)
    try {
      const text = await loadFileAsText(file)
      if (isPdfFile(file) && !text.trim()) {
        setError(
          'Ce PDF ne contient pas de texte sélectionnable (souvent le cas des scans ou photos). Utilise un PDF avec du texte réel ou exporte en .txt / .csv.'
        )
        return
      }
      const parsed = parseFoodListFromText(text)
      if (parsed.structured) {
        applyStructured(parsed)
      } else {
        if (!parsed.items.length) {
          setError(
            'Aucun aliment détecté. Vérifie le format (une ligne par aliment ou virgules). Avec un PDF, l’ordre du texte peut être mélangé : préfère un fichier texte si besoin.'
          )
          return
        }
        applyFlat(parsed)
      }
    } catch {
      setError(
        isPdfFile(file)
          ? 'Impossible de lire ce PDF (fichier corrompu ou protégé). Essaie un autre export ou un .txt.'
          : 'Impossible de lire ce fichier. Essaie un .txt ou .csv en UTF-8.'
      )
    }
  }

  return (
    <div style={boxStyle}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <div style={{ flex: '1 1 200px' }}>
          <strong style={{ fontSize: 14, color: 'var(--text)', display: 'block', marginBottom: 4 }}>
            Importer une liste depuis un fichier
          </strong>
          <span style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.45 }}>
            .txt, .csv ou <strong>.pdf</strong> (texte sélectionnable — pas les scans image). Une ligne par aliment ou virgules. Blocs{' '}
            <code style={{ fontSize: 11 }}>ACTUEL</code>, <code style={{ fontSize: 11 }}>AIMÉS</code>,{' '}
            <code style={{ fontSize: 11 }}>EXCLUS</code> (voir aide ci-dessous).
          </span>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".txt,.csv,.pdf,text/plain,text/csv,application/pdf"
          style={{ display: 'none' }}
          onChange={onFileChange}
        />
        <Button
          variant="secondary"
          style={{ padding: '10px 18px', fontSize: 13 }}
          disabled={loadingPdf}
          onClick={() => inputRef.current?.click()}
        >
          {loadingPdf ? (
            <>
              <Spinner size={14} /> Lecture PDF…
            </>
          ) : (
            'Choisir un fichier'
          )}
        </Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <div>
          <label style={labelStyle}>Si le fichier est une seule liste (sans sections)</label>
          <select style={selectStyle} value={flatTarget} onChange={(e) => setFlatTarget(e.target.value)}>
            <option value="current">Aliments consommés actuellement</option>
            <option value="likes">Aliments aimés</option>
            <option value="dislikes">Aliments exclus / allergies</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Comportement</label>
          <select style={selectStyle} value={replace ? 'replace' : 'merge'} onChange={(e) => setReplace(e.target.value === 'replace')}>
            <option value="merge">Fusionner avec ce qui est déjà saisi</option>
            <option value="replace">Remplacer la liste cible</option>
          </select>
        </div>
      </div>

      <p style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.5, marginBottom: message || error ? 10 : 0 }}>
        <strong style={{ color: 'var(--text)' }}>Fichier multi-sections (optionnel) :</strong> commence une ligne par{' '}
        <code>ACTUEL</code>, <code>AIMÉS</code>, <code>EXCLUS</code> (ou <code>## Actuels</code>, etc.), puis liste les aliments en dessous.
        En <strong>fusion</strong>, les aliments sont ajoutés à chaque liste ; en <strong>remplacement</strong>, les trois listes du fichier remplacent entièrement les tiennes (section vide = liste vidée).
      </p>

      {message && (
        <div style={{ fontSize: 13, color: '#2E7D32', fontWeight: 600, marginTop: 8 }}>✓ {message}</div>
      )}
      {error && (
        <div style={{ fontSize: 13, color: '#C62828', fontWeight: 600, marginTop: 8 }}>{error}</div>
      )}
    </div>
  )
}

const TARGET_LABELS = {
  current: 'consommés actuellement',
  likes: 'aimés',
  dislikes: 'exclus',
}
