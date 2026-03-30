import { DAYS } from '../../constants/nutrition.js'

function getMealBadgeStyle(nom) {
  const n = (nom || '').toLowerCase()
  if (n.includes('déjeuner') && !n.includes('petit')) return { bg: '#E8F5E9', text: '#2E7D32' }
  if (n.includes('petit')) return { bg: '#FFF8E1', text: '#F57C00' }
  if (n.includes('dîner') || n.includes('soir')) return { bg: '#FFF3E0', text: '#E65100' }
  return { bg: '#E3F2FD', text: '#1565C0' }
}

/**
 * @param {{ plan: object, macros: { calories: number, carbs: number }, currentDay: string, onDayChange: (d: string) => void }} props
 */
export default function WeekPlanTable({ plan, macros, currentDay, onDayChange }) {
  const dayData = plan?.[currentDay]
  const repas = dayData?.repas || []

  const total = repas.reduce(
    (acc, r) => ({
      prot: acc.prot + (Number(r.proteines) || 0),
      carbs: acc.carbs + (Number(r.glucides) || 0),
      fat: acc.fat + (Number(r.lipides) || 0),
      cals: acc.cals + (Number(r.calories) || 0),
    }),
    { prot: 0, carbs: 0, fat: 0, cals: 0 },
  )

  const targetCals = macros?.calories ?? 0
  const targetCarbs = macros?.carbs ?? 0

  return (
    <div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {DAYS.map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => onDayChange(d)}
            style={{
              padding: '8px 16px',
              borderRadius: 9999,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              border: '1px solid',
              borderColor: currentDay === d ? 'var(--accent-border)' : 'var(--line)',
              background: currentDay === d ? 'var(--accent-soft)' : 'var(--surface-input)',
              color: currentDay === d ? 'var(--accent)' : 'var(--muted)',
              transition: 'all 0.15s',
              fontFamily: 'inherit',
            }}
          >
            {d}
          </button>
        ))}
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--line)' }}>
              {['Repas', 'Heure', 'Aliments', 'Prot.', 'Gluc.', 'Lip.', 'Kcal'].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: '10px 10px',
                    textAlign: h === 'Repas' || h === 'Aliments' || h === 'Heure' ? 'left' : 'right',
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
            {repas.map((r) => {
              const badge = getMealBadgeStyle(r.nom)
              return (
                <tr key={r.id || r.nom} style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ padding: '10px 10px', minWidth: 110 }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '6px 12px',
                        borderRadius: 9999,
                        fontSize: 11,
                        fontWeight: 700,
                        background: badge.bg,
                        color: badge.text,
                      }}
                    >
                      {r.nom || 'Repas'}
                    </span>
                  </td>
                  <td style={{ padding: '10px 10px', color: 'var(--muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    {r.heure && String(r.heure).trim() ? r.heure : '—'}
                  </td>
                  <td style={{ padding: '10px 10px', color: 'var(--text)', lineHeight: 1.5 }}>
                    {(r.aliments || []).join(', ')}
                  </td>
                  <td style={{ padding: '10px 10px', textAlign: 'right', fontFamily: '"DM Mono", monospace', color: '#2E7D32', fontWeight: 600 }}>
                    {r.proteines}g
                  </td>
                  <td style={{ padding: '10px 10px', textAlign: 'right', fontFamily: '"DM Mono", monospace', color: '#1565C0', fontWeight: 600 }}>
                    {r.glucides}g
                  </td>
                  <td style={{ padding: '10px 10px', textAlign: 'right', fontFamily: '"DM Mono", monospace', color: '#6A1B9A', fontWeight: 600 }}>
                    {r.lipides}g
                  </td>
                  <td style={{ padding: '10px 10px', textAlign: 'right', fontFamily: '"DM Mono", monospace', color: 'var(--accent)', fontWeight: 700 }}>
                    {r.calories}
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr style={{ background: 'var(--surface-input)', borderTop: '2px solid var(--line)' }}>
              <td colSpan={3} style={{ padding: '10px 10px', fontWeight: 800, color: 'var(--text)', fontSize: 12 }}>
                TOTAL
              </td>
              <td style={{ padding: '10px 10px', textAlign: 'right', fontFamily: '"DM Mono", monospace', color: '#2E7D32', fontWeight: 800 }}>
                {total.prot}g
              </td>
              <td style={{ padding: '10px 10px', textAlign: 'right', fontFamily: '"DM Mono", monospace', color: '#1565C0', fontWeight: 800 }}>
                {total.carbs}g
              </td>
              <td style={{ padding: '10px 10px', textAlign: 'right', fontFamily: '"DM Mono", monospace', color: '#6A1B9A', fontWeight: 800 }}>
                {total.fat}g
              </td>
              <td style={{ padding: '10px 10px', textAlign: 'right', fontFamily: '"DM Mono", monospace', color: 'var(--accent)', fontWeight: 800 }}>
                {total.cals}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {targetCals > 0 && Math.abs(total.cals - targetCals) > 50 && (
        <div className="day-warning" style={{ marginTop: 12 }}>
          ⚠️ Calories : {total.cals} kcal vs {targetCals} kcal cible (écart {Math.abs(total.cals - targetCals)} kcal)
        </div>
      )}
      {targetCarbs > 0 && Math.abs(total.carbs - targetCarbs) > 15 && (
        <div className="day-warning" style={{ marginTop: 8 }}>
          ⚠️ Glucides : {total.carbs}g vs {targetCarbs}g cible (écart {Math.abs(total.carbs - targetCarbs)}g)
        </div>
      )}

      {dayData?._warnings?.length > 0 && (
        <div className="day-warnings" style={{ marginTop: 12 }}>
          {dayData._warnings.map((w, i) => (
            <div key={i} className="day-warning">
              {w}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
