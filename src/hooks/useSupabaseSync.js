import { useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase.js'
import useNutriStore from '../store/useNutriStore.js'
import useAuthStore from '../store/useAuthStore.js'

// Load user data from Supabase and hydrate the Zustand store
export async function loadUserData(userId) {
  const { data, error } = await supabase
    .from('user_data')
    .select('data')
    .eq('id', userId)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error loading user data:', error)
    return
  }

  if (data?.data) {
    const store = useNutriStore.getState()
    const saved = data.data
    if (saved.profile) store.setProfile(saved.profile)
    if (saved.results) store.setResults(saved.results)
    if (saved.foods) store.setFoods(saved.foods)
    if (saved.planPrefs) store.setPlanPrefs(saved.planPrefs)
    if (saved.analysis !== undefined) store.setAnalysis(saved.analysis)
    if (saved.weekPlan !== undefined) store.setWeekPlan(saved.weekPlan)
    if (saved.assistantMessages) store.setAssistantMessages(saved.assistantMessages)
  }
}

// Save current store state to Supabase
export async function saveUserData(userId) {
  const { profile, results, foods, planPrefs, analysis, weekPlan, assistantMessages } =
    useNutriStore.getState()

  const { error } = await supabase.from('user_data').upsert(
    {
      id: userId,
      data: { profile, results, foods, planPrefs, analysis, weekPlan, assistantMessages },
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' }
  )

  if (error) console.error('Error saving user data:', error)
}

// Hook: auto-sync store to Supabase on changes (debounced 2s)
export function useSupabaseSync() {
  const user = useAuthStore((s) => s.user)
  const timerRef = useRef(null)

  useEffect(() => {
    if (!user) return

    const unsub = useNutriStore.subscribe(() => {
      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => saveUserData(user.id), 2000)
    })

    return () => {
      unsub()
      clearTimeout(timerRef.current)
    }
  }, [user])
}
