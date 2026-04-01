import useNutriStore from '../store/useNutriStore.js'
import { generateCSV } from '../lib/export.js'
import { DAYS, GOAL_LABELS } from '../constants/nutrition.js'
import useIsMobile from '../hooks/useIsMobile.js'

function exportPreviewBadgeStyle(nom) {
  const n = (nom || '').toLowerCase()
  if (n.includes('déjeuner') && !n.includes('petit')) return { bg: '#E8F5E9', text: '#2E7D32' }
  if (n.includes('petit')) return { bg: '#FFF8E1', text: '#F57C00' }
  if (n.includes('dîner') || n.includes('soir')) return { bg: '#FFF3E0', text: '#E65100' }
  return { bg: '#E3F2FD', text: '#1565C0' }
}
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'

function StatBadge({ label, value, color, bg }) {
  return (
    <div
      style={{
        background: bg || 'var(--surface-input)',
        border: '1px solid var(--line)',
        borderRadius: 20,
        padding: '16px 14px',
        textAlign: 'center',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6)',
      }}
    >
      <div
        style={{
          fontSize: 10,
          color: 'var(--muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          marginBottom: 8,
          fontWeight: 700,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 20, fontWeight: 800, fontFamily: '"DM Mono", monospace', color: color || 'var(--text)', lineHeight: 1.2 }}>
        {value}
      </div>
    </div>
  )
}

export default function ExportPage() {
  const { profile, results, weekPlan } = useNutriStore()
  const isMobile = useIsMobile()
  const hasData = weekPlan && results.tdee

  const pageIntro = (
    <>
      <h1 style={{ fontSize: isMobile ? 22 : 28, fontWeight: 800, color: 'var(--text)', marginBottom: 6, letterSpacing: '-0.02em' }}>Export CSV</h1>
      {!isMobile && <p style={{ fontSize: 15, color: 'var(--muted)', fontWeight: 500, lineHeight: 1.55 }}>Exporte ton plan pour l&apos;importer dans Google Sheets.</p>}
    </>
  )

  if (!hasData) {
    return (
      <div style={{ maxWidth: 720 }}>
        <div style={{ marginBottom: isMobile ? 20 : 32 }}>{pageIntro}</div>
        <Card style={{ textAlign: 'center', padding: '52px 28px' }}>
          <div
            style={{
              width: 80,
              height: 80,
              margin: '0 auto 20px',
              borderRadius: 24,
              background: 'var(--accent-soft)',
              border: '1px solid var(--accent-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 36,
            }}
          >
            📥
          </div>
          <div style={{ fontSize: 17, color: 'var(--text)', fontWeight: 700, marginBottom: 8 }}>Aucun plan généré</div>
          <div style={{ fontSize: 14, color: 'var(--muted)', fontWeight: 500 }}>Génère d&apos;abord ton plan alimentaire sur la page précédente.</div>
        </Card>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 840 }}>
      <div style={{ marginBottom: isMobile ? 16 : 32 }}>{pageIntro}</div>

      <Card style={{ marginBottom: 16 }}>
        <h3
          style={{
            fontSize: 11,
            fontWeight: 800,
            color: 'var(--muted)',
            marginBottom: 14,
            textTransform: 'uppercase',
            letterSpacing: '0.14em',
          }}
        >
          Récapitulatif
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: 10, marginBottom: 14 }}>
          <StatBadge label="Objectif" value={GOAL_LABELS[profile.goal] || profile.goal} color="#E65100" bg="#FFF3E0" />
          <StatBadge label="Calories" value={`${results.targetCalories} kcal`} color="var(--accent)" bg="#FFF8F0" />
          <StatBadge label="Protéines" value={`${results.prot}g`} color="#2E7D32" bg="#E8F5E9" />
          <StatBadge label="Glucides" value={`${results.carbs}g`} color="#1565C0" bg="#E3F2FD" />
        </div>
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 16,
            background: 'var(--surface-input)',
            border: '1px solid var(--line)',
            fontSize: 12,
            color: 'var(--muted)',
            fontWeight: 500,
            display: 'flex',
            gap: isMobile ? 10 : 18,
            flexWrap: 'wrap',
          }}
        >
          <span>👤 {profile.age} ans, {profile.weight} kg, {profile.height} cm</span>
          <span>⚡ TDEE : <strong style={{ color: 'var(--text)' }}>{results.tdee} kcal</strong></span>
          <span>BMR : <strong style={{ color: 'var(--text)' }}>{results.bmr} kcal</strong></span>
        </div>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <h3
          style={{
            fontSize: 11,
            fontWeight: 800,
            color: 'var(--muted)',
            marginBottom: 14,
            textTransform: 'uppercase',
            letterSpacing: '0.14em',
          }}
        >
          Aperçu du plan
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {DAYS.map((day) => {
            const dayData = weekPlan[day] || {}
            const repas = Array.isArray(dayData.repas) ? dayData.repas : []
            const totalCal = repas.reduce((sum, r) => sum + (r.calories ?? 0), 0)
            return (
              <div
                key={day}
                style={{
                  padding: isMobile ? '12px 14px' : '14px 18px',
                  borderRadius: 16,
                  background: 'var(--surface-input)',
                  border: '1px solid var(--line)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontWeight: 800, fontSize: 13, color: 'var(--text)' }}>{day}</span>
                  <span style={{ fontFamily: '"DM Mono", monospace', fontSize: 12, color: 'var(--accent)', fontWeight: 800 }}>
                    {totalCal} kcal
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {repas.map((r) => {
                    const mc = exportPreviewBadgeStyle(r.nom)
                    return (
                      <span
                        key={r.id || r.nom}
                        style={{
                          padding: '4px 10px',
                          borderRadius: 9999,
                          fontSize: 11,
                          fontWeight: 700,
                          background: mc.bg || 'var(--card)',
                          color: mc.text || 'var(--muted)',
                          border: '1px solid var(--line)',
                        }}
                      >
                        {r.nom || 'Repas'}
                      </span>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      <Card>
        <h3
          style={{
            fontSize: 11,
            fontWeight: 800,
            color: 'var(--muted)',
            marginBottom: 18,
            textTransform: 'uppercase',
            letterSpacing: '0.14em',
          }}
        >
          Actions
        </h3>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <Button onClick={() => generateCSV(weekPlan)} style={{ flex: '1 1 200px', justifyContent: 'center', padding: '14px 22px', borderRadius: 18 }}>
            📥 Télécharger le CSV
          </Button>
          <Button variant="secondary" onClick={() => window.print()} style={{ flex: '1 1 200px', justifyContent: 'center', padding: '14px 22px', borderRadius: 18 }}>
            🖨️ Imprimer
          </Button>
        </div>
        <p style={{ marginTop: 16, fontSize: 13, color: 'var(--muted)', fontWeight: 500, lineHeight: 1.55 }}>
          Le CSV inclut toutes les données nutritionnelles (Jour, Repas, Aliments, Macros, Calories) + un total par jour. Compatible Google Sheets.
        </p>
      </Card>
    </div>
  )
}
