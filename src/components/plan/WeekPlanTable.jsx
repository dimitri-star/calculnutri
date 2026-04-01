import { DAYS } from '../../constants/nutrition.js'
import useIsMobile from '../../hooks/useIsMobile.js'

const DAY_SHORT = { Lundi: 'Lun', Mardi: 'Mar', Mercredi: 'Mer', Jeudi: 'Jeu', Vendredi: 'Ven', Samedi: 'Sam', Dimanche: 'Dim' }

function getMealBadgeStyle(nom) {
  const n = (nom || '').toLowerCase()
  if (n.includes('déjeuner') && !n.includes('petit')) return { bg: '#E8F5E9', text: '#2E7D32' }
  if (n.includes('petit')) return { bg: '#FFF8E1', text: '#F57C00' }
  if (n.includes('dîner') || n.includes('soir')) return { bg: '#FFF3E0', text: '#E65100' }
  return { bg: '#E3F2FD', text: '#1565C0' }
}

function MealCard({ r }) {
  const badge = getMealBadgeStyle(r.nom)
  return (
    <div style={{
      background: 'var(--surface-input)',
      border: '1px solid var(--line)',
      borderRadius: 16,
      padding: '12px 14px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{
          padding: '5px 11px', borderRadius: 9999,
          fontSize: 11, fontWeight: 700,
          background: badge.bg, color: badge.text,
        }}>
          {r.nom || 'Repas'}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {r.heure && String(r.heure).trim() && (
            <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>{r.heure}</span>
          )}
          <span style={{ fontFamily: '"DM Mono", monospace', fontSize: 13, color: 'var(--accent)', fontWeight: 800 }}>
            {r.calories} kcal
          </span>
        </div>
      </div>

      <p style={{ fontSize: 12, color: 'var(--text)', lineHeight: 1.55, marginBottom: 10 }}>
        {(r.aliments || []).join(', ')}
      </p>

      <div style={{ display: 'flex', gap: 8 }}>
        {[
          { label: 'P', value: r.proteines, unit: 'g', color: '#2E7D32', bg: '#E8F5E9' },
          { label: 'G', value: r.glucides, unit: 'g', color: '#1565C0', bg: '#E3F2FD' },
          { label: 'L', value: r.lipides, unit: 'g', color: '#6A1B9A', bg: '#F3E5F5' },
        ].map(({ label, value, unit, color, bg }) => (
          <div key={label} style={{
            flex: 1, textAlign: 'center', padding: '6px 4px',
            borderRadius: 10, background: bg, border: '1px solid rgba(0,0,0,0.06)',
          }}>
            <div style={{ fontSize: 9, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>
              {label}
            </div>
            <div style={{ fontFamily: '"DM Mono", monospace', fontSize: 12, fontWeight: 800, color }}>
              {value}{unit}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function WeekPlanTable({ plan, macros, currentDay, onDayChange }) {
  const isMobile = useIsMobile()
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
      {/* Day selector */}
      <div style={{ display: 'flex', gap: isMobile ? 4 : 6, marginBottom: 16, flexWrap: isMobile ? 'nowrap' : 'wrap', overflowX: isMobile ? 'auto' : 'visible', paddingBottom: isMobile ? 4 : 0, scrollbarWidth: 'none' }}>
        {DAYS.map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => onDayChange(d)}
            style={{
              padding: isMobile ? '7px 10px' : '8px 16px',
              borderRadius: 9999,
              fontSize: isMobile ? 12 : 13,
              fontWeight: 700,
              cursor: 'pointer',
              border: '1px solid',
              borderColor: currentDay === d ? 'var(--accent-border)' : 'var(--line)',
              background: currentDay === d ? 'var(--accent-soft)' : 'var(--surface-input)',
              color: currentDay === d ? 'var(--accent)' : 'var(--muted)',
              transition: 'all 0.15s',
              fontFamily: 'inherit',
              flexShrink: 0,
              whiteSpace: 'nowrap',
            }}
          >
            {isMobile ? DAY_SHORT[d] ?? d : d}
          </button>
        ))}
      </div>

      {/* Mobile: cards layout */}
      {isMobile ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {repas.map((r) => (
            <MealCard key={r.id || r.nom} r={r} />
          ))}

          {/* Total row */}
          {repas.length > 0 && (
            <div style={{
              background: 'var(--surface-input)',
              border: '1px solid var(--line)',
              borderRadius: 16,
              padding: '12px 14px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontWeight: 800, fontSize: 12, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total journée</span>
                <span style={{ fontFamily: '"DM Mono", monospace', fontSize: 14, color: 'var(--accent)', fontWeight: 800 }}>
                  {total.cals} kcal
                </span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { label: 'Prot.', value: total.prot, color: '#2E7D32', bg: '#E8F5E9' },
                  { label: 'Gluc.', value: total.carbs, color: '#1565C0', bg: '#E3F2FD' },
                  { label: 'Lip.', value: total.fat, color: '#6A1B9A', bg: '#F3E5F5' },
                ].map(({ label, value, color, bg }) => (
                  <div key={label} style={{ flex: 1, textAlign: 'center', padding: '6px 4px', borderRadius: 10, background: bg }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{label}</div>
                    <div style={{ fontFamily: '"DM Mono", monospace', fontSize: 12, fontWeight: 800, color }}>{value}g</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Desktop: table layout */
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
                      color: 'var(--muted)', fontWeight: 700,
                      fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em',
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
                      <span style={{
                        display: 'inline-block', padding: '6px 12px', borderRadius: 9999,
                        fontSize: 11, fontWeight: 700, background: badge.bg, color: badge.text,
                      }}>
                        {r.nom || 'Repas'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 10px', color: 'var(--muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                      {r.heure && String(r.heure).trim() ? r.heure : '—'}
                    </td>
                    <td style={{ padding: '10px 10px', color: 'var(--text)', lineHeight: 1.5 }}>
                      {(r.aliments || []).join(', ')}
                    </td>
                    <td style={{ padding: '10px 10px', textAlign: 'right', fontFamily: '"DM Mono", monospace', color: '#2E7D32', fontWeight: 600 }}>{r.proteines}g</td>
                    <td style={{ padding: '10px 10px', textAlign: 'right', fontFamily: '"DM Mono", monospace', color: '#1565C0', fontWeight: 600 }}>{r.glucides}g</td>
                    <td style={{ padding: '10px 10px', textAlign: 'right', fontFamily: '"DM Mono", monospace', color: '#6A1B9A', fontWeight: 600 }}>{r.lipides}g</td>
                    <td style={{ padding: '10px 10px', textAlign: 'right', fontFamily: '"DM Mono", monospace', color: 'var(--accent)', fontWeight: 700 }}>{r.calories}</td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr style={{ background: 'var(--surface-input)', borderTop: '2px solid var(--line)' }}>
                <td colSpan={3} style={{ padding: '10px 10px', fontWeight: 800, color: 'var(--text)', fontSize: 12 }}>TOTAL</td>
                <td style={{ padding: '10px 10px', textAlign: 'right', fontFamily: '"DM Mono", monospace', color: '#2E7D32', fontWeight: 800 }}>{total.prot}g</td>
                <td style={{ padding: '10px 10px', textAlign: 'right', fontFamily: '"DM Mono", monospace', color: '#1565C0', fontWeight: 800 }}>{total.carbs}g</td>
                <td style={{ padding: '10px 10px', textAlign: 'right', fontFamily: '"DM Mono", monospace', color: '#6A1B9A', fontWeight: 800 }}>{total.fat}g</td>
                <td style={{ padding: '10px 10px', textAlign: 'right', fontFamily: '"DM Mono", monospace', color: 'var(--accent)', fontWeight: 800 }}>{total.cals}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

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
            <div key={i} className="day-warning">{w}</div>
          ))}
        </div>
      )}
    </div>
  )
}
