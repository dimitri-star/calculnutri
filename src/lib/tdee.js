import { JOB_FACTORS, STEP_FACTORS, TRAIN_FACTORS, SPORT_MULTIPLIERS } from '../constants/nutrition.js'

export function calcBMR(weight, height, age, sex) {
  const base = 10 * weight + 6.25 * height - 5 * age
  return sex === 'homme' ? base + 5 : base - 161
}

export function calcActivityFactor(job, steps, training, sportType) {
  let factor = 1.2
  factor += JOB_FACTORS[job] ?? 0
  factor += STEP_FACTORS[steps] ?? 0
  const trainBase = TRAIN_FACTORS[training] ?? 0
  const sportMult = SPORT_MULTIPLIERS[sportType] ?? 1
  factor += trainBase * sportMult
  return Math.min(factor, 2.0)
}

export function calcTDEE(bmr, activityFactor) {
  return Math.round(bmr * activityFactor)
}

export function calcTargets(tdee, goal, delta = 250) {
  const d = Math.min(700, Math.max(100, delta))
  const cut = tdee - d
  const maintain = tdee
  const bulk = tdee + d
  const targetCalories = goal === 'seche' ? cut : goal === 'masse' ? bulk : maintain
  return { cut, maintain, bulk, targetCalories }
}

export function calcMacros(targetCalories, weight, goal) {
  const protMultiplier = goal === 'seche' ? 2.1 : goal === 'masse' ? 1.8 : 1.9
  const prot = Math.round(weight * protMultiplier)
  const fat = Math.round(weight * 0.9)
  const protCals = prot * 4
  const fatCals = fat * 9
  const carbCals = targetCalories - protCals - fatCals
  const carbs = Math.max(50, Math.round(carbCals / 4))
  // Ajustement pour garantir la cohérence : prot×4 + fat×9 + carbs×4 = targetCalories
  const realCals = prot * 4 + fat * 9 + carbs * 4
  const diff = targetCalories - realCals
  const carbsAdjusted = diff !== 0 ? Math.max(50, Math.round(carbs + diff / 4)) : carbs
  return { prot, fat, carbs: carbsAdjusted }
}

export function calcAll(profile) {
  const { age, weight, height, sex, goal, job, steps, training, sportType, delta = 250 } = profile
  const w = parseFloat(weight)
  const h = parseFloat(height)
  const a = parseInt(age)
  if (!w || !h || !a) return null
  const bmr = Math.round(calcBMR(w, h, a, sex))
  const actFactor = calcActivityFactor(job, steps, training, sportType)
  const tdee = calcTDEE(bmr, actFactor)
  const { cut, maintain, bulk, targetCalories } = calcTargets(tdee, goal, delta)
  const { prot, fat, carbs } = calcMacros(targetCalories, w, goal)
  return { bmr, tdee, cut, maintain, bulk, targetCalories, prot, fat, carbs }
}
