import { buildActivitySummary } from './activityPrompt.js'

export function buildAnalysisPrompt(profile, results, foods, planPrefs) {
  const goalLabel = profile.goal === 'seche' ? 'Sèche' : profile.goal === 'masse' ? 'Prise de masse' : 'Maintien'
  const activityBlock = buildActivitySummary(profile)
  const sexLabel = profile.sex === 'femme' ? 'Femme' : 'Homme'

  const currentList = foods.current.length > 0
    ? foods.current.map(f => `- ${f}`).join('\n')
    : '(aucun aliment renseigné)'
  const likesList = foods.likes.length > 0
    ? foods.likes.map(f => `- ${f}`).join('\n')
    : '(aucun)'
  const dislikesList = foods.dislikes.length > 0
    ? foods.dislikes.map(f => `- ${f}`).join('\n')
    : '(aucun)'

  return `Tu es un expert en nutrition sportive et alimentation ancestrale. Tu vas analyser les aliments fournis ci-dessous. RÈGLE ABSOLUE : ne mentionne QUE les aliments présents dans les listes. Pas d'analyse générique.

PROFIL :
- ${sexLabel}, ${profile.age} ans, ${profile.weight} kg, ${profile.height} cm
- Objectif : ${goalLabel}
- ${activityBlock}
- Cibles : ${results.targetCalories} kcal/j | ${results.prot}g protéines | ${results.carbs}g glucides | ${results.fat}g lipides

ALIMENTS CONSOMMÉS ACTUELLEMENT (analyse chacun) :
${currentList}

ALIMENTS AIMÉS (à intégrer dans le plan) :
${likesList}

ALIMENTS EXCLUS (ne jamais inclure) :
${dislikesList}

${planPrefs?.extraInfo ? `PRÉCISIONS : ${planPrefs.extraInfo}\n` : ''}
FORMAT DE RÉPONSE OBLIGATOIRE (markdown strict, respecte exactement ce format) :

## ✅ Ce qui est BON dans ton alimentation actuelle
**oeufs** — Source complète de protéines, choline essentielle pour la cognition et la testostérone
**fromage blanc 0%** — Caséine à digestion lente, parfait pour l'anabolisme nocturne
**poulet** — Protéine maigre, excellent ratio protéines/calories
[un aliment par ligne, format : **nom** — bénéfice]

## ❌ Ce qui est à revoir
**mangue** — IG élevé (60), pic insulinique fort au repos. Conserve-la uniquement autour de l'entraînement → remplacer par kiwi ou fruits rouges au petit-déjeuner
**pâtes** — Blé raffiné, index glycémique élevé, inflammation digestive possible → remplacer par riz basmati ou boulgour
[un aliment par ligne, format : **nom** — problème → substitut]

## 🔬 Carences nutritionnelles probables
**Vitamine D** — Aucun poisson gras dans la routine, travail sédentaire en intérieur. Solution : sardines 2x/semaine
**Zinc** — Peu de sources riches en zinc détectées. Solution : viande rouge 1-2x/semaine, graines de courge
[une carence par ligne, format : **nom** — explication. Solution : aliment]

## 💡 Super-aliments à intégrer
**sardines** — EPA/DHA + vitamine D, anti-inflammatoire puissant, idéal pour la sèche
**foie de veau** — Concentré en fer, zinc, vitamine B12 et B6, économique
[un aliment par ligne, format : **nom** — bénéfice principal]

RÈGLES ABSOLUES :
- Chaque ligne commence OBLIGATOIREMENT par **nom_de_l_aliment** en gras
- Le nom doit être UNIQUEMENT le nom de l'aliment (ex: **mangue**, **dattes**, **pâtes**) — jamais une description
- Maximum 1 aliment par ligne
- Si un aliment est utilisé correctement dans un contexte précis (ex: dattes en pré-training), NE PAS le mettre dans "à revoir"
- Tiens compte des précisions du profil : ${foods.dislikes?.length > 0 ? `exclusions = ${foods.dislikes.join(', ')}` : 'aucune exclusion'}
- Si l'utilisateur a mentionné un usage spécifique d'un aliment dans ses notes, respecte ce contexte`
}

export function buildWeekPlanPrompt(profile, results, foods, _planPrefs) {
  const goalLabel = profile.goal === 'seche' ? 'Sèche' : profile.goal === 'masse' ? 'Prise de masse' : 'Maintien'
  const allAllowed = [...new Set([...foods.current, ...foods.likes, ...(foods.accepted || [])].filter(Boolean))]

  const cal   = results.targetCalories
  const prot  = results.prot
  const carbs = results.carbs
  const fat   = results.fat

  // Répartition calorique par repas
  const bfCals     = Math.round(cal * 0.25)
  const lunchCals  = Math.round(cal * 0.35)
  const snackCals  = Math.round(cal * 0.15)
  const dinnerCals = cal - bfCals - lunchCals - snackCals

  // Répartition glucides par repas (clé pour éviter le déficit glucidique)
  const bfCarbs     = Math.round(carbs * 0.28)
  const lunchCarbs  = Math.round(carbs * 0.40)
  const snackCarbs  = Math.round(carbs * 0.12)
  const dinnerCarbs = carbs - bfCarbs - lunchCarbs - snackCarbs

  // Répartition protéines par repas
  const bfProt     = Math.round(prot * 0.25)
  const lunchProt  = Math.round(prot * 0.35)
  const snackProt  = Math.round(prot * 0.10)
  const dinnerProt = prot - bfProt - lunchProt - snackProt

  // Répartition lipides par repas
  const bfFat     = Math.round(fat * 0.28)
  const lunchFat  = Math.round(fat * 0.20)
  const snackFat  = Math.round(fat * 0.22)
  const dinnerFat = fat - bfFat - lunchFat - snackFat

  return `Tu es un expert en nutrition. Génère un plan alimentaire 7 jours AVEC DES MACROS EXACTES.

PROFIL : ${profile.weight}kg | Objectif : ${goalLabel}

━━━ CIBLES JOURNALIÈRES ABSOLUES ━━━
Calories TOTALES : ${cal} kcal
Protéines : ${prot}g  (${prot * 4} kcal)
Glucides   : ${carbs}g  (${carbs * 4} kcal)  ← NE PAS DESCENDRE EN DESSOUS
Lipides    : ${fat}g  (${fat * 9} kcal)
VÉRIFICATION : ${prot}×4 + ${carbs}×4 + ${fat}×9 = ${prot * 4 + carbs * 4 + fat * 9} kcal ✓

━━━ CIBLES PAR REPAS (RESPECTE CES CHIFFRES EXACTEMENT) ━━━
Petit-déjeuner : ${bfCals} kcal | ${bfProt}g P | ${bfCarbs}g G | ${bfFat}g L
Déjeuner       : ${lunchCals} kcal | ${lunchProt}g P | ${lunchCarbs}g G | ${lunchFat}g L
Collation      : ${snackCals} kcal | ${snackProt}g P | ${snackCarbs}g G | ${snackFat}g L
Dîner          : ${dinnerCals} kcal | ${dinnerProt}g P | ${dinnerCarbs}g G | ${dinnerFat}g L
TOTAL JOUR     : ${cal} kcal | ${prot}g P | ${carbs}g G | ${fat}g L

━━━ ALIMENTS AUTORISÉS (utilise EN PRIORITÉ ces aliments) ━━━
${allAllowed.length > 0 ? allAllowed.map(f => `• ${f}`).join('\n') : '• Aliments naturels non transformés'}

━━━ ALIMENTS INTERDITS ━━━
${foods.dislikes?.length > 0 ? foods.dislikes.map(f => `• ${f}`).join('\n') : '• aucun'}

━━━ VALEURS NUTRITIONNELLES DE RÉFÉRENCE ━━━
Poulet/dinde CRU 100g    = 22P | 0G  | 1L  | 101 kcal
Bœuf haché 5% CRU 100g  = 21P | 0G  | 5L  | 130 kcal
Saumon CRU 100g          = 20P | 0G  | 13L | 200 kcal
Sardines 100g            = 25P | 0G  | 11L | 200 kcal
Oeuf entier 1pc (55g)    =  6P | 0G  | 5L  |  77 kcal
Fromage blanc 0% 100g    =  8P | 4G  | 0L  |  50 kcal
Riz basmati CRU 100g     =  7P | 78G | 1L  | 350 kcal
Patate douce CRU 100g    =  2P | 20G | 0L  |  87 kcal
Flocons d'avoine 100g    = 13P | 66G | 7L  | 370 kcal
Banane 120g              =  1P | 27G | 0L  | 108 kcal
Dattes 2pc (30g)         =  1P | 22G | 0L  |  92 kcal
Mangue 150g              =  1P | 23G | 0L  |  95 kcal
Kiwi 80g                 =  1P |  9G | 0L  |  40 kcal
Amandes 30g              =  6P |  2G | 15L | 173 kcal
Noix 25g                 =  4P |  2G | 16L | 164 kcal
Huile d'olive 10ml       =  0P |  0G | 9L  |  81 kcal
Brocolis 200g            =  6P | 10G | 0L  |  60 kcal
Courgettes 200g          =  4P |  6G | 0L  |  34 kcal
Betteraves 100g          =  2P | 10G | 0L  |  43 kcal
Carottes 150g            =  1P | 13G | 0L  |  58 kcal
Miel 10g                 =  0P |  8G | 0L  |  31 kcal

━━━ PROCÉDURE OBLIGATOIRE AVANT DE RÉPONDRE ━━━
Pour CHAQUE repas de CHAQUE jour, VÉRIFIE :
1. Calcule les glucides du repas : somme de tous les glucides des aliments
2. Compare à la cible glucides du repas (ex: ${bfCarbs}g pour le matin)
3. Si écart > 5g : AJUSTE les quantités de féculents (riz, flocons, patate douce)
4. Calcule le total jour : somme des 4 repas
5. Vérifie que glucides total = ${carbs}g ±5g
6. Vérifie que calories total = ${cal} kcal ±30 kcal
7. Si l'écart est trop grand : recommence ce repas

RÈGLES :
- Quantités TOUJOURS en CRU pour viandes et féculents
- Varie les protéines du soir (pas la même 2 soirs de suite)
- Uniquement aliments naturels non transformés
- Les dattes : toujours en collation pré-training (jamais le matin)
- Utilise les aliments autorisés en PRIORITÉ ABSOLUE

━━━ FORMAT DE RÉPONSE ━━━
JSON BRUT UNIQUEMENT. Aucun texte avant ou après. Aucun markdown.

{
  "Lundi": {
    "Petit-déjeuner": {
      "aliments": ["3 oeufs entiers", "150g fromage blanc 0%", "60g flocons d'avoine", "1 banane (120g)"],
      "calories": ${bfCals},
      "proteines": ${bfProt},
      "glucides": ${bfCarbs},
      "lipides": ${bfFat}
    },
    "Déjeuner": {
      "aliments": ["180g poulet CRU", "115g riz basmati CRU", "200g brocolis", "10ml huile d'olive"],
      "calories": ${lunchCals},
      "proteines": ${lunchProt},
      "glucides": ${lunchCarbs},
      "lipides": ${lunchFat}
    },
    "Collation": {
      "aliments": ["2 dattes (30g)", "30g amandes", "1 kiwi (80g)"],
      "calories": ${snackCals},
      "proteines": ${snackProt},
      "glucides": ${snackCarbs},
      "lipides": ${snackFat}
    },
    "Dîner": {
      "aliments": ["170g steak haché 5% CRU", "200g patate douce CRU", "200g courgettes", "2 oeufs entiers"],
      "calories": ${dinnerCals},
      "proteines": ${dinnerProt},
      "glucides": ${dinnerCarbs},
      "lipides": ${dinnerFat}
    }
  },
  "Mardi": {},
  "Mercredi": {},
  "Jeudi": {},
  "Vendredi": {},
  "Samedi": {},
  "Dimanche": {}
}`
}

