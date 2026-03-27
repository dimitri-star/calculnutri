export const JOB_FACTORS = {
  bureau: 0,
  debout: 0.1,
  actif: 0.2,
  physique: 0.35,
}

export const STEP_FACTORS = {
  '<5k': 0,
  '5-10k': 0.05,
  '10-15k': 0.10,
  '15k+': 0.15,
}

export const TRAIN_FACTORS = {
  '0': 0,
  '1-2': 0.10,
  '3': 0.15,
  '4-5': 0.20,
  '6+': 0.30,
}

export const SPORT_MULTIPLIERS = {
  musculation: 1,
  cardio: 1.15,
  mixte: 1.10,
  collectif: 1,
  aucun: 1,
}

export const GOAL_LABELS = {
  seche: 'Sèche',
  maintien: 'Maintien',
  masse: 'Prise de masse',
}

export const JOB_LABELS = {
  bureau: 'Travail de bureau (sédentaire)',
  debout: 'Métier debout / léger déplacement',
  actif: 'Métier actif terrain',
  physique: 'Métier physique (bâtiment, manutention)',
}

export const STEPS_LABELS = {
  '<5k': '< 5 000 pas',
  '5-10k': '5 000 – 10 000 pas',
  '10-15k': '10 000 – 15 000 pas',
  '15k+': '15 000+ pas',
}

export const TRAINING_LABELS = {
  '0': '0 séance',
  '1-2': '1–2 séances',
  '3': '3 séances',
  '4-5': '4–5 séances',
  '6+': '6+ séances',
}

export const SPORT_LABELS = {
  musculation: 'Musculation',
  cardio: 'Cardio',
  mixte: 'Mixte',
  collectif: 'Sport collectif',
  aucun: 'Aucun',
}

export const COOK_TIME_LABELS = {
  quick: '< 15 min',
  moderate: '15–30 min',
  long: '30–60 min',
  unlimited: 'Pas de limite',
}

export const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']

export const MEAL_COLORS = {
  'Petit-déjeuner': { bg: '#FFF8E1', text: '#F57C00', label: 'Matin' },
  'Déjeuner': { bg: '#E8F5E9', text: '#2E7D32', label: 'Midi' },
  'Collation': { bg: '#E3F2FD', text: '#1565C0', label: 'Collation' },
  'Dîner': { bg: '#FFF3E0', text: '#E65100', label: 'Soir' },
}

export const SUPERFOODS = [
  { id: 'foie', label: 'Foie de poulet', desc: 'Zinc, fer, vit B12' },
  { id: 'sardines', label: 'Sardines', desc: 'Oméga-3, calcium' },
  { id: 'betterave', label: 'Betterave', desc: 'Nitrates, énergie' },
  { id: 'chia', label: 'Graines de chia', desc: 'Fibres, oméga-3' },
  { id: 'gingembre', label: 'Gingembre frais', desc: 'Anti-inflammatoire' },
]
