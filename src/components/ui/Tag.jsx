function tintFromHex(hex, alpha = 0.14) {
  if (!hex || !hex.startsWith('#')) return `rgba(255, 122, 0, ${alpha})`
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

export default function Tag({ label, onRemove, color = 'var(--accent)' }) {
  const isVar = typeof color === 'string' && color.startsWith('var(')
  const bg = isVar ? 'var(--accent-soft)' : tintFromHex(color, 0.12)
  const border = isVar ? 'var(--accent-border)' : `${color}33`

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 12px',
        borderRadius: 9999,
        fontSize: 13,
        fontWeight: 600,
        background: bg,
        color,
        border: `1px solid ${border}`,
      }}
    >
      {label}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'inherit',
            fontSize: 16,
            lineHeight: 1,
            padding: 0,
            opacity: 0.65,
          }}
        >
          ×
        </button>
      )}
    </span>
  )
}
