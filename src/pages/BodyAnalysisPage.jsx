import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, X, Send } from 'lucide-react'
import useNutriStore from '../store/useNutriStore.js'
import { callAnthropic } from '../lib/anthropic.js'
import useIsMobile from '../hooks/useIsMobile.js'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import Spinner from '../components/ui/Spinner.jsx'

const SCALE_MEN = [
  { label: 'Essentiel', min: 2,  max: 5,  color: '#7C3AED' },
  { label: 'Athlete',   min: 6,  max: 13, color: '#2563EB' },
  { label: 'Fitness',   min: 14, max: 17, color: '#16A34A' },
  { label: 'Moyenne',   min: 18, max: 24, color: '#D97706' },
  { label: 'Obesite',   min: 25, max: 40, color: '#DC2626' },
]
const SCALE_WOMEN = [
  { label: 'Essentiel', min: 10, max: 13, color: '#7C3AED' },
  { label: 'Athlete',   min: 14, max: 20, color: '#2563EB' },
  { label: 'Fitness',   min: 21, max: 24, color: '#16A34A' },
  { label: 'Moyenne',   min: 25, max: 31, color: '#D97706' },
  { label: 'Obesite',   min: 32, max: 50, color: '#DC2626' },
]

const SCALE_LABELS = {
  Essentiel: 'Essentiel',
  Athlete: 'Athlète',
  Fitness: 'Fitness',
  Moyenne: 'Moyenne',
  Obesite: 'Obésité',
}

const DEMO_RESULT = null // pas de demo — l'analyse nécessite une vraie clé API

function compressImage(file, maxSizePx = 1400, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = reject
    reader.onload = (ev) => {
      const img = new Image()
      img.onerror = reject
      img.onload = () => {
        let { width, height } = img
        if (width > maxSizePx || height > maxSizePx) {
          if (width > height) { height = Math.round(height * maxSizePx / width); width = maxSizePx }
          else { width = Math.round(width * maxSizePx / height); height = maxSizePx }
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        canvas.getContext('2d').drawImage(img, 0, 0, width, height)
        const dataUrl = canvas.toDataURL('image/jpeg', quality)
        resolve(dataUrl.split(',')[1])
      }
      img.src = String(ev.target?.result || '')
    }
    reader.readAsDataURL(file)
  })
}

function buildPrompt({ sex, freeText }) {
  const sexLabel = sex === 'femme' ? 'femme' : 'homme'
  const extra = freeText && freeText.trim() ? '\nContexte : "' + freeText.trim() + '"' : ''
  return `Tu es un expert en composition corporelle avec 20 ans d'experience. Analyse precisement cette photo d'un(e) ${sexLabel} et estime son body fat %.${extra}

Marqueurs visuels a evaluer avec precision :
- Abdominaux visibles partiellement = ~14-17% (homme) / ~21-24% (femme)
- Abdominaux clairement definis = ~10-13% (homme) / ~18-20% (femme)
- Abdominaux tres definis + veines abdominales = ~8-10% (homme) / ~15-17% (femme)
- Veines sur les bras + epaules striated = ~6-8% (homme) / ~14-16% (femme)
- Graisse visible sur le ventre sans definition = ~18-25% (homme) / ~25-32% (femme)
- Couche graisseuse importante = >25% (homme) / >32% (femme)
- Muscles visibles mais legers avec peu de definition = ~15-18% (homme)

Ne surestime pas le body fat. Si les muscles sont clairement visibles avec une certaine separation, estime plutot dans la fourchette basse. Si tu vois des veines, c'est en dessous de 12% pour un homme.

Reponds UNIQUEMENT avec ce JSON :
{"low": <entier>, "high": <entier>, "mid": <entier>}

Exemple : {"low": 11, "high": 15, "mid": 13}`
}

function parseResult(text) {
  try {
    const match = text.match(/\{[^}]+\}/)
    if (!match) return null
    const obj = JSON.parse(match[0])
    if (typeof obj.low === 'number' && typeof obj.high === 'number') {
      return { low: obj.low, high: obj.high, bf: obj.mid != null ? obj.mid : Math.round((obj.low + obj.high) / 2) }
    }
    return null
  } catch (e) { return null }
}

function BodyFatScale({ bf, sex }) {
  const scale = sex === 'femme' ? SCALE_WOMEN : SCALE_MEN
  const totalMin = scale[0].min
  const totalMax = scale[scale.length - 1].max
  const clampedBf = Math.min(Math.max(bf, totalMin), totalMax)
  const pct = ((clampedBf - totalMin) / (totalMax - totalMin)) * 100
  const activeZone = scale.find(function(z) { return bf >= z.min && bf <= z.max }) || scale[scale.length - 1]

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>
          Masse grasse estimée
        </div>
        <div style={{ fontSize: 72, fontWeight: 800, color: activeZone.color, fontFamily: '"DM Mono", monospace', lineHeight: 1, letterSpacing: '-0.03em' }}>
          {bf}%
        </div>
        <div style={{
          display: 'inline-block', marginTop: 10, padding: '6px 18px', borderRadius: 9999,
          background: activeZone.color + '18', border: '1px solid ' + activeZone.color + '40',
          color: activeZone.color, fontSize: 13, fontWeight: 800,
        }}>
          {SCALE_LABELS[activeZone.label] || activeZone.label}
        </div>
      </div>

      <div style={{ position: 'relative', marginBottom: 14 }}>
        <div style={{ display: 'flex', height: 14, borderRadius: 9999, overflow: 'hidden', gap: 2 }}>
          {scale.map(function(z) {
            return (
              <div key={z.label} style={{
                flex: z.max - z.min,
                background: z.color,
                opacity: activeZone.label === z.label ? 1 : 0.2,
              }} />
            )
          })}
        </div>
        <div style={{
          position: 'absolute', top: -3, left: pct + '%', transform: 'translateX(-50%)',
          width: 20, height: 20, borderRadius: '50%',
          background: activeZone.color, border: '3px solid white',
          boxShadow: '0 2px 10px ' + activeZone.color + '60',
        }} />
      </div>

      <div style={{ display: 'flex' }}>
        {scale.map(function(z) {
          return (
            <div key={z.label} style={{ flex: z.max - z.min, textAlign: 'center' }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: activeZone.label === z.label ? z.color : 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                {SCALE_LABELS[z.label] || z.label}
              </div>
              <div style={{ fontSize: 9, color: 'var(--muted)', fontFamily: '"DM Mono", monospace', marginTop: 1 }}>
                {z.min}–{z.max}%
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function BodyAnalysisPage() {
  const { profile } = useNutriStore()
  const isMobile = useIsMobile()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [photos, setPhotos] = useState([])
  const [sex, setSex] = useState(profile.sex === 'femme' ? 'femme' : 'homme')
  const [freeText, setFreeText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  async function handlePhotoPick(e) {
    const files = Array.from(e.target.files || [])
    e.target.value = ''
    const additions = []
    for (let i = 0; i < files.slice(0, 2 - photos.length).length; i++) {
      const file = files[i]
      if (!file.type.startsWith('image/')) continue
      if (file.size > 30 * 1024 * 1024) { setError('Image trop lourde (max 30 Mo).'); continue }
      const data = await compressImage(file)
      additions.push({ id: file.name + '-' + Date.now(), previewUrl: URL.createObjectURL(file), data: data, mediaType: 'image/jpeg' })
    }
    setPhotos(function(prev) { return [...prev, ...additions].slice(0, 2) })
  }

  function removePhoto(id) {
    setPhotos(function(prev) {
      const img = prev.find(function(x) { return x.id === id })
      if (img && img.previewUrl) URL.revokeObjectURL(img.previewUrl)
      return prev.filter(function(x) { return x.id !== id })
    })
  }

  async function handleAnalyze() {
    if (photos.length === 0) { setError('Ajoute au moins une photo.'); return }
    setError('')
    setResult(null)
    setLoading(true)

    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
    const useDemo = !apiKey || apiKey === 'sk-ant-votre-cle-ici'

    try {
      if (useDemo) {
        setError("Configure ta clé API Anthropic (VITE_ANTHROPIC_API_KEY) pour utiliser cette fonctionnalité. L'analyse de photo nécessite un accès réel au modèle.")
        return
      }

      const content = []
      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i]
        content.push({ type: 'image', source: { type: 'base64', media_type: photo.mediaType, data: photo.data } })
      }
      content.push({ type: 'text', text: buildPrompt({ sex: sex, freeText: freeText }) })

      const raw = await callAnthropic(
        [{ role: 'user', content: content }],
        'analysis',
        { max_tokens: 60, timeoutMs: 30000 }
      )

      const parsed = parseResult(raw)
      if (!parsed) throw new Error('Reponse inattendue, reessaie.')
      setResult(parsed)
    } catch (e) {
      setError(e.message || "Erreur lors de l'analyse.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 520 }}>
      <div style={{ marginBottom: isMobile ? 20 : 28 }}>
        <h1 style={{ fontSize: isMobile ? 22 : 28, fontWeight: 800, color: 'var(--text)', marginBottom: 6, letterSpacing: '-0.02em' }}>
          Analyse physique
        </h1>
        <p style={{ fontSize: 14, color: 'var(--muted)', fontWeight: 500, lineHeight: 1.55 }}>
          Envoie une photo pour estimer ton taux de masse grasse et voir ou tu te situes.
        </p>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
            Sexe
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            {[{ v: 'homme', l: '♂ Homme' }, { v: 'femme', l: '♀ Femme' }].map(function(item) {
              return (
                <button key={item.v} onClick={function() { setSex(item.v) }} style={{
                  flex: 1, padding: '10px', borderRadius: 14, border: '1px solid',
                  borderColor: sex === item.v ? 'var(--accent-border)' : 'var(--line)',
                  background: sex === item.v ? 'var(--accent-soft)' : 'var(--surface-input)',
                  color: sex === item.v ? 'var(--accent)' : 'var(--muted)',
                  fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                }}>
                  {item.l}
                </button>
              )
            })}
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
            Photo ({photos.length}/2)
          </label>
          <div style={{ display: 'flex', gap: 12 }}>
            {photos.map(function(photo) {
              return (
                <div key={photo.id} style={{ position: 'relative', width: 100, height: 120, borderRadius: 14, overflow: 'hidden', border: '1px solid var(--line)', flexShrink: 0 }}>
                  <img src={photo.previewUrl} alt="physique" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button onClick={function() { removePhoto(photo.id) }} style={{
                    position: 'absolute', top: 5, right: 5, width: 22, height: 22, borderRadius: '50%',
                    background: 'rgba(0,0,0,0.65)', border: 'none', color: '#fff', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <X size={12} />
                  </button>
                </div>
              )
            })}
            {photos.length < 2 && (
              <button onClick={function() { if (fileInputRef.current) fileInputRef.current.click() }} style={{
                width: 100, height: 120, borderRadius: 14,
                border: '2px dashed var(--accent-border)', background: 'var(--accent-soft)',
                color: 'var(--accent)', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}>
                <Camera size={22} />
                <span style={{ fontSize: 11, fontWeight: 700 }}>Ajouter</span>
              </button>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handlePhotoPick} style={{ display: 'none' }} />
          <p style={{ marginTop: 8, fontSize: 11, color: 'var(--muted)', fontWeight: 500 }}>
            Bonne lumiere, torse visible, face ou profil.
          </p>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
            Contexte <span style={{ textTransform: 'none', fontSize: 11 }}>(optionnel)</span>
          </label>
          <textarea
            value={freeText}
            onChange={function(e) { setFreeText(e.target.value) }}
            placeholder="Ex : je fais de la muscu 4x/semaine, je me sens gras au niveau du ventre..."
            rows={2}
            style={{
              width: '100%', padding: '12px 16px', borderRadius: 16,
              border: '1px solid var(--line)', background: 'var(--surface-input)',
              color: 'var(--text)', fontSize: 13, fontFamily: 'inherit',
              fontWeight: 500, resize: 'none', outline: 'none', lineHeight: 1.55,
            }}
          />
        </div>

        <AnimatePresence>
          {error && (
            <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              style={{ fontSize: 13, color: '#C62828', background: '#FFEBEE', border: '1px solid rgba(198,40,40,0.2)', borderRadius: 12, padding: '10px 14px', marginBottom: 14 }}>
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <Button onClick={handleAnalyze} disabled={loading || photos.length === 0}
          style={{ width: '100%', justifyContent: 'center', padding: '14px 22px', fontSize: 15, borderRadius: 18 }}>
          {loading ? <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Spinner size={16} /> Analyse en cours</span> : 'Estimer mon body fat'}
        </Button>
      </Card>

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <Card style={{ marginBottom: 12 }}>
              <BodyFatScale bf={result.bf} sex={sex} />
              {result.low !== result.high && (
                <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--muted)', marginTop: 16, fontWeight: 500 }}>
                  Fourchette : <strong style={{ color: 'var(--text)', fontFamily: '"DM Mono", monospace' }}>{result.low}–{result.high}%</strong>
                </p>
              )}
            </Card>

            <Card>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Envoyer au Coach IA</p>
              <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 14, lineHeight: 1.5 }}>
                Demande au coach comment optimiser ton alimentation selon ton body fat actuel.
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  onClick={function() {
                    navigate('/app/assistant', {
                      state: {
                        prefillText: 'Mon body fat est estime a ' + result.bf + '% (fourchette ' + result.low + '-' + result.high + '%). Comment optimiser mon alimentation ?' + (freeText.trim() ? '\n\nContexte : ' + freeText.trim() : ''),
                      }
                    })
                  }}
                  style={{
                    flex: '1 1 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    padding: '11px 16px', borderRadius: 14, border: '1px solid var(--accent-border)',
                    background: 'var(--accent-soft)', color: 'var(--accent)',
                    fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  <Send size={14} /> Envoyer l'analyse
                </button>
                {photos.length > 0 && (
                  <button
                    onClick={function() {
                      navigate('/app/assistant', {
                        state: {
                          prefillText: 'Regarde ma photo et dis-moi comment optimiser mon alimentation.' + (freeText.trim() ? ' Contexte : ' + freeText.trim() : ''),
                          prefillImages: photos.map(function(p) { return { data: p.data, mediaType: p.mediaType, name: 'photo-physique' } }),
                        }
                      })
                    }}
                    style={{
                      flex: '1 1 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      padding: '11px 16px', borderRadius: 14, border: '1px solid var(--line)',
                      background: 'var(--surface-input)', color: 'var(--text)',
                      fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                    }}
                  >
                    Envoyer avec la photo
                  </button>
                )}
              </div>
            </Card>

            <p style={{ marginTop: 10, fontSize: 11, color: 'var(--muted)', textAlign: 'center', fontWeight: 500, lineHeight: 1.6 }}>
              Estimation indicative plus ou moins 3 a 5%. Ne remplace pas un bilan medical.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
