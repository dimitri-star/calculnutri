import useNutriStore from '../store/useNutriStore.js'
import PlanAssistant from '../components/plan/PlanAssistant.jsx'

export default function AssistantPage() {
  const store = useNutriStore()

  return (
    <div style={{ maxWidth: 1200 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text)', marginBottom: 8, letterSpacing: '-0.02em' }}>
          Coach IA
        </h1>
        <p style={{ fontSize: 15, color: 'var(--muted)', fontWeight: 500, maxWidth: 560, lineHeight: 1.55 }}>
          Conseils nutrition comme avec un expert, et adaptation de ton plan 7 jours quand tu en as un.
        </p>
      </div>

      <PlanAssistant
        layout="page"
        weekPlan={store.weekPlan}
        setWeekPlan={store.setWeekPlan}
        results={store.results}
        foods={store.foods}
        profile={store.profile}
      />
    </div>
  )
}
