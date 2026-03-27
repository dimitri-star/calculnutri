export default function Spinner({ size = 24 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        border: '2px solid rgba(255, 122, 0, 0.2)',
        borderTopColor: 'var(--accent)',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
