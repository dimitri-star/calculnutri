import { buildActivitySummary } from './activityPrompt.js'

export function buildAnalysisPrompt(profile, results, foods, planPrefs) {
  const goalLabel = profile.goal === 'seche' ? 'sèche' : profile.goal === 'masse' ? 'prise de masse' : 'maintien'
  const activityBlock = buildActivitySummary(profile)

  return `Tu es un expert en nutrition sportive et santé ancestrale.

PROFIL : ${profile.age} ans, ${profile.weight} kg, objectif ${goalLabel}
CIBLES : ${results.targetCalories} kcal/j | ${results.prot}g protéines | ${results.carbs}g glucides | ${results.fat}g lipides

ACTIVITÉ & MOUVEMENT :
${activityBlock}

ALIMENTS ACTUELS : ${foods.current.join(', ') || 'non renseigné'}
ALIMENTS AIMÉS : ${foods.likes.join(', ') || 'non renseigné'}
ALIMENTS EXCLUS : ${foods.dislikes.join(', ') || 'aucun'}
INFOS : ${planPrefs.extraInfo || 'aucune'}

Fais une analyse structurée en 3 sections :

## ✅ Ce qui est BON dans ton alimentation actuelle
Pour chaque aliment bien classé : une ligne avec le bénéfice clé (hormones, énergie, récup, etc.)

## ❌ Ce qui est à revoir
Pour chaque aliment problématique : pourquoi (glucides raffinés, mauvaises graisses, cortisol, etc.) + proposition de substitut sain équivalent

## 🔬 Manques nutritionnels détectés
Liste des 3-4 carences probables (zinc, magnésium, oméga-3, fibres, etc.) avec les aliments qui y répondent

Sois direct, concis, pas de blabla. Maximum 500 mots.`
}

export function buildWeekPlanPrompt(profile, results, foods, planPrefs) {
  const goalLabel = profile.goal === 'seche' ? 'sèche' : profile.goal === 'masse' ? 'prise de masse' : 'maintien'
  const allAllowed = [...foods.current, ...foods.likes, ...foods.accepted].filter(Boolean)
  const budgetText = planPrefs.budget ? `${planPrefs.budget}€/semaine` : 'non défini'
  const cookMap = { quick: '< 15 min', moderate: '15–30 min', long: '30–60 min', unlimited: 'pas de limite' }
  const cookText = cookMap[planPrefs.cookTime] || planPrefs.cookTime
  const activityBlock = buildActivitySummary(profile)

  return `Tu es un expert en nutrition sportive. Génère un plan alimentaire 7 jours en JSON strict.

PROFIL : objectif ${goalLabel}, ${profile.weight} kg
CIBLES : ${results.targetCalories} kcal/j | ${results.prot}g P | ${results.carbs}g G | ${results.fat}g L
ACTIVITÉ & MOUVEMENT :
${activityBlock}
ALIMENTS AUTORISÉS : ${allAllowed.join(', ') || 'tous les aliments sains'}
ALIMENTS EXCLUS : ${foods.dislikes.join(', ') || 'aucun'}
BUDGET : ${budgetText}
TEMPS DE CUISSON : ${cookText}
PRÉCISIONS : ${planPrefs.extraInfo || 'aucune'}

Format JSON attendu (réponds UNIQUEMENT avec ce JSON, rien d'autre) :
{
  "Lundi": {
    "Petit-déjeuner": {
      "aliments": ["3 oeufs brouillés", "150g fromage blanc 0%", "1 banane"],
      "calories": 510,
      "proteines": 35,
      "glucides": 45,
      "lipides": 18
    },
    "Déjeuner": { "aliments": [], "calories": 0, "proteines": 0, "glucides": 0, "lipides": 0 },
    "Collation": { "aliments": [], "calories": 0, "proteines": 0, "glucides": 0, "lipides": 0 },
    "Dîner": { "aliments": [], "calories": 0, "proteines": 0, "glucides": 0, "lipides": 0 }
  },
  "Mardi": {},
  "Mercredi": {},
  "Jeudi": {},
  "Vendredi": {},
  "Samedi": {},
  "Dimanche": {}
}

RÈGLES :
- Quantités toujours en CRU pour viandes et féculents
- Total journalier : ${results.targetCalories} kcal ±100
- Protéines : ${results.prot}g ±10g
- Varie les repas (pas le même dîner tous les soirs)
- Utilise en priorité les aliments fournis
- Réponds UNIQUEMENT avec le JSON, sans texte avant ou après`
}

const CHAT_MEALS = ['Petit-déjeuner', 'Déjeuner', 'Collation', 'Dîner']

/** Assistant : l’utilisateur ne modifie pas le tableau ; il décrit ce qu’il n’aime pas et tu réorganises toute la semaine. */
export function buildPlanChatPrompt(weekPlan, results, foods, conversationTranscript, latestUserMessage) {
  const dislikes = foods.dislikes?.length ? foods.dislikes.join(', ') : 'aucun'
  const planJson = JSON.stringify(weekPlan || {}, null, 0)

  return `Tu es un nutritionniste. L'utilisateur a un plan alimentaire sur 7 jours (JSON ci-dessous). Il NE modifie pas le plan à la main : il te parle dans un chat.

COMPORTEMENT ATTENDU :
- S'il n'aime pas un aliment, un repas ou un jour, tu RÉORGANISES le plan : remplace par des équivalents, ÉCHANGE des repas entre jours, ou DÉPLACE des aliments/repas "ailleurs" dans la semaine pour garder variété et plaisir.
- Garde l'équilibre : chaque jour environ ${results.targetCalories} kcal (±12 %), protéines ~${results.prot}g, glucides ~${results.carbs}g, lipides ~${results.fat}g (tolérance raisonnable sur la semaine).
- Jamais : ${dislikes}
- Chaque jour doit avoir exactement ces repas : ${CHAT_MEALS.map((m) => `"${m}"`).join(', ')} avec pour chacun "aliments" (tableau de chaînes), "calories", "proteines", "glucides", "lipides" (nombres). Quantités viandes/féculents en cru si possible.

PLAN ACTUEL (JSON COMPLET) :
${planJson}

HISTORIQUE RÉCENT DU CHAT :
${conversationTranscript || '(aucun)'}

NOUVELLE DEMANDE UTILISATEUR :
${latestUserMessage}

Réponds UNIQUEMENT avec le JSON COMPLET des 7 jours (clés : Lundi, Mardi, Mercredi, Jeudi, Vendredi, Samedi, Dimanche), sans markdown, sans texte avant ni après.`
}
