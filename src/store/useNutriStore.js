import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const DEFAULT_COACH_MESSAGES = [
  {
    role: 'assistant',
    content:
      "Je suis ton coach nutrition NutriCalc : pose-moi n'importe quelle question (timing des repas, protéines, sèche/masse, digestion, récupération, etc.) comme à un expert.\n\nQuand tu auras un plan 7 jours généré dans l'app, tu pourras aussi me demander de réorganiser la semaine (aliments, jours, repas) — j'adapterai en respectant tes objectifs et tes listes d'aliments.",
  },
]

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
        delta: 250,
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

      assistantMessages: DEFAULT_COACH_MESSAGES.map((m) => ({ ...m })),

      setProfile: (profile) => set((s) => ({ profile: { ...s.profile, ...profile } })),
      setResults: (results) => set((s) => ({ results: { ...s.results, ...results } })),
      setFoods: (foods) => set((s) => ({ foods: { ...s.foods, ...foods } })),
      setPlanPrefs: (planPrefs) => set((s) => ({ planPrefs: { ...s.planPrefs, ...planPrefs } })),
      setAnalysis: (analysis) => set({ analysis }),
      setWeekPlan: (weekPlan) => set({ weekPlan }),
      setCurrentDay: (currentDay) => set({ currentDay }),

      setAssistantMessages: (fnOrMessages) =>
        set((s) => ({
          assistantMessages:
            typeof fnOrMessages === 'function' ? fnOrMessages(s.assistantMessages) : fnOrMessages,
        })),
      resetCoachMessages: () => set({ assistantMessages: DEFAULT_COACH_MESSAGES.map((m) => ({ ...m })) }),

      reset: () => set({
        profile: {
          age: '', weight: '', height: '', sex: 'homme', goal: 'maintien',
          job: 'bureau', steps: '5-10k', training: '3', sportType: 'musculation',
          jobMode: 'list', jobFreeText: '',
          stepsMode: 'list', stepsFreeText: '',
          sportMode: 'list', sportFreeText: '',
          trainingFreeText: '',
          delta: 250,
        },
        results: { bmr: null, tdee: null, cut: null, maintain: null, bulk: null, targetCalories: null, prot: null, carbs: null, fat: null },
        foods: { current: [], likes: [], dislikes: [], accepted: [] },
        planPrefs: { budget: null, cookTime: 'moderate', extraInfo: '' },
        analysis: null,
        weekPlan: null,
        currentDay: 'Lundi',
        assistantMessages: DEFAULT_COACH_MESSAGES.map((m) => ({ ...m })),
      }),
    }),
    { name: 'nutri-calc-store' }
  )
)

export default useNutriStore
