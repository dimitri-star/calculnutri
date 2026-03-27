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
    </div>
  )
}
