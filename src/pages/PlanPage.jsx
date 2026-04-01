import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import useIsMobile from '../hooks/useIsMobile.js'
import useNutriStore from '../store/useNutriStore.js'
import { callAnthropic, parseWeekPlan } from '../lib/anthropic.js'
import { buildAnalysisPrompt, buildWeekPlanPrompt } from '../lib/prompts.js'
import { analyzePDFProfile } from '../lib/analyzePDFProfile.js'
import { DAYS, SUPERFOODS } from '../constants/nutrition.js'
import WeekPlanTable from '../components/plan/WeekPlanTable.jsx'
import AnalysisResult from '../components/plan/AnalysisResult.jsx'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import Spinner from '../components/ui/Spinner.jsx'

function validateAndCorrectPlan(plan, results) {
  const targetCals = results.targetCalories
  const targetCarbs = results.carbs

  DAYS.forEach((day) => {
    if (!plan[day]) return
    const repas = plan[day].repas
    if (!Array.isArray(repas)) return
    let dayCarbs = 0
    let dayCals = 0
    repas.forEach((m) => {
      dayCarbs += m.glucides || 0
      dayCals += m.calories || 0
    })
    plan[day]._warnings = []
    const carbsDiff = Math.abs(dayCarbs - targetCarbs)
    const calsDiff = Math.abs(dayCals - targetCals)
    if (carbsDiff > 15) {
      plan[day]._warnings.push(`⚠️ Glucides : ${dayCarbs}g vs ${targetCarbs}g cible (écart ${carbsDiff}g)`)
    }
    if (calsDiff > 50) {
      plan[day]._warnings.push(`⚠️ Calories : ${dayCals} kcal vs ${targetCals} kcal cible (écart ${calsDiff} kcal)`)
    }
  })
  return plan
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result.split(',')[1])
    reader.onerror = () => reject(new Error('Lecture du fichier échouée'))
    reader.readAsDataURL(file)
  })
}

function StepIndicator({ current }) {
  const isMobile = useIsMobile()
  const steps = [
    { n: 1, label: 'Dossier profil' },
    { n: 2, label: 'Analyse IA' },
    { n: 3, label: 'Plan 7 jours' },
  ]
  return (
    <div style={{ display: 'flex', gap: 0, marginBottom: isMobile ? 20 : 32, alignItems: 'center' }}>
      {steps.map((s, i) => (
        <div key={s.n} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 6 : 10 }}>
            <div style={{
              width: isMobile ? 28 : 32, height: isMobile ? 28 : 32, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 800,
              background: current >= s.n ? 'var(--accent)' : 'var(--surface-input)',
              color: current >= s.n ? '#fff' : 'var(--muted)',
              border: current === s.n ? '2px solid var(--accent-border)' : '2px solid var(--line)',
              flexShrink: 0,
              boxShadow: current >= s.n ? '0 4px 12px rgba(255, 122, 0, 0.35)' : 'none',
            }}>
              {current > s.n ? '✓' : s.n}
            </div>
            {!isMobile && (
              <span style={{
                fontSize: 13, fontWeight: current === s.n ? 700 : 500,
                color: current >= s.n ? 'var(--text)' : 'var(--muted)',
                whiteSpace: 'nowrap',
              }}>
                {s.label}
              </span>
            )}
          </div>
          {i < steps.length - 1 && (
            <div style={{
              height: 2, flex: 1, margin: isMobile ? '0 8px' : '0 14px', borderRadius: 2,
              background: current > s.n ? 'var(--accent)' : 'var(--line)',
            }} />
          )}
        </div>
      ))}
    </div>
  )
}

function Step1Upload({ onComplete }) {
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')
  const [preview, setPreview] = useState(null)
  const fileRef = useRef()
  const store = useNutriStore()

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      setStatus('error')
      setMessage('Envoie uniquement un PDF texte (export Notion, Word, Google Docs...)')
      return
    }

    setStatus('loading')
    setMessage('')
    setPreview(null)

    try {
      const base64 = await fileToBase64(file)
      const result = await analyzePDFProfile(base64)

      store.setFoods({
        current: result.current || [],
        likes: result.likes || [],
        dislikes: result.dislikes || [],
        accepted: [],
      })
      store.setPlanPrefs({
        budget: result.budget || '',
        cookTime: result.cookTime || 'moderate',
        extraInfo: result.notes || '',
      })

      if (result.profile) {
        const updates = {}
        if (result.profile.weight) updates.weight = String(result.profile.weight)
        if (result.profile.age) updates.age = String(result.profile.age)
        if (result.profile.height) updates.height = String(result.profile.height)
        if (result.profile.goal) updates.goal = result.profile.goal === 'cut' ? 'seche' : result.profile.goal === 'bulk' ? 'masse' : 'maintien'
        if (result.profile.training) updates.training = String(result.profile.training)
        if (result.profile.job) updates.job = result.profile.job
        if (result.profile.sex) updates.sex = result.profile.sex === 'male' ? 'homme' : 'femme'
        if (Object.keys(updates).length > 0) store.setProfile(updates)
      }

      setPreview(result)
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setMessage(err.message || "Erreur lors de l'analyse du PDF")
    } finally {
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div className="step1-upload">

      {status !== 'success' && (
        <div
          className={`upload-zone${status === 'loading' ? ' loading' : ''}`}
          onClick={() => status !== 'loading' && fileRef.current?.click()}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFile}
            style={{ display: 'none' }}
          />

          {status === 'loading' ? (
            <>
              <div className="upload-spinner" />
              <div className="upload-loading-text">
                <strong>Analyse en cours...</strong>
                <span>{"L'IA lit ton dossier profil et extrait toutes les informations"}</span>
              </div>
            </>
          ) : (
            <>
              <div className="upload-icon">📎</div>
              <div className="upload-text">
                <strong>Envoie ton dossier profil</strong>
                <span>Clique ici ou glisse ton PDF</span>
              </div>
              <div className="upload-formats">
                Export Notion · Word · Google Docs · tout PDF texte
              </div>
            </>
          )}
        </div>
      )}

      {status === 'error' && (
        <div className="upload-error">
          <span>⚠️ {message}</span>
          <button onClick={() => setStatus('idle')}>Réessayer</button>
        </div>
      )}

      {status === 'success' && preview && (
        <div className="upload-success">
          <div className="success-header">
            <span className="success-check">✅</span>
            <div>
              <strong>Analysé avec succès</strong>
              <span>{"L'IA a extrait toutes les informations de ton profil"}</span>
            </div>
            <button
              className="btn-reupload"
              onClick={() => { setStatus('idle'); setPreview(null) }}
            >
              Changer de fichier
            </button>
          </div>

          <div className="extraction-summary">
            {preview.current?.length > 0 && (
              <div className="summary-section">
                <div className="summary-label">🥩 Aliments consommés ({preview.current.length})</div>
                <div className="summary-tags">
                  {preview.current.map(f => (
                    <span key={f} className="summary-tag current">{f}</span>
                  ))}
                </div>
              </div>
            )}

            {preview.likes?.length > 0 && (
              <div className="summary-section">
                <div className="summary-label">💚 Aliments aimés ({preview.likes.length})</div>
                <div className="summary-tags">
                  {preview.likes.map(f => (
                    <span key={f} className="summary-tag likes">{f}</span>
                  ))}
                </div>
              </div>
            )}

            {preview.dislikes?.length > 0 && (
              <div className="summary-section">
                <div className="summary-label">🚫 Exclusions ({preview.dislikes.length})</div>
                <div className="summary-tags">
                  {preview.dislikes.map(f => (
                    <span key={f} className="summary-tag dislikes">{f}</span>
                  ))}
                </div>
              </div>
            )}

            {preview.notes && (
              <div className="summary-section">
                <div className="summary-label">📋 Contraintes & mode de vie</div>
                <div className="summary-notes">{preview.notes}</div>
              </div>
            )}

            {preview.profile && Object.values(preview.profile).some(v => v !== null) && (
              <div className="summary-section">
                <div className="summary-label">👤 Profil détecté</div>
                <div className="summary-profile">
                  {preview.profile.age && <span>🎂 {preview.profile.age} ans</span>}
                  {preview.profile.weight && <span>⚖️ {preview.profile.weight} kg</span>}
                  {preview.profile.height && <span>📏 {preview.profile.height} cm</span>}
                  {preview.profile.goal && (
                    <span>🎯 {preview.profile.goal === 'cut' ? 'Sèche' : preview.profile.goal === 'bulk' ? 'Prise de masse' : 'Maintien'}</span>
                  )}
                  {preview.profile.training && <span>💪 {preview.profile.training}x/semaine</span>}
                </div>
              </div>
            )}
          </div>

          <button className="btn-continue" onClick={onComplete}>
            Lancer l&apos;analyse IA →
          </button>
        </div>
      )}

      {status === 'idle' && (
        <div className="upload-help">
          <details>
            <summary>💡 Qu&apos;est-ce que je dois mettre dans mon dossier profil ?</summary>
            <div className="help-content">
              <p>Ton dossier peut contenir tout ou partie de ces informations :</p>
              <ul>
                <li><strong>Alimentation actuelle</strong> — ce que tu manges au quotidien, ta routine des repas</li>
                <li><strong>Aliments aimés</strong> — ce que tu apprécies même si tu n&apos;en manges pas régulièrement</li>
                <li><strong>Exclusions</strong> — allergies, intolérances, aliments que tu refuses</li>
                <li><strong>Objectif</strong> — sèche, prise de masse, maintien</li>
                <li><strong>Activité</strong> — type de travail, sport pratiqué, fréquence d&apos;entraînement</li>
                <li><strong>Contraintes</strong> — budget, temps de cuisine, mode de vie</li>
                <li><strong>Chiffres</strong> — âge, poids, taille (optionnel si déjà rempli)</li>
              </ul>
              <p>
                <strong>Format :</strong> Export Notion en PDF, document Word converti,
                Google Docs exporté... N&apos;importe quel PDF dont le texte est sélectionnable.
              </p>
            </div>
          </details>
        </div>
      )}
    </div>
  )
}

function Step2({ onNext }) {
  const store = useNutriStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [accepted, setAccepted] = useState([])

  async function handleAnalyze() {
    if (store.foods.current.length === 0 && store.foods.likes.length === 0) {
      setError("Aucun aliment n'a été extrait du dossier. Réimporte ton PDF ou vérifie son contenu.")
      return
    }
    if (!store.results.tdee) {
      setError("Calcule d'abord tes besoins caloriques sur la page précédente.")
      return
    }
    setLoading(true)
    setError(null)
    try {
      const prompt = buildAnalysisPrompt(store.profile, store.results, store.foods, store.planPrefs)
      const text = await callAnthropic(prompt, 'analysis')
      store.setAnalysis(text)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  function toggleAccepted(id) {
    setAccepted(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  function handleNext() {
    const acceptedFoods = SUPERFOODS.filter(s => accepted.includes(s.id)).map(s => s.label)
    store.setFoods({ accepted: acceptedFoods })
    onNext()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {!store.analysis && (
        <Card style={{ textAlign: 'center', padding: '40px 24px' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🔬</div>
          <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8, color: 'var(--text)' }}>
            Analyse IA de ton alimentation
          </h2>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24, maxWidth: 400, margin: '0 auto 24px' }}>
            Claude va analyser tes habitudes alimentaires et détecter les manques nutritionnels.
          </p>
          {error && (
            <div style={{
              padding: '14px 18px', borderRadius: 20, marginBottom: 16,
              background: '#FFEBEE', border: '1px solid rgba(198, 40, 40, 0.25)',
              fontSize: 13, color: '#C62828', textAlign: 'left', fontWeight: 600,
            }}>
              ❌ {error}
            </div>
          )}
          <Button onClick={handleAnalyze} disabled={loading} style={{ margin: '0 auto' }}>
            {loading ? <><Spinner size={16} /> Analyse en cours...</> : "🔬 Lancer l'analyse IA"}
          </Button>
        </Card>
      )}

      {store.analysis && (
        <>
          <Card>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: 'var(--text)' }}>
              Analyse de ton alimentation
            </h3>
            <AnalysisResult text={store.analysis} />
          </Card>

          <Card>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 6, color: 'var(--text)' }}>
              Suggestions bonus
            </h3>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>
              Coche les super-aliments que tu veux intégrer à ton plan :
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {SUPERFOODS.map(sf => (
                <label key={sf.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '14px 18px', borderRadius: 20, cursor: 'pointer',
                  background: accepted.includes(sf.id) ? 'var(--accent-soft)' : 'var(--surface-input)',
                  border: `1px solid ${accepted.includes(sf.id) ? 'var(--accent-border)' : 'var(--line)'}`,
                  transition: 'all 0.15s',
                }}>
                  <input
                    type="checkbox"
                    checked={accepted.includes(sf.id)}
                    onChange={() => toggleAccepted(sf.id)}
                    style={{ accentColor: 'var(--accent)', width: 18, height: 18 }}
                  />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{sf.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>{sf.desc}</div>
                  </div>
                </label>
              ))}
            </div>
            <div style={{ marginTop: 22, display: 'flex', justifyContent: 'flex-end', gap: 12, flexWrap: 'wrap' }}>
              <Button variant="secondary" onClick={handleAnalyze} disabled={loading}>
                {loading ? 'Rechargement...' : '↺ Relancer'}
              </Button>
              <Button onClick={handleNext}>Générer le plan 7 jours →</Button>
            </div>
          </Card>
        </>
      )}
    </div>
  )
}

function Step3() {
  const store = useNutriStore()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleGenerate() {
    setLoading(true)
    setError(null)
    try {
      const prompt = buildWeekPlanPrompt(store.profile, store.results, store.foods, store.planPrefs)
      const text = await callAnthropic(prompt, 'plan')
      const plan = parseWeekPlan(text)
      const validatedPlan = validateAndCorrectPlan(plan, store.results)
      store.setWeekPlan(validatedPlan)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  if (!store.weekPlan) {
    return (
      <Card style={{ textAlign: 'center', padding: '40px 24px' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>📅</div>
        <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8, color: 'var(--text)' }}>Plan 7 jours</h2>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24 }}>
          Claude va générer un plan alimentaire complet et varié sur 7 jours.
        </p>
        {error && (
          <div style={{
            padding: '14px 18px', borderRadius: 20, marginBottom: 16,
            background: '#FFEBEE', border: '1px solid rgba(198, 40, 40, 0.25)',
            fontSize: 13, color: '#C62828', textAlign: 'left', fontWeight: 600,
          }}>
            ❌ {error}
          </div>
        )}
        <Button onClick={handleGenerate} disabled={loading} style={{ margin: '0 auto' }}>
          {loading ? <><Spinner size={16} /> Génération en cours...</> : '📅 Générer le plan 7 jours'}
        </Button>
      </Card>
    )
  }

  return (
    <Card>
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, gap: 8 }}>
          <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em' }}>Plan 7 jours</h3>
          <Button variant="secondary" onClick={handleGenerate} disabled={loading} style={{ fontSize: 12, padding: '8px 14px' }}>
            {loading ? '...' : '↺ Régénérer'}
          </Button>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button variant="ghost" onClick={() => navigate('/app/assistant')} style={{ fontSize: 12, padding: '8px 14px', flex: '1 1 auto' }}>
            🤖 Coach IA
          </Button>
          <Button onClick={() => navigate('/app/export')} style={{ fontSize: 12, padding: '8px 14px', flex: '1 1 auto' }}>
            📥 Exporter CSV
          </Button>
        </div>
      </div>

      <WeekPlanTable
        plan={store.weekPlan}
        macros={{ calories: store.results.targetCalories, carbs: store.results.carbs }}
        currentDay={store.currentDay}
        onDayChange={store.setCurrentDay}
      />
    </Card>
  )
}

export default function PlanPage() {
  const store = useNutriStore()
  const isMobile = useIsMobile()
  const { analysis, weekPlan } = store
  const [step, setStep] = useState(() => {
    if (weekPlan) return 3
    if (analysis) return 2
    return 1
  })

  function handleReset() {
    store.setAnalysis(null)
    store.setWeekPlan(null)
    store.setFoods({ current: [], likes: [], dislikes: [], accepted: [] })
    store.setPlanPrefs({ budget: null, cookTime: 'moderate', extraInfo: '' })
    setStep(1)
  }

  return (
    <div style={{ maxWidth: 1200 }}>
      <div style={{ marginBottom: isMobile ? 16 : 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: isMobile ? 22 : 28, fontWeight: 800, color: 'var(--text)', marginBottom: 6, letterSpacing: '-0.02em' }}>Plan alimentaire</h1>
          {!isMobile && (
            <p style={{ fontSize: 15, color: 'var(--muted)', fontWeight: 500, maxWidth: 480, lineHeight: 1.55 }}>
              Génère ton plan 7 jours personnalisé avec l&apos;IA.
            </p>
          )}
        </div>
        {(analysis || weekPlan) && (
          <button onClick={handleReset} style={{
            background: 'none', border: '1px solid rgba(229,57,53,0.3)', borderRadius: 9999,
            color: '#e53935', cursor: 'pointer', fontSize: isMobile ? 12 : 13, fontWeight: 600,
            padding: isMobile ? '7px 12px' : '8px 16px', fontFamily: 'inherit', whiteSpace: 'nowrap',
            transition: 'all 0.15s',
          }}>
            🗑 Réinitialiser
          </button>
        )}
      </div>

      <StepIndicator current={step} />

      {step === 1 && <Step1Upload onComplete={() => setStep(2)} />}
      {step === 2 && <Step2 onNext={() => setStep(3)} />}
      {step === 3 && <Step3 />}

      {step > 1 && (
        <div style={{ marginTop: 12 }}>
          <button onClick={() => setStep(s => s - 1)} style={{
            background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer',
            fontSize: 13, fontFamily: 'inherit', padding: '6px 0',
          }}>
            ← Étape précédente
          </button>
        </div>
      )}
    </div>
  )
}
