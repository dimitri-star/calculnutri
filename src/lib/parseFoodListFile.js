/** Retire puces, espaces, casse pour clé tag (comme FoodTagInput). */
export function normalizeFoodToken(raw) {
  if (!raw || typeof raw !== 'string') return ''
  return raw
    .replace(/^\s*[\-\*•\u2022]\s*/, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
}

function dedupe(list) {
  const seen = new Set()
  const out = []
  for (const x of list) {
    if (!x || seen.has(x)) continue
    seen.add(x)
    out.push(x)
  }
  return out
}

function splitItemChunk(chunk) {
  return chunk
    .split(/[,;|]/)
    .map((s) => normalizeFoodToken(s))
    .filter(Boolean)
}

/** Détecte si la ligne est uniquement un titre de section (sans aliments sur la même ligne). */
function matchSectionHeader(line) {
  const t = line.trim()
  if (!t) return null
  const md = t.match(/^#{1,3}\s*(.+)$/i)
  const core = md ? md[1].trim().replace(/:\s*$/, '') : t.replace(/:\s*$/, '').trim()

  const onlyHeader =
    /^actuels?$/i.test(core) ||
    /^aliments?\s+actuels?$/i.test(core) ||
    /^consommés?$/i.test(core) ||
    /^au\s+quotidien$/i.test(core) ||
    /^current$/i.test(core) ||
    /^quotidien$/i.test(core)
  if (onlyHeader) return 'current'

  if (/^aim[ée]s?$/i.test(core) || /^pr[ée]f[ée]r[ée]s?$/i.test(core) || /^likes$/i.test(core)) return 'likes'

  if (
    /^exclus?$/i.test(core) ||
    /^allerg/i.test(core) ||
    /^interdits?$/i.test(core) ||
    /^dislikes$/i.test(core) ||
    /^je\s+n['']aime\s+pas$/i.test(core)
  )
    return 'dislikes'

  return null
}

/** "ACTUEL: poulet, riz" ou "AIMÉS : saumon" */
function matchInlineSection(line) {
  const m = line.match(
    /^(actuels?|aliments?\s+actuels?|consommés?|aim[ée]s?|pr[ée]f[ée]r[ée]s?|exclus?|allerg(?:ies|ie)?|interdits?)\s*:\s*(.+)$/i
  )
  if (!m) return null
  const h = m[1].toLowerCase()
  const rest = m[2]
  let key = null
  if (/actuel|consomm|quotidien/.test(h)) key = 'current'
  else if (/aim|préfér|prefér/.test(h)) key = 'likes'
  else if (/exclus|allerg|interdit/.test(h)) key = 'dislikes'
  if (!key) return null
  return { key, items: splitItemChunk(rest) }
}

/**
 * @returns {{ structured: true, current: string[], likes: string[], dislikes: string[] } | { structured: false, items: string[] }}
 */
export function parseFoodListFromText(text) {
  if (!text || typeof text !== 'string') {
    return { structured: false, items: [] }
  }

  const lines = text.split(/\r?\n/)
  let section = null
  const buckets = { current: [], likes: [], dislikes: [] }
  let foundSectionHeader = false
  const flatFallback = []

  for (const raw of lines) {
    let line = raw.trim()
    if (!line) continue
    if (line.startsWith('//')) continue
    if (line.startsWith('#')) {
      const fromHash = matchSectionHeader(line)
      if (fromHash) {
        section = fromHash
        foundSectionHeader = true
        continue
      }
      continue
    }

    const inline = matchInlineSection(line)
    if (inline) {
      foundSectionHeader = true
      buckets[inline.key].push(...inline.items)
      continue
    }

    const headerOnly = matchSectionHeader(line)
    if (headerOnly) {
      section = headerOnly
      foundSectionHeader = true
      continue
    }

    if (section) {
      buckets[section].push(...splitItemChunk(line))
      continue
    }

    flatFallback.push(...splitItemChunk(line))
  }

  const totalStructured =
    buckets.current.length + buckets.likes.length + buckets.dislikes.length

  if (foundSectionHeader) {
    return {
      structured: true,
      current: dedupe(buckets.current),
      likes: dedupe(buckets.likes),
      dislikes: dedupe(buckets.dislikes),
    }
  }

  return { structured: false, items: dedupe(flatFallback) }
}

export function mergeFoodLists(existing, incoming, replace) {
  if (replace) return dedupe(incoming)
  return dedupe([...existing, ...incoming])
}
