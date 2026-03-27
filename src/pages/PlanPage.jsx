import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import useNutriStore from '../store/useNutriStore.js'
import { callAnthropic, parseWeekPlan } from '../lib/anthropic.js'
import { buildAnalysisPrompt, buildWeekPlanPrompt } from '../lib/prompts.js'
import { DAYS, MEAL_COLORS, SUPERFOODS, COOK_TIME_LABELS } from '../constants/nutrition.js'
import FoodTagInput from '../components/plan/FoodTagInput.jsx'
import FoodListImport from '../components/plan/FoodListImport.jsx'
import PlanAssistant from '../components/plan/PlanAssistant.jsx'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import Spinner from '../components/ui/Spinner.jsx'

const inputStyle = {
  width: '100%',
  padding: '12px 18px',
  borderRadius: 9999,
  border: '1px solid var(--line)',
  background: 'var(--surface-input)',
  color: 'var(--text)',
  fontSize: 14,
  fontWeight: 500,
  fontFamily: 'inherit',
  outline: 'none',
}

const labelStyle = { display: 'block', fontSize: 13, color: 'var(--muted)', marginBottom: 8, fontWeight: 600 }

function StepIndicator({ current }) {
  const steps = [
    { n: 1, label: 'Tes aliments' },
    { n: 2, label: 'Analyse IA' },
    { n: 3, label: 'Plan 7 jours' },
  ]
  return (
    <div style={{ display: 'flex', gap: 0, marginBottom: 32, alignItems: 'center' }}>
      {steps.map((s, i) => (
        <div key={s.n} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
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
            <span style={{
              fontSize: 13, fontWeight: current === s.n ? 700 : 500,
              color: current >= s.n ? 'var(--text)' : 'var(--muted)',
              whiteSpace: 'nowrap',
            }}>
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div style={{
              height: 2, flex: 1, margin: '0 14px', borderRadius: 2,
              background: current > s.n ? 'var(--accent)' : 'var(--line)',
            }} />
          )}
        </div>
      ))}
    </div>
  )
}

function Step1({ onNext }) {
  const { foods, setFoods, planPrefs, setPlanPrefs, results } = useNutriStore()
  const hasResults = results.tdee !== null

  return (
    <Card>
      {!hasResults && (
        <div style={{
          padding: '14px 18px', borderRadius: 20, marginBottom: 22,
          background: '#FFF8E1', border: '1px solid rgba(245, 124, 0, 0.25)',
          fontSize: 13, color: '#E65100', fontWeight: 600,
        }}>
          ⚠️ Calcule d'abord tes besoins caloriques sur la page précédente.
        </div>
      )}
      <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 4, color: 'var(--text)' }}>Tes aliments</h2>
      <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>
        Renseigne tes habitudes alimentaires pour que l'IA génère un plan adapté.
      </p>

      <FoodListImport foods={foods} setFoods={setFoods} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <FoodTagInput
          label="Aliments consommés actuellement"
          description="Ce que tu manges déjà au quotidien"
          tags={foods.current}
          onChange={(v) => setFoods({ current: v })}
          tagColor="#2E7D32"
        />
        <FoodTagInput
          label="Aliments aimés"
          description="Ce que tu apprécies, même si tu n'en manges pas souvent"
          tags={foods.likes}
          onChange={(v) => setFoods({ likes: v })}
          tagColor="#1565C0"
        />
        <FoodTagInput
          label="Aliments exclus / allergies"
          description="Ce qu'on n'inclura JAMAIS dans ton plan"
          tags={foods.dislikes}
          onChange={(v) => setFoods({ dislikes: v })}
          tagColor="#C62828"
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={labelStyle}>Budget repas / semaine (€)</label>
            <input
              type="number"
              style={inputStyle}
              value={planPrefs.budget || ''}
              onChange={(e) => setPlanPrefs({ budget: e.target.value ? parseFloat(e.target.value) : null })}
              placeholder="80"
              min="20"
            />
          </div>
          <div>
            <label style={labelStyle}>Temps de cuisson</label>
            <select
              style={inputStyle}
              value={planPrefs.cookTime}
              onChange={(e) => setPlanPrefs({ cookTime: e.target.value })}
            >
              {Object.entries(COOK_TIME_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label style={labelStyle}>Précisions (optionnel)</label>
          <textarea
            style={{ ...inputStyle, borderRadius: 22, resize: 'vertical', minHeight: 88 }}
            value={planPrefs.extraInfo}
            onChange={(e) => setPlanPrefs({ extraInfo: e.target.value })}
            placeholder="ex: je mange souvent à la cantine le midi, je suis intolérant au lactose..."
          />
        </div>

        <Button onClick={onNext} style={{ alignSelf: 'flex-end' }}>
          Analyser et générer mon plan IA →
        </Button>
      </div>
    </Card>
  )
}

function Step2({ onNext }) {
  const store = useNutriStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [accepted, setAccepted] = useState([])

  async function handleAnalyze() {
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
            {loading ? <><Spinner size={16} /> Analyse en cours...</> : '🔬 Lancer l\'analyse IA'}
          </Button>
        </Card>
      )}

      {store.analysis && (
        <>
          <Card>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: 'var(--text)' }}>
              Analyse de ton alimentation
            </h3>
            <div className="markdown-content">
              <ReactMarkdown>{store.analysis}</ReactMarkdown>
            </div>
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

function DayPlanReadOnly({ dayData }) {
  const MEALS = ['Petit-déjeuner', 'Déjeuner', 'Collation', 'Dîner']
  let totalCal = 0
  let totalProt = 0
  let totalCarbs = 0
  let totalFat = 0

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--line)' }}>
            {['Repas', 'Aliments', 'Prot.', 'Gluc.', 'Lip.', 'Kcal'].map((h) => (
              <th
                key={h}
                style={{
                  padding: '10px 10px',
                  textAlign: h === 'Repas' || h === 'Aliments' ? 'left' : 'right',
                  color: 'var(--muted)',
                  fontWeight: 700,
                  fontSize: 10,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {MEALS.map((meal) => {
            const m = dayData?.[meal]
            if (!m) return null
            totalCal += m.calories ?? 0
            totalProt += m.proteines ?? 0
            totalCarbs += m.glucides ?? 0
            totalFat += m.lipides ?? 0
            const mc = MEAL_COLORS[meal] || {}
            return (
              <tr key={meal} style={{ borderBottom: '1px solid var(--line)' }}>
                <td style={{ padding: '10px 10px', minWidth: 110 }}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '6px 12px',
                      borderRadius: 9999,
                      fontSize: 11,
                      fontWeight: 700,
                      background: mc.bg,
                      color: mc.text,
                    }}
                  >
                    {mc.label || meal}
                  </span>
                </td>
                <td style={{ padding: '10px 10px', color: 'var(--text)', lineHeight: 1.5 }}>
                  {Array.isArray(m.aliments) ? m.aliments.join(', ') : m.aliments}
                </td>
                <td style={{ padding: '10px 10px', textAlign: 'right', fontFamily: '"DM Mono", monospace', color: '#2E7D32', fontWeight: 600 }}>
                  {m.proteines}g
                </td>
                <td style={{ padding: '10px 10px', textAlign: 'right', fontFamily: '"DM Mono", monospace', color: '#1565C0', fontWeight: 600 }}>
                  {m.glucides}g
                </td>
                <td style={{ padding: '10px 10px', textAlign: 'right', fontFamily: '"DM Mono", monospace', color: '#6A1B9A', fontWeight: 600 }}>
                  {m.lipides}g
                </td>
                <td style={{ padding: '10px 10px', textAlign: 'right', fontFamily: '"DM Mono", monospace', color: 'var(--accent)', fontWeight: 700 }}>
                  {m.calories}
                </td>
              </tr>
            )
          })}
        </tbody>
        <tfoot>
          <tr style={{ background: 'var(--surface-input)', borderTop: '2px solid var(--line)' }}>
            <td style={{ padding: '10px 10px', fontWeight: 800, color: 'var(--text)', fontSize: 12 }}>TOTAL</td>
            <td />
            <td style={{ padding: '10px 10px', textAlign: 'right', fontFamily: '"DM Mono", monospace', color: '#2E7D32', fontWeight: 800 }}>{totalProt}g</td>
            <td style={{ padding: '10px 10px', textAlign: 'right', fontFamily: '"DM Mono", monospace', color: '#1565C0', fontWeight: 800 }}>{totalCarbs}g</td>
            <td style={{ padding: '10px 10px', textAlign: 'right', fontFamily: '"DM Mono", monospace', color: '#6A1B9A', fontWeight: 800 }}>{totalFat}g</td>
            <td style={{ padding: '10px 10px', textAlign: 'right', fontFamily: '"DM Mono", monospace', color: 'var(--accent)', fontWeight: 800 }}>{totalCal}</td>
          </tr>
        </tfoot>
      </table>
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
      store.setWeekPlan(plan)
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
        <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em' }}>Plan 7 jours</h3>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Button variant="secondary" onClick={handleGenerate} disabled={loading} style={{ fontSize: 13, padding: '10px 18px' }}>
            {loading ? '...' : '↺ Régénérer'}
          </Button>
          <Button onClick={() => navigate('/export')} style={{ fontSize: 13, padding: '10px 18px' }}>
            📥 Exporter en CSV
          </Button>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'flex-start' }}>
        <div style={{ flex: '1 1 420px', minWidth: 0 }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
            {DAYS.map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => store.setCurrentDay(day)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 9999,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: store.currentDay === day ? 'var(--accent-border)' : 'var(--line)',
                  background: store.currentDay === day ? 'var(--accent-soft)' : 'var(--surface-input)',
                  color: store.currentDay === day ? 'var(--accent)' : 'var(--muted)',
                  transition: 'all 0.15s',
                  fontFamily: 'inherit',
                }}
              >
                {day}
              </button>
            ))}
          </div>
          <DayPlanReadOnly dayData={store.weekPlan[store.currentDay]} />
        </div>
        <div style={{ flex: '1 1 300px', maxWidth: 420, width: '100%' }}>
          <PlanAssistant weekPlan={store.weekPlan} setWeekPlan={store.setWeekPlan} results={store.results} foods={store.foods} />
        </div>
      </div>
    </Card>
  )
}

export default function PlanPage() {
  const store = useNutriStore()
  const { results, analysis, weekPlan } = store
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
    <div style={{ maxWidth: 1120 }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text)', marginBottom: 8, letterSpacing: '-0.02em' }}>Plan alimentaire</h1>
          <p style={{ fontSize: 15, color: 'var(--muted)', fontWeight: 500, maxWidth: 480, lineHeight: 1.55 }}>Génère ton plan 7 jours personnalisé avec l&apos;IA.</p>
        </div>
        {(analysis || weekPlan) && (
          <button onClick={handleReset} style={{
            background: 'none', border: '1px solid rgba(229,57,53,0.3)', borderRadius: 9999,
            color: '#e53935', cursor: 'pointer', fontSize: 13, fontWeight: 600,
            padding: '8px 16px', fontFamily: 'inherit', whiteSpace: 'nowrap',
            transition: 'all 0.15s',
          }}>
            🗑 Tout réinitialiser
          </button>
        )}
      </div>

      <StepIndicator current={step} />

      {step === 1 && <Step1 onNext={() => setStep(2)} />}
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
