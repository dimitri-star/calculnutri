import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout.jsx'
import CalcPage from './pages/CalcPage.jsx'
import PlanPage from './pages/PlanPage.jsx'
import ExportPage from './pages/ExportPage.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<CalcPage />} />
          <Route path="/plan" element={<PlanPage />} />
          <Route path="/export" element={<ExportPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
