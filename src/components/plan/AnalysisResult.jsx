function parseAnalysis(text) {
  const result = { good: [], bad: [], deficiencies: [], superfoods: [] }
  if (!text) return result

  const lines = text.split('\n')
  let currentSection = null

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    // Section headers only — detected exclusively on lines starting with #
    if (trimmed.startsWith('#')) {
      if (trimmed.match(/BON|bon dans/i))            currentSection = 'good'
      else if (trimmed.match(/revoir|❌/i))          currentSection = 'bad'
      else if (trimmed.match(/carence|manque|🔬/i)) currentSection = 'deficiencies'
      else if (trimmed.match(/super|intégrer|💡/i)) currentSection = 'superfoods'
      else currentSection = null
      continue
    }

    if (!currentSection) continue

    const cleaned = trimmed.replace(/^[-•*]\s*/, '').trim()
    if (!cleaned || cleaned.length < 3) continue

    // Extract name: must be the first **...** on the line (anchored to start)
    const boldMatch = cleaned.match(/^\*\*(.+?)\*\*/)

    let name, rest

    if (boldMatch) {
      name = boldMatch[1].trim()
      rest = cleaned.slice(boldMatch[0].length).replace(/^\s*—\s*/, '').trim()
    } else {
      // Fallback: split on " — " and use first segment as name
      const parts = cleaned.split(/\s*—\s*/)
      name = parts[0].trim()
      rest = parts.slice(1).join(' — ').trim()
    }

    // Reject if the "name" is too long — it's a description, not a food name
    const wordCount = name.split(/\s+/).length
    if (wordCount > 4 || name.length > 40) continue

    // Extract substitute after " → "
    let desc = rest
    let substitute = null
    const arrowIdx = rest.indexOf('→')
    if (arrowIdx !== -1) {
      desc = rest.slice(0, arrowIdx).trim()
      substitute = rest.slice(arrowIdx + 1).trim()
        .replace(/^remplacer par\s*:?\s*/i, '')
        .replace(/\*\*/g, '')
    }

    desc = desc.replace(/\*\*/g, '').trim()
    name = name.replace(/\*/g, '').trim()

    if (!name) continue

    const item = { name, desc, substitute }

    if (currentSection === 'good')              result.good.push(item)
    else if (currentSection === 'bad')          result.bad.push(item)
    else if (currentSection === 'deficiencies') result.deficiencies.push(item)
    else if (currentSection === 'superfoods')   result.superfoods.push(item)
  }

  return result
}

export default function AnalysisResult({ text }) {
  const sections = parseAnalysis(text)

  return (
    <div className="analysis-cards">

      {sections.good.length > 0 && (
        <div className="analysis-card card-good">
          <div className="card-header">
            <span className="card-emoji">✅</span>
            <h3>Ce qui est BON dans ton alimentation</h3>
          </div>
          <div className="card-items">
            {sections.good.map((item, i) => (
              <div key={i} className="analysis-item">
                <span className="item-name">{item.name}</span>
                <span className="item-desc">{item.desc}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {sections.bad.length > 0 && (
        <div className="analysis-card card-bad">
          <div className="card-header">
            <span className="card-emoji">❌</span>
            <h3>Ce qui est à revoir</h3>
          </div>
          <div className="card-items">
            {sections.bad.map((item, i) => (
              <div key={i} className="analysis-item">
                <span className="item-name">{item.name}</span>
                <span className="item-desc">{item.desc}</span>
                {item.substitute && (
                  <span className="item-substitute">→ Remplacer par : {item.substitute}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {sections.deficiencies.length > 0 && (
        <div className="analysis-card card-deficiency">
          <div className="card-header">
            <span className="card-emoji">🔬</span>
            <h3>Carences nutritionnelles détectées</h3>
          </div>
          <div className="card-items">
            {sections.deficiencies.map((item, i) => (
              <div key={i} className="analysis-item">
                <span className="item-name">{item.name}</span>
                <span className="item-desc">{item.desc}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {sections.superfoods.length > 0 && (
        <div className="analysis-card card-superfoods">
          <div className="card-header">
            <span className="card-emoji">💡</span>
            <h3>Super-aliments à intégrer</h3>
          </div>
          <div className="card-items">
            {sections.superfoods.map((item, i) => (
              <div key={i} className="analysis-item">
                <span className="item-name">{item.name}</span>
                <span className="item-desc">{item.desc}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
