import { NavLink, useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/useAuthStore.js'

const NAV = [
  { to: '/app', icon: '⚡', label: 'Calcul calorique' },
  { to: '/app/plan', icon: '📋', label: 'Plan alimentaire' },
  { to: '/app/assistant', icon: '🤖', label: 'Coach IA' },
  { to: '/app/export', icon: '📥', label: 'Export CSV' },
]

export default function Sidebar({ isMobile = false }) {
  const signOut = useAuthStore((s) => s.signOut)
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  return (
    <aside
      style={{
        width: isMobile ? '100%' : 248,
        minHeight: isMobile ? 'auto' : '100vh',
        background: 'var(--card)',
        boxShadow: 'var(--shadow-soft)',
        display: 'flex',
        flexDirection: isMobile ? 'row' : 'column',
        padding: isMobile ? '8px 10px' : '28px 0',
        position: isMobile ? 'sticky' : 'fixed',
        top: 0,
        left: isMobile ? 'auto' : 0,
        zIndex: 10,
        borderRadius: isMobile ? 0 : '0 28px 28px 0',
        border: '1px solid var(--line)',
        borderLeft: isMobile ? '1px solid var(--line)' : 'none',
        borderRight: isMobile ? '1px solid var(--line)' : '1px solid var(--line)',
      }}
    >
      <div
        style={{
          padding: isMobile ? '2px 8px 2px 2px' : '0 22px 28px',
          borderBottom: isMobile ? 'none' : '1px solid var(--line)',
          borderRight: isMobile ? '1px solid var(--line)' : 'none',
          marginRight: isMobile ? 8 : 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 14 }}>
          <div
            style={{
              width: isMobile ? 34 : 48,
              height: isMobile ? 34 : 48,
              borderRadius: isMobile ? 10 : 16,
              background: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: isMobile ? 16 : 22,
              boxShadow: '0 6px 18px rgba(255, 122, 0, 0.35)',
            }}
          >
            🥗
          </div>
          <div style={{ display: isMobile ? 'none' : 'block' }}>
            <div style={{ fontWeight: 800, fontSize: 17, color: 'var(--text)', letterSpacing: '-0.02em' }}>
              NutriCalc
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500, marginTop: 2 }}>
              Plan IA personnalisé
            </div>
          </div>
        </div>
      </div>

      <nav
        style={{
          padding: isMobile ? 0 : '20px 14px',
          flex: 1,
          display: isMobile ? 'flex' : 'block',
          gap: isMobile ? 8 : 0,
          overflowX: isMobile ? 'auto' : 'visible',
          scrollbarWidth: 'none',
        }}
      >
        {NAV.map(({ to, icon, label }) => (
          <NavLink key={to} to={to} end={to === '/app'} style={{ textDecoration: 'none' }}>
            {({ isActive }) => (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: isMobile ? 6 : 12,
                  padding: isMobile ? '8px 10px' : '14px 16px',
                  borderRadius: isMobile ? 9999 : 18,
                  marginBottom: isMobile ? 0 : 6,
                  background: isActive ? 'var(--accent-soft)' : 'transparent',
                  color: isActive ? 'var(--accent)' : 'var(--muted)',
                  fontSize: isMobile ? 12 : 14,
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'background 0.2s ease, color 0.2s ease',
                  border: isActive ? '1px solid var(--accent-border)' : '1px solid transparent',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                <span style={{ fontSize: isMobile ? 14 : 18, lineHeight: 1 }}>{icon}</span>
                {label}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {!isMobile && (
        <div style={{ padding: '18px 22px', borderTop: '1px solid var(--line)' }}>
          {user && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 500, marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.email}
              </div>
              <button
                onClick={async () => { await signOut(); navigate('/') }}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 10,
                  border: '1px solid var(--line)',
                  background: 'transparent',
                  color: 'var(--muted)',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'background 0.2s, color 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent-soft)'; e.currentTarget.style.color = 'var(--accent)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--muted)' }}
              >
                Se déconnecter
              </button>
            </div>
          )}
          <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 500 }}>
            NutriCalc © 2025
          </div>
        </div>
      )}
    </aside>
  )
}
