const PROMPT = `Tu es un expert en nutrition et diététique sportive.
Analyse ce dossier profil complet et extrais TOUTES les informations pertinentes.

MISSION : Lire l'intégralité du document et extraire en JSON strict.

RÈGLES D'EXTRACTION :

"current" = aliments mangés ACTUELLEMENT et régulièrement (routine quotidienne, alimentation actuelle)
  → Normalise : "3 oeufs" → "oeufs", "blanc de poulet" → "poulet", "steak haché du boucher" → "steak haché"
  → Un aliment = une entrée (pas de doublons)
  → Ignore les quantités dans les noms

"likes" = aliments aimés, envisagés, ou d'une alimentation passée appréciée
  → Ne pas dupliquer avec "current"

"dislikes" = allergies, intolérances, aliments refusés ou explicitement exclus

"notes" = résumé des contraintes et du mode de vie en 3-4 phrases max
  → Inclure : contraintes de temps, budget, horaires repas, lieu des repas (cantine, boulot),
     contexte sport (avant/après salle, horaires), particularités importantes

"budget" = budget alimentaire mensuel en euros (nombre uniquement, ex: 300) ou null

"cookTime" = estimation du temps de cuisine disponible
  → "minimal" si < 15 min mentionné
  → "moderate" si 15-30 min
  → "comfortable" si 30-60 min
  → "chef" si pas de limite de temps

"profile" = données chiffrées du profil physique extraites du document
  → age (entier), weight (kg, nombre), height (cm, nombre), sex ("male"/"female"/null)
  → goal : "cut" = sèche/déficit, "bulk" = prise de masse/surplus, "maintain" = maintien, null si non précisé
  → training : nombre entier de séances/semaine ou null
  → job : "sedentary" = bureau/assis, "light" = debout/déplacements légers, "moderate" = actif terrain, "hard" = très physique

RÉPONDS UNIQUEMENT EN JSON BRUT. Aucun texte avant ou après.

Exemple de sortie :
{
  "current": ["poulet", "dinde", "steak haché", "oeufs", "fromage blanc 0%", "riz", "brocolis", "courgettes", "betteraves", "carottes", "banane", "kiwi", "patate douce", "flocons d'avoine", "amandes", "noix", "miel", "dattes", "gingembre"],
  "likes": ["lait", "mangue", "fromage de brebis", "carré frais"],
  "dislikes": [],
  "notes": "Peu de temps pour cuisiner, recherche de repas standardisés et rapides. Budget alimentaire ~300€/mois. Travail sédentaire (assis, beaucoup en voiture), NEAT très bas. Musculation régulière le soir après le travail, ne rentre pas chez lui avant la salle. Dattes juste avant l'entraînement.",
  "budget": 300,
  "cookTime": "minimal",
  "profile": {
    "age": null,
    "weight": null,
    "height": null,
    "sex": null,
    "goal": null,
    "training": null,
    "job": "sedentary"
  }
}`

export async function analyzePDFProfile(base64PDF) {
  const key = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (!key || key === 'sk-ant-votre-cle-ici') {
    throw new Error('Clé API manquante. Configure VITE_ANTHROPIC_API_KEY dans ton fichier .env')
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 60000)

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'document',
              source: {
                type: 'base64',
                media_type: 'application/pdf',
                data: base64PDF,
              },
            },
            {
              type: 'text',
              text: PROMPT,
            },
          ],
        }],
      }),
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error?.message || `Erreur API ${res.status}`)
    }

    const data = await res.json()
    const text = data.content?.map(b => b.text || '').join('') || ''
    const cleaned = text.replace(/```json|```/g, '').trim()

    let parsed
    try {
      parsed = JSON.parse(cleaned)
    } catch {
      throw new Error("L'IA n'a pas pu lire le document. Vérifie que ton PDF est un PDF texte (pas un scan image).")
    }

    if (!Array.isArray(parsed.current)) {
      throw new Error('Format de réponse invalide. Réessaie.')
    }

    return parsed

  } catch (err) {
    clearTimeout(timeout)
    if (err.name === 'AbortError') {
      throw new Error('Délai dépassé (60s). Ton PDF est peut-être trop volumineux.')
    }
    throw err
  }
}
