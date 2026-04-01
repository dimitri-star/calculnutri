import { useEffect, useState } from 'react'
import Sidebar from './Sidebar.jsx'

export default function Layout({ children }) {
  const [isMobile, setIsMobile] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < 768 : false))

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        minHeight: '100vh',
        background: 'var(--page-bg)',
      }}
    >
      <Sidebar isMobile={isMobile} />
      <main
        style={{
          marginLeft: isMobile ? 0 : 248,
          flex: 1,
          padding: isMobile ? '20px 16px 88px' : '36px 44px 48px',
          minHeight: '100vh',
          overflowY: 'auto',
        }}
      >
        {children}
      </main>
    </div>
  )
}
