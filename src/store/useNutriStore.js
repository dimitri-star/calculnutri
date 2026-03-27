import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useNutriStore = create(
  persist(
    (set) => ({
      profile: {
        age: '',
        weight: '',
        height: '',
        sex: 'homme',
        goal: 'maintien',
        job: 'bureau',
        steps: '5-10k',
        training: '3',
        sportType: 'musculation',
        jobMode: 'list',
        jobFreeText: '',
        stepsMode: 'list',
        stepsFreeText: '',
        sportMode: 'list',
        sportFreeText: '',
        trainingFreeText: '',
      },

      results: {
        bmr: null,
        tdee: null,
        cut: null,
        maintain: null,
        bulk: null,
        targetCalories: null,
        prot: null,
        carbs: null,
        fat: null,
      },

      foods: {
        current: [],
        likes: [],
        dislikes: [],
        accepted: [],
      },

      planPrefs: {
        budget: null,
        cookTime: 'moderate',
        extraInfo: '',
      },

      analysis: null,
      weekPlan: null,
      currentDay: 'Lundi',

      setProfile: (profile) => set((s) => ({ profile: { ...s.profile, ...profile } })),
      setResults: (results) => set((s) => ({ results: { ...s.results, ...results } })),
      setFoods: (foods) => set((s) => ({ foods: { ...s.foods, ...foods } })),
      setPlanPrefs: (planPrefs) => set((s) => ({ planPrefs: { ...s.planPrefs, ...planPrefs } })),
      setAnalysis: (analysis) => set({ analysis }),
      setWeekPlan: (weekPlan) => set({ weekPlan }),
      setCurrentDay: (currentDay) => set({ currentDay }),
      reset: () => set({
        profile: {
          age: '', weight: '', height: '', sex: 'homme', goal: 'maintien',
          job: 'bureau', steps: '5-10k', training: '3', sportType: 'musculation',
          jobMode: 'list', jobFreeText: '',
          stepsMode: 'list', stepsFreeText: '',
          sportMode: 'list', sportFreeText: '',
          trainingFreeText: '',
        },
        results: { bmr: null, tdee: null, cut: null, maintain: null, bulk: null, targetCalories: null, prot: null, carbs: null, fat: null },
        foods: { current: [], likes: [], dislikes: [], accepted: [] },
        planPrefs: { budget: null, cookTime: 'moderate', extraInfo: '' },
        analysis: null,
        weekPlan: null,
        currentDay: 'Lundi',
      }),
    }),
    { name: 'nutri-calc-store' }
  )
)

export default useNutriStore
