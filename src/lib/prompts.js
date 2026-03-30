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

NOMBRE DE REPAS : L'utilisateur peut avoir entre 3 et 6 repas par jour.
Par défaut génère 4 repas dans le tableau "repas". Si les notes mentionnent une collation supplémentaire ou un shaker, ajoute un repas.
Nomme les repas de façon naturelle selon l'heure : "Petit-déjeuner", "Déjeuner", "Collation pré-training", "Dîner", "Collation soir", etc.
Chaque repas a un "id" unique par jour : r1, r2, r3, r4 (puis r5, r6 si besoin), un champ "heure" indicatif, et les macros.

RÉPARTITION INDICATIVE (4 repas par défaut — répartis sur le tableau dans l'ordre chronologique) :
- Repas 1 type matin ≈ ${bfCals} kcal | ${bfProt}g P | ${bfCarbs}g G | ${bfFat}g L
- Repas 2 type midi ≈ ${lunchCals} kcal | ${lunchProt}g P | ${lunchCarbs}g G | ${lunchFat}g L
- Repas 3 type collation ≈ ${snackCals} kcal | ${snackProt}g P | ${snackCarbs}g G | ${snackFat}g L
- Repas 4 type soir ≈ ${dinnerCals} kcal | ${dinnerProt}g P | ${dinnerCarbs}g G | ${dinnerFat}g L

━━━ PROCÉDURE OBLIGATOIRE AVANT DE RÉPONDRE ━━━
Pour CHAQUE jour, VÉRIFIE :
1. Pour chaque entrée du tableau "repas", calcule glucides et calories du repas (cohérent avec les aliments)
2. Somme de TOUS les repas du jour : glucides = ${carbs}g ±5g, calories = ${cal} kcal ±30 kcal, protéines ≈ ${prot}g, lipides ≈ ${fat}g
3. Si écart trop grand : ajuste les quantités (féculents, huiles) sur un ou plusieurs repas
4. ids uniques r1, r2… dans l'ordre du tableau

RÈGLES :
- Quantités TOUJOURS en CRU pour viandes et féculents
- Varie les protéines du soir (pas la même 2 soirs de suite)
- Uniquement aliments naturels non transformés
- Les dattes : en collation pré-training de préférence (pas le matin au réveil)
- Utilise les aliments autorisés en PRIORITÉ ABSOLUE

━━━ FORMAT DE RÉPONSE ━━━
JSON BRUT UNIQUEMENT. Aucun texte avant ou après. Aucun markdown.

{
  "Lundi": {
    "repas": [
      {
        "id": "r1",
        "nom": "Petit-déjeuner",
        "heure": "7h30",
        "aliments": ["3 oeufs entiers", "150g fromage blanc 0%", "60g flocons d'avoine", "1 banane (120g)"],
        "calories": ${bfCals},
        "proteines": ${bfProt},
        "glucides": ${bfCarbs},
        "lipides": ${bfFat}
      },
      {
        "id": "r2",
        "nom": "Déjeuner",
        "heure": "12h00",
        "aliments": ["180g poulet CRU", "115g riz basmati CRU", "200g brocolis", "10ml huile d'olive"],
        "calories": ${lunchCals},
        "proteines": ${lunchProt},
        "glucides": ${lunchCarbs},
        "lipides": ${lunchFat}
      },
      {
        "id": "r3",
        "nom": "Collation pré-training",
        "heure": "15h30",
        "aliments": ["2 dattes (30g)", "30g amandes", "1 kiwi (80g)"],
        "calories": ${snackCals},
        "proteines": ${snackProt},
        "glucides": ${snackCarbs},
        "lipides": ${snackFat}
      },
      {
        "id": "r4",
        "nom": "Dîner",
        "heure": "20h00",
        "aliments": ["170g steak haché 5% CRU", "200g patate douce CRU", "200g courgettes", "2 oeufs entiers"],
        "calories": ${dinnerCals},
        "proteines": ${dinnerProt},
        "glucides": ${dinnerCarbs},
        "lipides": ${dinnerFat}
      }
    ]
  },
  "Mardi": { "repas": [ ... ] },
  "Mercredi": { "repas": [ ... ] },
  "Jeudi": { "repas": [ ... ] },
  "Vendredi": { "repas": [ ... ] },
  "Samedi": { "repas": [ ... ] },
  "Dimanche": { "repas": [ ... ] }
}

Remplis chaque jour avec un tableau "repas" complet (3 à 6 entrées), pas des clés fixes par nom de repas.`
}

