import { JOB_LABELS, STEPS_LABELS, TRAINING_LABELS, SPORT_LABELS } from '../constants/nutrition.js'

function normMode(m) {
  return m === 'custom' ? 'custom' : 'list'
}

/** Texte d’activité pour les prompts IA : listes + champs libres. */
export function buildActivitySummary(profile) {
  const jobMode = normMode(profile.jobMode)
  const stepsMode = normMode(profile.stepsMode)
  const sportMode = normMode(profile.sportMode)

  const jobList = JOB_LABELS[profile.job] || profile.job
  const jobTxt = (profile.jobFreeText || '').trim()
  const jobLine =
    jobMode === 'custom' && jobTxt
      ? `${jobTxt} (équivalent TDEE : ${jobList})`
      : [jobList, jobTxt].filter(Boolean).join(' — ') || jobList

  const stepsList = STEPS_LABELS[profile.steps] || profile.steps
  const stepsTxt = (profile.stepsFreeText || '').trim()
  const stepsLine =
    stepsMode === 'custom' && stepsTxt
      ? `${stepsTxt} (fourchette TDEE : ${stepsList})`
      : [stepsList, stepsTxt].filter(Boolean).join(' — ') || stepsList

  const trainList = TRAINING_LABELS[profile.training] || profile.training
  const trainTxt = (profile.trainingFreeText || '').trim()
  const trainLine = [trainList, trainTxt].filter(Boolean).join(' — ') || trainList

  const sportList = SPORT_LABELS[profile.sportType] || profile.sportType
  const sportTxt = (profile.sportFreeText || '').trim()
  const sportLine =
    sportMode === 'custom' && sportTxt
      ? `${sportTxt} (profil effort TDEE : ${sportList})`
      : [sportList, sportTxt].filter(Boolean).join(' — ') || sportList

  return `TRAVAIL : ${jobLine}
PAS / MOUVEMENT QUOTIDIEN : ${stepsLine}
SÉANCES / SEMAINE : ${trainLine}
SPORT / ENTRAÎNEMENT : ${sportLine}`
}
