import { DAYS } from '../constants/nutrition.js'

const OLD_MEALS = ['Petit-déjeuner', 'Déjeuner', 'Collation', 'Dîner']
const HOURS = {
  'Petit-déjeuner': '7h30',
  Déjeuner: '12h00',
  Collation: '15h30',
  Dîner: '20h00',
}

/** true si le jour est déjà au format { repas: [...] } */
export function isDayNewFormat(day) {
  return day && typeof day === 'object' && Array.isArray(day.repas)
}

/**
 * Migre un plan 7 jours (anciennes clés repas → tableau repas).
 * @param {object | null} plan
 * @returns {object | null}
 */
export function migratePlanToNewFormat(plan) {
  if (!plan || typeof plan !== 'object') return null

  const migrated = {}

  for (const day of DAYS) {
    if (!plan[day]) continue
    const d = plan[day]

    if (isDayNewFormat(d)) {
      migrated[day] = {
        repas: (d.repas || []).map((r, i) => normalizeRepasEntry(r, i)),
      }
      continue
    }

    const repas = []
    OLD_MEALS.forEach((meal, i) => {
      if (!d[meal]) return
      const m = d[meal]
      repas.push(
        normalizeRepasEntry(
          {
            id: `r${i + 1}`,
            nom: meal,
            heure: HOURS[meal] || '',
            aliments: m.aliments ?? [],
            calories: m.calories ?? 0,
            proteines: m.proteines ?? 0,
            glucides: m.glucides ?? 0,
            lipides: m.lipides ?? 0,
          },
          i,
        ),
      )
    })
    migrated[day] = { repas }
  }

  return migrated
}

function normalizeRepasEntry(r, index) {
  const aliments = Array.isArray(r.aliments) ? r.aliments : r.aliments ? [String(r.aliments)] : []
  return {
    id: r.id && String(r.id).trim() ? String(r.id) : `r${index + 1}`,
    nom: r.nom && String(r.nom).trim() ? String(r.nom) : `Repas ${index + 1}`,
    heure: r.heure != null ? String(r.heure) : '',
    aliments,
    calories: Number(r.calories) || 0,
    proteines: Number(r.proteines) || 0,
    glucides: Number(r.glucides) || 0,
    lipides: Number(r.lipides) || 0,
  }
}
