import Sidebar from './Sidebar.jsx'

export default function Layout({ children }) {
  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: 'var(--page-bg)',
      }}
    >
      <Sidebar />
      <main
        style={{
          marginLeft: 248,
          flex: 1,
          padding: '36px 44px 48px',
          minHeight: '100vh',
          overflowY: 'auto',
        }}
      >
        {children}
      </main>
    </div>
  )
}
