import { NavLink } from 'react-router-dom'

const NAV = [
  { to: '/', icon: '⚡', label: 'Calcul calorique' },
  { to: '/plan', icon: '📋', label: 'Plan alimentaire' },
  { to: '/export', icon: '📥', label: 'Export CSV' },
]

export default function Sidebar() {
  return (
    <aside
      style={{
        width: 248,
        minHeight: '100vh',
        background: 'var(--card)',
        boxShadow: 'var(--shadow-soft)',
        display: 'flex',
        flexDirection: 'column',
        padding: '28px 0',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 10,
        borderRadius: '0 28px 28px 0',
        border: '1px solid var(--line)',
        borderLeft: 'none',
      }}
    >
      <div
        style={{
          padding: '0 22px 28px',
          borderBottom: '1px solid var(--line)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 16,
              background: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
              boxShadow: '0 6px 18px rgba(255, 122, 0, 0.35)',
            }}
          >
            🥗
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 17, color: 'var(--text)', letterSpacing: '-0.02em' }}>
              NutriCalc
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500, marginTop: 2 }}>
              Plan IA personnalisé
            </div>
          </div>
        </div>
      </div>

      <nav style={{ padding: '20px 14px', flex: 1 }}>
        {NAV.map(({ to, icon, label }) => (
          <NavLink key={to} to={to} end={to === '/'} style={{ textDecoration: 'none' }}>
            {({ isActive }) => (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '14px 16px',
                  borderRadius: 18,
                  marginBottom: 6,
                  background: isActive ? 'var(--accent-soft)' : 'transparent',
                  color: isActive ? 'var(--accent)' : 'var(--muted)',
                  fontSize: 14,
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'background 0.2s ease, color 0.2s ease',
                  border: isActive ? '1px solid var(--accent-border)' : '1px solid transparent',
                }}
              >
                <span style={{ fontSize: 18, lineHeight: 1 }}>{icon}</span>
                {label}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      <div
        style={{
          padding: '18px 22px',
          borderTop: '1px solid var(--line)',
        }}
      >
        <div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.6, fontWeight: 500 }}>
          Propulsé par Claude AI
          <br />
          <span style={{ color: 'var(--accent)', fontFamily: '"DM Mono", monospace', fontWeight: 600 }}>
            claude-sonnet-4
          </span>
        </div>
      </div>
    </aside>
  )
}
