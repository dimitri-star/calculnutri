import { useNavigate } from 'react-router-dom'
import useNutriStore from '../store/useNutriStore.js'
import { calcAll } from '../lib/tdee.js'
import ProfileForm from '../components/calc/ProfileForm.jsx'
import ActivityForm from '../components/calc/ActivityForm.jsx'
import MacrosResult from '../components/calc/MacrosResult.jsx'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'

export default function CalcPage() {
  const { profile, results, setResults } = useNutriStore()
  const navigate = useNavigate()

  function handleCalculate() {
    const res = calcAll(profile)
    if (res) setResults(res)
  }

  const isComplete = profile.age && profile.weight && profile.height

  return (
    <div style={{ maxWidth: 960 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text)', marginBottom: 8, letterSpacing: '-0.02em' }}>
          Calcul calorique
        </h1>
        <p style={{ fontSize: 15, color: 'var(--muted)', fontWeight: 500, maxWidth: 520, lineHeight: 1.55 }}>
          Calcule tes besoins journaliers en calories et macros selon ton profil et ton activité.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Colonne gauche : formulaires */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Card>
            <ProfileForm />
          </Card>
          <Card>
            <ActivityForm />
          </Card>
          <Button
            onClick={handleCalculate}
            disabled={!isComplete}
            style={{ width: '100%', justifyContent: 'center', padding: '14px 22px', fontSize: 15, borderRadius: 18 }}
          >
            ⚡ Calculer mes besoins
          </Button>
        </div>

        {/* Colonne droite : résultats */}
        <div>
          {results.tdee ? (
            <Card>
              <MacrosResult />
              <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid var(--line)' }}>
                <Button
                  onClick={() => navigate('/plan')}
                  style={{ width: '100%', justifyContent: 'center', padding: '14px 22px', fontSize: 15, borderRadius: 18 }}
                >
                  Créer mon plan alimentaire →
                </Button>
              </div>
            </Card>
          ) : (
            <Card style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 320 }}>
              <div style={{ textAlign: 'center', padding: '20px 16px' }}>
                <div
                  style={{
                    width: 72,
                    height: 72,
                    margin: '0 auto 20px',
                    borderRadius: 22,
                    background: 'var(--accent-soft)',
                    border: '1px solid var(--accent-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 32,
                  }}
                >
                  ⚡
                </div>
                <div style={{ fontSize: 17, color: 'var(--text)', fontWeight: 700, marginBottom: 8 }}>
                  Remplis ton profil
                </div>
                <div style={{ fontSize: 14, color: 'var(--muted)', maxWidth: 240, fontWeight: 500, lineHeight: 1.5 }}>
                  Puis clique sur « Calculer » pour voir tes macros
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
