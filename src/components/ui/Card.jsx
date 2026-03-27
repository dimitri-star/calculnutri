export default function Card({ children, style = {}, className = '' }) {
  return (
    <div
      style={{
        background: 'var(--card)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--radius-card)',
        padding: '26px 28px',
        boxShadow: 'var(--shadow-soft)',
        ...style,
      }}
      className={className}
    >
      {children}
    </div>
  )
}
