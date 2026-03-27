export default function Button({ children, onClick, variant = 'primary', disabled = false, style = {} }) {
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '12px 22px',
    borderRadius: 16,
    fontWeight: 600,
    fontSize: 14,
    cursor: disabled ? 'not-allowed' : 'pointer',
    border: 'none',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s',
    fontFamily: 'inherit',
    opacity: disabled ? 0.45 : 1,
  }

  const variants = {
    primary: {
      background: 'var(--accent)',
      color: '#fff',
      boxShadow: '0 4px 14px rgba(255, 122, 0, 0.35)',
    },
    secondary: {
      background: 'var(--ink)',
      color: '#fff',
      boxShadow: '0 4px 14px rgba(26, 26, 26, 0.15)',
    },
    ghost: {
      background: 'var(--card)',
      color: 'var(--muted)',
      border: '1px solid var(--line)',
      boxShadow: 'none',
    },
  }

  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      style={{ ...base, ...variants[variant], ...style }}
      onMouseDown={(e) => !disabled && (e.currentTarget.style.transform = 'scale(0.98)')}
      onMouseUp={(e) => (e.currentTarget.style.transform = '')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = '')}
    >
      {children}
    </button>
  )
}
