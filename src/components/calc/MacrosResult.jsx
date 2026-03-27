import useNutriStore from '../../store/useNutriStore.js'
import { GOAL_LABELS } from '../../constants/nutrition.js'

function MacroBox({ label, value, unit, color, bgColor }) {
  return (
    <div
      style={{
        background: bgColor || 'var(--surface-input)',
        border: '1px solid var(--line)',
        borderRadius: 20,
        padding: '18px 14px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          fontSize: 10,
          color: 'var(--muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          marginBottom: 10,
          fontWeight: 700,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color: color || 'var(--text)', fontFamily: '"DM Mono", monospace', lineHeight: 1 }}>
        {value ?? '—'}
      </div>
      {unit && (
        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6, fontWeight: 500 }}>{unit}</div>
      )}
    </div>
  )
}

function CalTarget({ label, value, isHighlighted }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 18px',
        borderRadius: 9999,
        background: isHighlighted ? 'var(--accent-soft)' : 'var(--surface-input)',
        border: `1px solid ${isHighlighted ? 'var(--accent-border)' : 'var(--line)'}`,
        marginBottom: 8,
      }}
    >
      <span
        style={{
          fontSize: 13,
          color: isHighlighted ? 'var(--accent)' : 'var(--muted)',
          fontWeight: isHighlighted ? 700 : 500,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: '"DM Mono", monospace',
          fontSize: 15,
          fontWeight: 700,
          color: isHighlighted ? 'var(--accent)' : 'var(--text)',
        }}
      >
        {value} kcal
      </span>
    </div>
  )
}

export default function MacrosResult() {
  const { results, profile } = useNutriStore()
  if (!results.tdee) return null

  const goalLabel = GOAL_LABELS[profile.goal] || profile.goal

  const note = (() => {
    const g = profile.goal
    const p = results.prot,
      c = results.carbs,
      f = results.fat
    if (g === 'seche')
      return `En sèche, tu vises un déficit de 250 kcal. Les protéines sont élevées (${p}g) pour protéger ta masse musculaire. Les glucides (${c}g) sont limités mais suffisants pour tes entraînements.`
    if (g === 'masse')
      return `En prise de masse, tu manges 250 kcal au-dessus de ta maintenance. Les protéines (${p}g) permettent la synthèse musculaire, les glucides (${c}g) alimentent tes entraînements intensifs.`
    return `En maintien, tu consommes exactement tes besoins énergétiques. Tes macros : ${p}g de protéines, ${c}g de glucides, ${f}g de lipides garantissent un équilibre optimal.`
  })()

  return (
    <div>
      <div
        style={{
          textAlign: 'center',
          padding: '32px 22px',
          background: 'linear-gradient(180deg, #FFF8F0 0%, #FFFFFF 100%)',
          borderRadius: 22,
          border: '1px solid var(--line)',
          marginBottom: 22,
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.8)',
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: 'var(--muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.14em',
            marginBottom: 10,
            fontWeight: 700,
          }}
        >
          Dépense totale journalière
        </div>
        <div
          style={{
            fontSize: 56,
            fontWeight: 800,
            color: 'var(--accent)',
            fontFamily: '"DM Mono", monospace',
            lineHeight: 1,
            letterSpacing: '-0.03em',
          }}
        >
          {results.tdee}
        </div>
        <div style={{ fontSize: 15, color: 'var(--muted)', marginTop: 8, fontWeight: 500 }}>kcal / jour</div>
        <div style={{ marginTop: 12, fontSize: 13, color: 'var(--muted)', fontWeight: 500 }}>
          BMR :{' '}
          <span style={{ fontFamily: '"DM Mono", monospace', color: 'var(--text)', fontWeight: 700 }}>{results.bmr} kcal</span>
        </div>
      </div>

      <div style={{ marginBottom: 22 }}>
        <div
          style={{
            fontSize: 11,
            color: 'var(--muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            marginBottom: 12,
            fontWeight: 700,
          }}
        >
          Cibles caloriques
        </div>
        <CalTarget label="🔥 Sèche (−250)" value={results.cut} isHighlighted={profile.goal === 'seche'} />
        <CalTarget label="⚖️ Maintien" value={results.maintain} isHighlighted={profile.goal === 'maintien'} />
        <CalTarget label="💪 Prise de masse (+250)" value={results.bulk} isHighlighted={profile.goal === 'masse'} />
      </div>

      <div style={{ marginBottom: 22 }}>
        <div
          style={{
            fontSize: 11,
            color: 'var(--muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            marginBottom: 12,
            fontWeight: 700,
          }}
        >
          Macros pour {goalLabel}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          <MacroBox label="Calories" value={results.targetCalories} unit="kcal" color="#E65100" bgColor="#FFF3E0" />
          <MacroBox label="Protéines" value={`${results.prot}g`} unit={`${results.prot * 4} kcal`} color="#2E7D32" bgColor="#E8F5E9" />
          <MacroBox label="Glucides" value={`${results.carbs}g`} unit={`${results.carbs * 4} kcal`} color="#1565C0" bgColor="#E3F2FD" />
          <MacroBox label="Lipides" value={`${results.fat}g`} unit={`${results.fat * 9} kcal`} color="#6A1B9A" bgColor="#F3E5F5" />
        </div>
      </div>

      <div
        style={{
          padding: '16px 18px',
          borderRadius: 20,
          background: 'var(--accent-soft)',
          border: '1px solid var(--accent-border)',
          fontSize: 13,
          color: 'var(--muted)',
          lineHeight: 1.65,
          fontWeight: 500,
        }}
      >
        💡 {note}
      </div>
    </div>
  )
}
