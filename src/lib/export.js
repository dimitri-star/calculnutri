const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']

export function generateCSV(weekPlan) {
  const headers = ['Jour', 'Repas', 'Heure', 'Aliments', 'Protéines (g)', 'Glucides (g)', 'Lipides (g)', 'Calories (kcal)']
  const rows = [headers]

  for (const day of DAYS) {
    const dayData = weekPlan[day] || {}
    const repas = Array.isArray(dayData.repas) ? dayData.repas : []
    let totalCals = 0
    let totalProt = 0
    let totalCarbs = 0
    let totalFat = 0

    for (const m of repas) {
      const aliments = Array.isArray(m.aliments) ? m.aliments.join(' + ') : ''
      rows.push([
        day,
        m.nom ?? 'Repas',
        m.heure ?? '',
        aliments,
        m.proteines ?? 0,
        m.glucides ?? 0,
        m.lipides ?? 0,
        m.calories ?? 0,
      ])
      totalCals += m.calories ?? 0
      totalProt += m.proteines ?? 0
      totalCarbs += m.glucides ?? 0
      totalFat += m.lipides ?? 0
    }

    rows.push([day, 'TOTAL', '', '', totalProt, totalCarbs, totalFat, totalCals])
    rows.push(['', '', '', '', '', '', '', ''])
  }

  const csv = rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  const date = new Date().toISOString().split('T')[0]
  a.download = `NutriCalc_Plan_${date}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
