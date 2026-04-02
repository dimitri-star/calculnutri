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

━━━ VALEURS NUTRITIONNELLES DE RÉFÉRENCE (source Ciqual — utilise ces valeurs exactes) ━━━
Oeuf moyen 1pc (55g)     = 7.7P | 0.4G  | 6.0L  |  87 kcal
Oeuf gros 1pc (60g)      = 8.4P | 0.4G  | 6.5L  |  95 kcal
Fromage blanc 0% 100g    = 8.0P | 3.9G  | 0.2L  |  49 kcal
Yaourt grec 0% 100g      =10.0P | 3.6G  | 0.4L  |  57 kcal
Poulet/dinde CRU 100g    =22.0P | 0G    | 2.0L  | 106 kcal
Bœuf 5% CRU 100g         =20.5P | 0G    | 5.0L  | 129 kcal
Steak/faux-filet CRU 100g=22.0P | 0G    | 7.5L  | 155 kcal
Saumon CRU 100g          =20.0P | 0G    |13.5L  | 204 kcal
Sardines boîte 100g      =25.0P | 0G    |11.5L  | 208 kcal
Thon boîte eau 100g      =26.5P | 0G    | 0.8L  | 116 kcal
Riz basmati CRU 100g     = 7.0P |77.7G  | 0.7L  | 350 kcal
Flocons d'avoine 100g    =13.5P |59.0G  | 7.1L  | 372 kcal
Patate douce CRU 100g    = 1.6P |20.5G  | 0.1L  |  90 kcal
Pomme de terre CRU 100g  = 2.0P |17.0G  | 0.1L  |  77 kcal
Quinoa CRU 100g          =13.1P |62.3G  | 5.6L  | 357 kcal
Banane 1pc (120g)        = 1.3P |26.0G  | 0.2L  | 110 kcal
Kiwi 1pc (80g)           = 0.9P | 9.8G  | 0.4L  |  44 kcal
Mangue 100g              = 0.5P |14.8G  | 0.2L  |  63 kcal
Dattes 2pc (30g)         = 0.7P |22.4G  | 0.1L  |  93 kcal
Fruits rouges 100g       = 0.9P | 9.8G  | 0.4L  |  44 kcal
Huile d'olive 10ml       = 0P   | 0G    | 9.8L  |  88 kcal
Amandes 30g              = 6.3P | 2.1G  |15.4L  | 174 kcal
Noix 25g                 = 4.0P | 1.7G  |16.5L  | 167 kcal
Brocolis 100g            = 2.8P | 4.4G  | 0.4L  |  34 kcal
Courgette 100g           = 2.0P | 3.0G  | 0.3L  |  17 kcal
Betterave 100g           = 1.6P | 9.6G  | 0.1L  |  43 kcal
Carotte 100g             = 1.0P | 7.0G  | 0.2L  |  34 kcal
Épinards 100g            = 2.7P | 1.6G  | 0.5L  |  20 kcal
Miel 10g                 = 0P   | 8.2G  | 0L    |  33 kcal
Chocolat noir 85% 10g    = 1.3P | 2.9G  | 5.8L  |  62 kcal

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

━━━ RÈGLE DE CALCUL OBLIGATOIRE ━━━
Pour chaque repas, calcule les macros aliment par aliment en utilisant les valeurs ci-dessus, puis additionne. Ne jamais estimer ou arrondir globalement.
Vérifie ensuite : (proteines × 4) + (glucides × 4) + (lipides × 9) = calories
Si écart > 10 kcal → ajuste les glucides pour corriger exactement.

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

