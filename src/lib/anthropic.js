import { DAYS } from '../constants/nutrition.js'

const API_URL = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-sonnet-4-20250514'
const TIMEOUT_MS = 30000

const DEMO_ANALYSIS = `## ✅ Ce qui est BON dans ton alimentation actuelle
**Œufs** — Source complète de protéines, choline essentielle pour les hormones et la récupération musculaire.
**Riz complet** — Index glycémique modéré, bon carburant pour les entraînements, riche en magnésium.
**Poulet** — Protéines maigres de haute qualité, parfait pour la synthèse musculaire.

## ❌ Ce qui est à revoir
**Pain blanc** — Glucides raffinés à index glycémique élevé → spike d'insuline, fatigue post-repas. Substitut : pain complet au levain ou patate douce.
**Jus de fruits** — Sucre libre sans fibre, charge glycémique similaire au soda. Substitut : fruit entier + eau.

## 🔬 Manques nutritionnels détectés
**Oméga-3** — Déficit probable si peu de poissons gras → inflammation, récupération lente. Solution : sardines, maquereau 2x/semaine.
**Zinc** — Peu de viandes rouges ni légumineuses → testostérone et immunité affectées. Solution : viande rouge 1x/semaine, huîtres.
**Magnésium** — Stress + sport épuisent rapidement les réserves. Solution : amandes, épinards, chocolat noir 85%.
**Vitamine D** — Carence très fréquente. Solution : sardines, jaunes d'œuf, exposition solaire.`

const DEMO_PLAN = {
  Lundi: {
    'Petit-déjeuner': { aliments: ['3 œufs brouillés', '150g fromage blanc 0%', '1 banane', '30g flocons d\'avoine'], calories: 520, proteines: 38, glucides: 52, lipides: 14 },
    'Déjeuner': { aliments: ['180g poulet grillé (cru)', '150g riz basmati (cru)', 'Salade verte', '1 cs huile d\'olive'], calories: 620, proteines: 45, glucides: 68, lipides: 14 },
    'Collation': { aliments: ['30g amandes', '1 pomme'], calories: 220, proteines: 6, glucides: 24, lipides: 13 },
    'Dîner': { aliments: ['200g saumon (cru)', '300g patate douce (crue)', 'Brocoli vapeur'], calories: 580, proteines: 40, glucides: 55, lipides: 16 },
  },
  Mardi: {
    'Petit-déjeuner': { aliments: ['2 œufs durs', '2 tranches pain complet', '1 cs beurre de cacahuète', '1 orange'], calories: 490, proteines: 24, glucides: 48, lipides: 20 },
    'Déjeuner': { aliments: ['200g bœuf haché 5% (cru)', '150g quinoa (cru)', 'Tomates cerises', 'Avocat ½'], calories: 650, proteines: 48, glucides: 58, lipides: 18 },
    'Collation': { aliments: ['200g fromage blanc 0%', '1 cs miel', '10 noix de cajou'], calories: 240, proteines: 18, glucides: 22, lipides: 10 },
    'Dîner': { aliments: ['180g thon en boîte', '200g lentilles cuites', 'Épinards sautés', '1 cs huile d\'olive'], calories: 530, proteines: 42, glucides: 46, lipides: 12 },
  },
  Mercredi: {
    'Petit-déjeuner': { aliments: ['Smoothie : 200ml lait, 1 banane, 30g protéine whey', '40g granola'], calories: 510, proteines: 36, glucides: 60, lipides: 10 },
    'Déjeuner': { aliments: ['180g poulet (cru)', '200g pomme de terre (crue)', 'Haricots verts', 'Moutarde'], calories: 590, proteines: 42, glucides: 62, lipides: 10 },
    'Collation': { aliments: ['1 yaourt grec 0%', '1 poire', '20g graines de chia'], calories: 200, proteines: 14, glucides: 26, lipides: 5 },
    'Dîner': { aliments: ['3 œufs entiers', '150g saumon fumé', 'Salade composée', '1 cs huile d\'olive'], calories: 540, proteines: 44, glucides: 8, lipides: 36 },
  },
  Jeudi: {
    'Petit-déjeuner': { aliments: ['4 blancs d\'œuf + 1 entier', '60g flocons d\'avoine', '1 cs miel', 'Fruits rouges 80g'], calories: 480, proteines: 32, glucides: 58, lipides: 8 },
    'Déjeuner': { aliments: ['200g crevettes', '150g riz basmati (cru)', 'Poivrons sautés', '1 cs sauce soja'], calories: 580, proteines: 44, glucides: 66, lipides: 8 },
    'Collation': { aliments: ['30g amandes', '1 banane'], calories: 230, proteines: 7, glucides: 28, lipides: 12 },
    'Dîner': { aliments: ['200g bœuf haché 5% (cru)', '300g courgette', 'Sauce tomate maison', 'Herbes fraîches'], calories: 520, proteines: 46, glucides: 18, lipides: 22 },
  },
  Vendredi: {
    'Petit-déjeuner': { aliments: ['150g fromage blanc 0%', '40g muesli sans sucre', '1 kiwi', '10g graines de lin'], calories: 460, proteines: 22, glucides: 58, lipides: 10 },
    'Déjeuner': { aliments: ['180g poulet (cru)', '150g boulgour (cru)', 'Concombre', 'Houmous 30g'], calories: 610, proteines: 44, glucides: 64, lipides: 14 },
    'Collation': { aliments: ['2 œufs durs', '1 pomme'], calories: 210, proteines: 14, glucides: 16, lipides: 10 },
    'Dîner': { aliments: ['200g cabillaud (cru)', '200g patate douce (crue)', 'Épinards', '1 cs huile coco'], calories: 540, proteines: 42, glucides: 50, lipides: 14 },
  },
  Samedi: {
    'Petit-déjeuner': { aliments: ['3 pancakes avoine & banane', '200g fromage blanc', '1 cs sirop d\'érable'], calories: 540, proteines: 28, glucides: 72, lipides: 12 },
    'Déjeuner': { aliments: ['2 steaks de thon grillé 150g', '200g riz (cru)', 'Salade de tomates', 'Citron'], calories: 640, proteines: 52, glucides: 68, lipides: 10 },
    'Collation': { aliments: ['1 shake protéiné (30g whey + 300ml lait)', '1 banane'], calories: 380, proteines: 38, glucides: 40, lipides: 6 },
    'Dîner': { aliments: ['250g magret de canard (cru)', 'Purée céleri 200g', 'Haricots verts'], calories: 560, proteines: 42, glucides: 22, lipides: 28 },
  },
  Dimanche: {
    'Petit-déjeuner': { aliments: ['Omelette 4 œufs', 'Fromage de chèvre 40g', 'Épinards frais', '2 tranches pain complet'], calories: 530, proteines: 36, glucides: 32, lipides: 28 },
    'Déjeuner': { aliments: ['200g rôti de bœuf (cru)', '300g pomme de terre (crue)', 'Carottes rôties', '1 cs huile d\'olive'], calories: 660, proteines: 48, glucides: 58, lipides: 18 },
    'Collation': { aliments: ['200g fromage blanc 0%', 'Fruits rouges 100g', '15g amandes'], calories: 220, proteines: 18, glucides: 18, lipides: 8 },
    'Dîner': { aliments: ['180g saumon (cru)', '200g lentilles cuites', 'Salade composée', '1 cs huile d\'olive'], calories: 580, proteines: 44, glucides: 42, lipides: 20 },
  },
}

export async function callAnthropic(
  promptOrMessages,
  type = 'analysis',
  { max_tokens: maxTokens = 4096, timeoutMs = TIMEOUT_MS, system } = {}
) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY

  if (!apiKey || apiKey === 'sk-ant-votre-cle-ici') {
    await new Promise(r => setTimeout(r, 1200))
    if (type === 'plan') return JSON.stringify(DEMO_PLAN)
    return DEMO_ANALYSIS
  }

  const messages = Array.isArray(promptOrMessages)
    ? promptOrMessages
    : [{ role: 'user', content: promptOrMessages }]

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const body = { model: MODEL, max_tokens: maxTokens, messages }
    if (system) body.system = system

    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error?.message || `Erreur API : ${res.status}`)
    }

    const data = await res.json()
    return data.content[0].text
  } catch (err) {
    if (err.name === 'AbortError') throw new Error(`Timeout : la requête a pris trop de temps (>${Math.round(timeoutMs / 1000)}s)`)
    throw err
  } finally {
    clearTimeout(timer)
  }
}

export function parseWeekPlan(text) {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('Pas de JSON trouvé')
    return JSON.parse(jsonMatch[0])
  } catch {
    return getFallbackPlan()
  }
}

/** Parse strict : null si JSON invalide (pas de plan de secours). */
export function parseWeekPlanStrict(text) {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return null
    return JSON.parse(jsonMatch[0])
  } catch {
    return null
  }
}

const MEAL_KEYS = ['Petit-déjeuner', 'Déjeuner', 'Collation', 'Dîner']

/**
 * Si le JSON a les 7 jours complets → remplace tout ; sinon fusionne jour par jour.
 * @returns {{ plan: object, changed: boolean }}
 */
export function applyWeekPlanUpdate(parsed, previous) {
  if (!parsed || typeof parsed !== 'object' || !previous) return { plan: previous, changed: false }
  const mealOk = (meal) => {
    if (!meal || typeof meal !== 'object') return false
    const a = meal.aliments
    const hasFoods = Array.isArray(a) ? a.length > 0 : typeof a === 'string' && a.trim().length > 0
    return hasFoods && ['calories', 'proteines', 'glucides', 'lipides'].every((k) => meal[k] != null && !Number.isNaN(Number(meal[k])))
  }
  const dayComplete = (day) =>
    day && typeof day === 'object' && MEAL_KEYS.every((m) => mealOk(day[m]))
  const allComplete = DAYS.every((d) => dayComplete(parsed[d]))
  if (allComplete) return { plan: parsed, changed: true }
  const merged = { ...previous }
  let changed = false
  for (const d of DAYS) {
    if (dayComplete(parsed[d])) {
      merged[d] = parsed[d]
      changed = true
    }
  }
  return { plan: merged, changed }
}

function getFallbackPlan() {
  const meal = (cals, prot, carbs, lip) => ({
    aliments: ['Poulet 150g', 'Riz 100g', 'Légumes vapeur'],
    calories: cals, proteines: prot, glucides: carbs, lipides: lip
  })
  const day = () => ({
    'Petit-déjeuner': meal(400, 25, 45, 10),
    'Déjeuner': meal(600, 40, 60, 15),
    'Collation': meal(200, 15, 20, 5),
    'Dîner': meal(500, 35, 40, 12),
  })
  return {
    Lundi: day(), Mardi: day(), Mercredi: day(), Jeudi: day(),
    Vendredi: day(), Samedi: day(), Dimanche: day(),
  }
}
