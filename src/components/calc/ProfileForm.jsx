import useNutriStore from '../../store/useNutriStore.js'

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
const labelStyle = {
  display: 'block',
  fontSize: 13,
  color: 'var(--muted)',
  marginBottom: 8,
  fontWeight: 600,
}
const fieldStyle = { marginBottom: 18 }

export default function ProfileForm() {
  const { profile, setProfile } = useNutriStore()
  const set = (key) => (e) => setProfile({ [key]: e.target.value })

  return (
    <div>
      <h3
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: 'var(--muted)',
          marginBottom: 18,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
        }}
      >
        Profil
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div style={fieldStyle}>
          <label style={labelStyle}>Âge</label>
          <input type="number" style={inputStyle} value={profile.age} onChange={set('age')} placeholder="25" min="10" max="100" />
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Poids (kg)</label>
          <input type="number" style={inputStyle} value={profile.weight} onChange={set('weight')} placeholder="75" step="0.1" min="30" max="300" />
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Taille (cm)</label>
          <input type="number" style={inputStyle} value={profile.height} onChange={set('height')} placeholder="175" min="100" max="250" />
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Sexe</label>
          <select style={{ ...inputStyle, cursor: 'pointer' }} value={profile.sex} onChange={set('sex')}>
            <option value="homme">Homme</option>
            <option value="femme">Femme</option>
          </select>
        </div>
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Objectif</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          {[['seche', '🔥 Sèche'], ['maintien', '⚖️ Maintien'], ['masse', '💪 Masse']].map(([val, label]) => (
            <button
              key={val}
              type="button"
              onClick={() => setProfile({ goal: val })}
              style={{
                padding: '12px 10px',
                borderRadius: 18,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                border: '1px solid',
                borderColor: profile.goal === val ? 'var(--accent-border)' : 'var(--line)',
                background: profile.goal === val ? 'var(--accent-soft)' : 'var(--surface-input)',
                color: profile.goal === val ? 'var(--accent)' : 'var(--muted)',
                transition: 'all 0.15s',
                fontFamily: 'inherit',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {profile.goal !== 'maintien' && (
        <div style={{ marginBottom: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <label style={labelStyle}>
              {profile.goal === 'seche' ? '🔥 Déficit calorique' : '💪 Surplus calorique'}
            </label>
            <span style={{
              fontFamily: '"DM Mono", monospace', fontSize: 13, fontWeight: 700,
              color: 'var(--accent)',
              background: 'var(--accent-soft)', border: '1px solid var(--accent-border)',
              padding: '3px 10px', borderRadius: 9999,
            }}>
              {profile.goal === 'seche' ? '−' : '+'}{profile.delta ?? 250} kcal/j
            </span>
          </div>

          <input
            type="range"
            min={100} max={700} step={25}
            value={profile.delta ?? 250}
            onChange={(e) => setProfile({ delta: Number(e.target.value) })}
            style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer' }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted)', fontWeight: 600, marginTop: 4 }}>
            <span>Doux (100)</span>
            <span>Recommandé (250)</span>
            <span>Agressif (700)</span>
          </div>

          <div style={{
            marginTop: 10, padding: '10px 14px', borderRadius: 12,
            background: (profile.delta ?? 250) > 500 ? 'rgba(229,57,53,0.08)' : 'var(--surface-input)',
            border: `1px solid ${(profile.delta ?? 250) > 500 ? 'rgba(229,57,53,0.25)' : 'var(--line)'}`,
            fontSize: 12, fontWeight: 600,
            color: (profile.delta ?? 250) > 500 ? '#C62828' : (profile.delta ?? 250) > 350 ? '#E65100' : '#2E7D32',
          }}>
            {(profile.delta ?? 250) <= 200 && '✅ Déficit doux — préserve bien le muscle'}
            {(profile.delta ?? 250) > 200 && (profile.delta ?? 250) <= 350 && '✅ Déficit optimal — meilleur ratio perte gras / muscle'}
            {(profile.delta ?? 250) > 350 && (profile.delta ?? 250) <= 500 && '⚠️ Déficit modéré — augmente légèrement le catabolisme'}
            {(profile.delta ?? 250) > 500 && '🚨 Déficit élevé — risque de perte musculaire, augmente les protéines'}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
            <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>Saisie manuelle :</span>
            <input
              type="number" min={100} max={700} step={25}
              value={profile.delta ?? 250}
              onChange={(e) => {
                const v = Math.min(700, Math.max(100, Number(e.target.value)))
                setProfile({ delta: v })
              }}
              style={{
                width: 80, padding: '6px 10px', borderRadius: 9999,
                border: '1px solid var(--line)', background: 'var(--surface-input)',
                color: 'var(--text)', fontSize: 13, fontWeight: 600,
                fontFamily: '"DM Mono", monospace', outline: 'none',
              }}
            />
            <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>kcal</span>
          </div>
        </div>
      )}
    </div>
  )
}
