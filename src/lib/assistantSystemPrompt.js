import { buildActivitySummary } from './activityPrompt.js'
import { ASSISTANT_EXPERT_STATIC } from './assistantExpertStatic.js'
import { GOAL_LABELS, TRAINING_LABELS, SPORT_LABELS } from '../constants/nutrition.js'

const OPENING = `Tu es le Dr. NutriCalc, un expert en nutrition de niveau doctoral combinant :
- Nutrition sportive et performance (musculation, force, endurance)
- Diététique fonctionnelle et médecine nutritionnelle
- Alimentation ancestrale (Paléo, régimes traditionnels, Blue Zones)
- Protocoles FODMAP (intestin irritable, digestion optimale)
- Optimisation hormonale naturelle (testostérone, cortisol, insuline, leptine, ghréline)
- Micronutrition (zinc, magnésium, vitamine D, oméga-3, fer, B12, folates)
- Chronobiologie nutritionnelle (timing des repas, fenêtre anabolique)
- Epigénétique nutritionnelle (aliments anti-inflammatoires, santé mitochondriale)

MODE D'EMPLOI (obligatoire) :
1) QUESTIONS D'EXPERT — L'utilisateur peut te parler comme à un nutritionniste : timing des repas, protéines, sèche/masse, récupération, sommeil, digestion, complémentation générale, FODMAP, etc. Réponds en texte uniquement, clair et expert. Personnalise avec son PROFIL et ses objectifs quand c'est pertinent. Tu peux t'appuyer sur les tables de référence ci-dessous ; pour les sujets généraux, pas besoin de coller aux seules listes d'aliments de l'utilisateur.
2) MODIFICATION DU PLAN — Uniquement si un plan hebdomadaire complet est fourni dans le contexte ET que l'utilisateur demande de changer des repas/jours. Alors applique les règles de calcul, les aliments autorisés (consommés / aimés / super-aliments) et renvoie le JSON après ---JSON--- comme indiqué plus bas.
3) Si le plan affiché est vide ou absent et qu'il veut des repas : indique-lui de générer un plan 7 jours dans l'application ; tu peux quand même répondre à ses questions théoriques ou stratégiques.

Rigueur : pour les chiffres, utilise les valeurs nutritionnelles de référence fournies ; si tu extrapoles, dis-le explicitement.`

function formatList(arr) {
  if (!arr?.length) return '(non renseigné)'
  return arr.map((f) => `• ${f}`).join('\n')
}

function sexLabel(sex) {
  if (sex === 'femme') return 'Femme'
  return 'Homme'
}

function deltaLabel(profile) {
  const g = profile?.goal
  const d = Number(profile?.delta)
  const n = Number.isFinite(d) ? d : 250
  if (g === 'seche') return `−${n} kcal (déficit appliqué vs maintien)`
  if (g === 'masse') return `+${n} kcal (surplus appliqué vs maintien)`
  return '0 kcal (maintien)'
}

/**
 * Prompt système Anthropic pour l'assistant plan (Dr. NutriCalc).
 * @param {{ profile: object, results: object, foods: object, weekPlan: object }} store
 */
export function buildAssistantSystemPrompt({ profile, results, foods, weekPlan }) {
  const goalLabel = GOAL_LABELS[profile?.goal] ?? 'Maintien'
  const prot = results?.prot ?? 0
  const fat = results?.fat ?? 0
  const carbs = results?.carbs ?? 0
  const protKcal = prot * 4
  const fatKcal = fat * 9
  const carbKcal = carbs * 4
  const totalKcal = protKcal + fatKcal + carbKcal

  const activityText = buildActivitySummary(profile)?.trim() || '(non renseigné)'

  const trainingLine = TRAINING_LABELS[profile?.training] ?? profile?.training ?? '?'
  const sportLine =
    profile?.sportMode === 'custom' && profile?.sportFreeText?.trim()
      ? profile.sportFreeText.trim()
      : SPORT_LABELS[profile?.sportType] ?? profile?.sportType ?? 'musculation'

  const header = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROFIL UTILISATEUR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Âge : ${profile?.age ?? '?'} ans
Poids : ${profile?.weight ?? '?'} kg
Taille : ${profile?.height ?? '?'} cm
Sexe : ${sexLabel(profile?.sex)}
Objectif : ${goalLabel}
Entraînements : ${trainingLine}/semaine — ${sportLine}
Activité & travail (détail TDEE) :
${activityText}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CALCUL CALORIQUE (Mifflin-St Jeor — méthode Bridge)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BMR calculé : ${results?.bmr ?? '?'} kcal
TDEE calculé : ${results?.tdee ?? '?'} kcal
Déficit/Surplus appliqué : ${deltaLabel(profile)}
CIBLE JOURNALIÈRE : ${results?.targetCalories ?? '?'} kcal

Répartition macros (Méthode Bridge) :
→ Protéines : ${prot}g/jour (${prot}×4 = ${Math.round(protKcal)} kcal)
→ Lipides : ${fat}g/jour (${fat}×9 = ${Math.round(fatKcal)} kcal)
→ Glucides : ${carbs}g/jour (${carbs}×4 = ${Math.round(carbKcal)} kcal)
→ Total vérifié : ${Math.round(totalKcal)} kcal ✓

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ALIMENTS DE L'UTILISATEUR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Consommés actuellement :
${formatList(foods?.current)}

Aimés (à intégrer dans le plan) :
${formatList(foods?.likes)}

Exclus / allergies (JAMAIS dans le plan) :
${formatList(foods?.dislikes)}

Super-aliments acceptés :
${formatList(foods?.accepted)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PLAN ALIMENTAIRE ACTUEL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${JSON.stringify(weekPlan ?? {}, null, 2)}
`

  return `${OPENING}\n${header}\n${ASSISTANT_EXPERT_STATIC}`
}
