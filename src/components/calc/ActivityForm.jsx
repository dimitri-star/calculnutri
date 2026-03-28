import useNutriStore from '../../store/useNutriStore.js'
import { JOB_LABELS, STEPS_LABELS, TRAINING_LABELS, SPORT_LABELS } from '../../constants/nutrition.js'

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

const textareaStyle = {
  width: '100%',
  padding: '14px 18px',
  borderRadius: 22,
  border: '1px solid var(--line)',
  background: 'var(--surface-input)',
  color: 'var(--text)',
  fontSize: 14,
  fontWeight: 500,
  fontFamily: 'inherit',
  outline: 'none',
  resize: 'vertical',
  minHeight: 88,
  lineHeight: 1.55,
}

const labelStyle = {
  display: 'block',
  fontSize: 13,
  color: 'var(--muted)',
  marginBottom: 8,
  fontWeight: 600,
}

const hintStyle = {
  fontSize: 12,
  color: 'var(--muted)',
  marginTop: 8,
  lineHeight: 1.45,
  fontWeight: 500,
}

const fieldStyle = { marginBottom: 22 }

function chip(mode, value) {
  const active = mode === value
  return {
    padding: '8px 16px',
    borderRadius: 9999,
    fontSize: 12,
    fontWeight: 700,
    border: '1px solid',
    borderColor: active ? 'var(--accent-border)' : 'var(--line)',
    background: active ? 'var(--accent-soft)' : 'var(--card)',
    color: active ? 'var(--accent)' : 'var(--muted)',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'all 0.15s',
  }
}

function ModeRow({ leftLabel, rightLabel, mode, onMode }) {
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
      <button type="button" aria-pressed={mode === 'list'} style={chip(mode, 'list')} onClick={() => onMode('list')}>
        {leftLabel}
      </button>
      <button type="button" aria-pressed={mode === 'custom'} style={chip(mode, 'custom')} onClick={() => onMode('custom')}>
        {rightLabel}
      </button>
    </div>
  )
}

export default function ActivityForm() {
  const { profile, setProfile } = useNutriStore()
  const set = (key) => (e) => setProfile({ [key]: e.target.value })

  const jobMode = profile.jobMode === 'custom' ? 'custom' : 'list'
  const stepsMode = profile.stepsMode === 'custom' ? 'custom' : 'list'
  const sportMode = profile.sportMode === 'custom' ? 'custom' : 'list'

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
        Activité physique
      </h3>

      <div style={fieldStyle}>
        <label style={labelStyle}>Type de travail</label>
        <ModeRow leftLabel="Choix rapide" rightLabel="Réponse personnalisée" mode={jobMode} onMode={(m) => setProfile({ jobMode: m })} />
        {jobMode === 'list' ? (
          <select style={{ ...inputStyle, cursor: 'pointer' }} value={profile.job} onChange={set('job')}>
            {Object.entries(JOB_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        ) : (
          <textarea
            style={textareaStyle}
            value={profile.jobFreeText}
            onChange={(e) => setProfile({ jobFreeText: e.target.value })}
            placeholder="Ex: télétravail 3j/semaine assis, 2j terrain debout 5h…"
            rows={3}
          />
        )}
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Pas quotidiens</label>
        <ModeRow leftLabel="Choix rapide" rightLabel="Réponse personnalisée" mode={stepsMode} onMode={(m) => setProfile({ stepsMode: m })} />
        {stepsMode === 'list' ? (
          <select style={{ ...inputStyle, cursor: 'pointer' }} value={profile.steps} onChange={set('steps')}>
            {Object.entries(STEPS_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        ) : (
          <textarea
            style={textareaStyle}
            value={profile.stepsFreeText}
            onChange={(e) => setProfile({ stepsFreeText: e.target.value })}
            placeholder="Ex: environ 12k pas/jour en semaine, 5k le weekend…"
            rows={2}
          />
        )}
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Séances sport / semaine</label>
        <select style={{ ...inputStyle, cursor: 'pointer' }} value={profile.training} onChange={set('training')}>
          {Object.entries(TRAINING_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Sport / entraînement</label>
        <ModeRow leftLabel="Choix rapide" rightLabel="Réponse personnalisée" mode={sportMode} onMode={(m) => setProfile({ sportMode: m })} />
        {sportMode === 'list' ? (
          <select style={{ ...inputStyle, cursor: 'pointer' }} value={profile.sportType} onChange={set('sportType')}>
            {Object.entries(SPORT_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        ) : (
          <textarea
            style={textareaStyle}
            value={profile.sportFreeText}
            onChange={(e) => setProfile({ sportFreeText: e.target.value })}
            placeholder="Ex: musculation split PPL 1h15, cardio léger 20min après séance…"
            rows={3}
          />
        )}
      </div>
    </div>
  )
}
