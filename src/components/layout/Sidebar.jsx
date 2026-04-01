import { NavLink, useNavigate } from 'react-router-dom'
import { Zap, ClipboardList, Bot, ScanLine, Download } from 'lucide-react'
import useAuthStore from '../../store/useAuthStore.js'

const NAV = [
  { to: '/app', Icon: Zap, label: 'Calcul calorique', short: 'Calcul' },
  { to: '/app/plan', Icon: ClipboardList, label: 'Plan alimentaire', short: 'Plan' },
  { to: '/app/assistant', Icon: Bot, label: 'Coach IA', short: 'Coach' },
  { to: '/app/body', Icon: ScanLine, label: 'Analyse physique', short: 'Physique' },
  { to: '/app/export', Icon: Download, label: 'Export CSV', short: 'Export' },
]

export default function Sidebar({ isMobile = false }) {
  const signOut = useAuthStore((s) => s.signOut)
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()

  // ── Mobile: bottom navigation bar ────────────────────────────────
  if (isMobile) {
    return (
      <nav
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: 'var(--card)',
          borderTop: '1px solid var(--line)',
          display: 'flex',
          alignItems: 'stretch',
          height: 64,
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {NAV.map(({ to, Icon, short }) => (
          <NavLink key={to} to={to} end={to === '/app'} style={{ flex: 1, textDecoration: 'none' }}>
            {({ isActive }) => (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  gap: 3,
                  color: isActive ? 'var(--accent)' : 'var(--muted)',
                  transition: 'color 0.2s',
                  position: 'relative',
                }}
              >
                <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
                <span style={{
                  fontSize: 9,
                  fontWeight: isActive ? 700 : 500,
                  letterSpacing: '0.01em',
                }}>
                  {short}
                </span>
                {isActive && (
                  <span style={{
                    position: 'absolute',
                    bottom: 0,
                    width: 24,
                    height: 3,
                    borderRadius: '3px 3px 0 0',
                    background: 'var(--accent)',
                  }} />
                )}
              </div>
            )}
          </NavLink>
        ))}
      </nav>
    )
  }

  // ── Desktop: fixed left sidebar ───────────────────────────────────
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
      <div style={{ padding: '0 22px 28px', borderBottom: '1px solid var(--line)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 48, height: 48, borderRadius: 16,
              background: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 6px 18px rgba(255, 122, 0, 0.35)',
            }}
          >
            <Zap size={22} color="#fff" strokeWidth={2.5} />
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
        {NAV.map(({ to, Icon, label, short: _short }) => (
          <NavLink key={to} to={to} end={to === '/app'} style={{ textDecoration: 'none' }}>
            {({ isActive }) => (
              <div
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '14px 16px', borderRadius: 18, marginBottom: 6,
                  background: isActive ? 'var(--accent-soft)' : 'transparent',
                  color: isActive ? 'var(--accent)' : 'var(--muted)',
                  fontSize: 14, fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'background 0.2s ease, color 0.2s ease',
                  border: isActive ? '1px solid var(--accent-border)' : '1px solid transparent',
                }}
              >
                <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
                {label}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: '18px 22px', borderTop: '1px solid var(--line)' }}>
        {user && (
          <div style={{ marginBottom: 12 }}>
            <div style={{
              fontSize: 11, color: 'var(--muted)', fontWeight: 500, marginBottom: 8,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {user.email}
            </div>
            <button
              onClick={async () => { await signOut(); navigate('/') }}
              style={{
                display: 'block', width: '100%', padding: '8px 12px',
                borderRadius: 10, border: '1px solid var(--line)',
                background: 'transparent', color: 'var(--muted)',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                textAlign: 'center', transition: 'background 0.2s, color 0.2s',
                fontFamily: 'inherit',
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
    </aside>
  )
}
