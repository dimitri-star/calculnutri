import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout.jsx'
import CalcPage from './pages/CalcPage.jsx'
import PlanPage from './pages/PlanPage.jsx'
import ExportPage from './pages/ExportPage.jsx'
import AssistantPage from './pages/AssistantPage.jsx'
import LandingPage from './pages/LandingPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import ProtectedRoute from './components/auth/ProtectedRoute.jsx'
import useAuthStore from './store/useAuthStore.js'
import { supabase } from './lib/supabase.js'
import { loadUserData } from './hooks/useSupabaseSync.js'
import { useSupabaseSync } from './hooks/useSupabaseSync.js'

function AppRoutes() {
  // Auto-sync store → Supabase whenever data changes
  useSupabaseSync()

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <Layout>
              <CalcPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/plan"
        element={
          <ProtectedRoute>
            <Layout>
              <PlanPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/assistant"
        element={
          <ProtectedRoute>
            <Layout>
              <AssistantPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/export"
        element={
          <ProtectedRoute>
            <Layout>
              <ExportPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      {/* Legacy redirects */}
      <Route path="/plan" element={<Navigate to="/app/plan" replace />} />
      <Route path="/assistant" element={<Navigate to="/app/assistant" replace />} />
      <Route path="/export" element={<Navigate to="/app/export" replace />} />
    </Routes>
  )
}

export default function App() {
  const { setSession, setLoading } = useAuthStore()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        await loadUserData(session.user.id)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      if (event === 'SIGNED_IN' && session?.user) {
        await loadUserData(session.user.id)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [setSession, setLoading])

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
