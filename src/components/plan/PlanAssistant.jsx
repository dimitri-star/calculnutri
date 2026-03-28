import { useState, useRef, useEffect } from 'react'
// eslint-disable-next-line no-unused-vars -- motion used as <motion.div /> etc.
import { motion } from 'framer-motion'
import { Paperclip, Send } from 'lucide-react'
import { callAnthropic, parseWeekPlanStrict, applyWeekPlanUpdate } from '../../lib/anthropic.js'
import { buildAssistantSystemPrompt } from '../../lib/assistantSystemPrompt.js'
import { DAYS } from '../../constants/nutrition.js'

const EXPERT_PROMPTS = [
  { pill: 'Timing & entraînement', message: 'Comment structurer mes repas autour de la musculation (pré et post séance) pour la perf et la récup ?' },
  { pill: 'Sommeil & récup', message: 'Quels repères alimentaires ou habitudes peuvent aider le sommeil et la récup musculaire ?' },
  { pill: 'Protéines & objectif', message: 'Comment savoir si j\'apporte assez de protéines pour mon poids et mon objectif (sèche / masse / maintien) ?' },
  { pill: 'Hydratation', message: 'Hydratation et électrolytes : que recommander pour quelqu\'un qui s\'entraîne plusieurs fois par semaine ?' },
  { pill: 'FODMAP / digestion', message: 'En quelques lignes : à quoi servent les FODMAP et comment adapter l\'alimentation si on a des troubles digestifs ?' },
]

const PLAN_PROMPTS = [
  { pill: 'Moins de glucides le soir', message: 'Je veux moins de glucides le soir sur toute la semaine, en gardant mes calories et protéines.' },
  { pill: 'Varier les protéines', message: 'Varie les sources de protéines sur la semaine, c\'est trop répétitif.' },
  { pill: 'Sans poisson', message: "Je n'aime pas le poisson : remplace tous les repas poisson par des alternatives (viande blanche, œufs, légumineuses)." },
  { pill: 'Équilibrer la semaine', message: 'Échange ou décale les repas les plus caloriques entre les jours pour mieux équilibrer la semaine.' },
]

/** Démo : remplace un repas "lourd" (ex. canard) par du poisson, ou le dîner du samedi. */
function demoReschedulePlan(weekPlan) {
  const copy = JSON.parse(JSON.stringify(weekPlan || {}))
  const needle = /canard|magret|duck/i
  for (const d of DAYS) {
    const day = copy[d]
    if (!day) continue
    for (const mk of ['Dîner', 'Déjeuner', 'Collation', 'Petit-déjeuner']) {
      const meal = day[mk]
      if (!meal?.aliments) continue
      const joined = Array.isArray(meal.aliments) ? meal.aliments.join(' ') : String(meal.aliments)
      if (needle.test(joined)) {
        meal.aliments = ["180g dos de cabillaud (cru)", "Courgettes poêlées", "120g quinoa (cru)", "1 cs huile d'olive"]
        meal.proteines = Math.round(Number(meal.proteines) || 40)
        meal.glucides = Math.round(Number(meal.glucides) || 35)
        meal.lipides = Math.round(Number(meal.lipides) || 14)
        meal.calories = Math.round(Number(meal.calories) || 520)
        return {
          plan: copy,
          msg: `Exemple démo : j'ai remplacé ce repas (canard / magret) par du cabillaud et des accompagnements sur ${d} (${mk}). Avec ta clé API, dis-moi simplement ce que tu n'aimes pas et j'adapte toute la semaine.`,
        }
      }
    }
  }
  if (copy.Samedi?.Dîner) {
    const m = copy.Samedi.Dîner
    m.aliments = ["180g saumon (cru)", "Riz complet 100g (cru)", "Brocoli vapeur", "1 cs huile d'olive"]
    m.calories = 560
    m.proteines = 42
    m.glucides = 52
    m.lipides = 18
    return {
      plan: copy,
      msg: "Exemple démo : j'ai réorganisé le dîner du samedi (saumon, riz, légumes). Configure VITE_ANTHROPIC_API_KEY pour que je réponde à tes vraies préférences sur tout le plan.",
    }
  }
  return {
    plan: copy,
    msg: 'Mode démo : ajoute une clé API Anthropic dans .env pour que je modifie le plan selon ce que tu écris.',
  }
}

/**
 * @param {{ weekPlan?: object | null, setWeekPlan?: (p: object) => void, results: object, foods: object, profile: object, layout?: 'page' | 'embedded' }} props
 */
export default function PlanAssistant({
  weekPlan = null,
  setWeekPlan,
  results,
  foods,
  profile,
  layout = 'page',
}) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        "Je suis ton coach nutrition NutriCalc : pose-moi n'importe quelle question (timing des repas, protéines, sèche/masse, digestion, récupération, etc.) comme à un expert.\n\nQuand tu auras un plan 7 jours généré dans l'app, tu pourras aussi me demander de réorganiser la semaine (aliments, jours, repas) — j'adapterai en respectant tes objectifs et tes listes d'aliments.",
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  const hasPlan = weekPlan && typeof weekPlan === 'object' && Object.keys(weekPlan).length > 0

  const messagesMaxHeight = layout === 'page' ? 480 : 320

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function handleSend() {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    setMessages((m) => [...m, { role: 'user', content: text }])
    setLoading(true)

    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
    const useDemo = !apiKey || apiKey === 'sk-ant-votre-cle-ici'

    try {
      if (useDemo) {
        await new Promise((r) => setTimeout(r, 1000))
        if (!hasPlan) {
          setMessages((m) => [
            ...m,
            {
              role: 'assistant',
              content:
                "Exemple démo : avec une clé API Anthropic dans `.env`, je réponds à tes questions comme un expert (macros, timing, sommeil, digestion…). Génère aussi un plan sur **Plan alimentaire** pour que je puisse le modifier quand tu le demandes.",
            },
          ])
          return
        }
        const { plan, msg } = demoReschedulePlan(weekPlan)
        setWeekPlan?.(plan)
        setMessages((m) => [...m, { role: 'assistant', content: msg }])
        return
      }

      const apiMessages = messages
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .slice(1)
        .map((m) => ({ role: m.role, content: m.content }))
      apiMessages.push({ role: 'user', content: text })

      const systemPrompt = buildAssistantSystemPrompt({
        profile: profile ?? {},
        results: results ?? {},
        foods: foods ?? {},
        weekPlan: hasPlan ? weekPlan : {},
      })
      const raw = await callAnthropic(apiMessages, 'analysis', {
        max_tokens: 8192,
        timeoutMs: 120000,
        system: systemPrompt,
      })

      if (hasPlan && setWeekPlan) {
        const jsonMarkerIdx = raw.indexOf('---JSON---')
        if (jsonMarkerIdx !== -1) {
          const explanation = raw.slice(0, jsonMarkerIdx).trim()
          const jsonPart = raw.slice(jsonMarkerIdx + 10).trim()
          const parsed = parseWeekPlanStrict(jsonPart)
          if (parsed) {
            const { plan: next, changed } = applyWeekPlanUpdate(parsed, weekPlan)
            if (changed) {
              setWeekPlan(next)
              setMessages((m) => [
                ...m,
                { role: 'assistant', content: explanation + '\n\n✅ Plan mis à jour automatiquement.' },
              ])
              return
            }
          }
        }
      }

      setMessages((m) => [...m, { role: 'assistant', content: raw.replace('---JSON---', '').trim() }])
    } catch (e) {
      setMessages((m) => [...m, { role: 'assistant', content: `Erreur : ${e.message || String(e)}` }])
    } finally {
      setLoading(false)
    }
  }

  const sendDisabled = loading || !input.trim()

  const chipBase = {
    padding: '8px 14px',
    borderRadius: 9999,
    fontSize: 12,
    fontWeight: 600,
    fontFamily: 'inherit',
    cursor: 'pointer',
    border: '1px solid var(--accent-border)',
    background: 'transparent',
    color: 'var(--accent)',
    transition: 'background 0.15s, border-color 0.15s',
  }

  const chipDisabled = {
    ...chipBase,
    cursor: 'not-allowed',
    opacity: 0.45,
  }

  return (
    <section
      aria-label="Coach nutrition IA"
      style={{
        width: '100%',
        border: '1px solid var(--line)',
        borderRadius: 'var(--radius-card)',
        background: 'var(--card)',
        boxShadow: 'var(--shadow-soft)',
        padding: '22px 26px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 14,
          marginBottom: 18,
          paddingBottom: 18,
          borderBottom: '1px solid var(--line)',
        }}
      >
        <span style={{ fontSize: 26, lineHeight: 1 }} aria-hidden>
          🤖
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <h2
              style={{
                margin: 0,
                fontSize: 18,
                fontWeight: 800,
                color: 'var(--text)',
                letterSpacing: '-0.02em',
              }}
            >
              NutriCalc IA
            </h2>
            <span
              title="Disponible"
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: 'var(--accent)',
                boxShadow: '0 0 0 3px var(--accent-soft)',
                flexShrink: 0,
              }}
            />
          </div>
          <p style={{ margin: '6px 0 0', fontSize: 12, fontWeight: 600, color: 'var(--muted)', lineHeight: 1.45 }}>
            Questions expert + adaptation du plan 7 jours · Propulsé par Claude
          </p>
        </div>
      </div>

      <div
        style={{
          maxHeight: messagesMaxHeight,
          minHeight: 120,
          overflowY: 'auto',
          padding: '4px 2px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: 'min(92%, 900px)',
              padding: '10px 14px',
              borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
              background: msg.role === 'user' ? 'var(--accent-soft)' : 'var(--surface-input)',
              border: `1px solid ${msg.role === 'user' ? 'var(--accent-border)' : 'var(--line)'}`,
              fontSize: 13,
              lineHeight: 1.55,
              color: 'var(--text)',
              fontWeight: 500,
              whiteSpace: 'pre-wrap',
            }}
          >
            {msg.content}
          </motion.div>
        ))}

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              alignSelf: 'flex-start',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 14px',
              borderRadius: 18,
              background: 'var(--surface-input)',
              border: '1px solid var(--line)',
            }}
          >
            {[0, 1, 2].map((d) => (
              <motion.span
                key={d}
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: 'var(--accent)',
                }}
                animate={{ opacity: [0.35, 1, 0.35], scale: [1, 1.15, 1] }}
                transition={{ repeat: Infinity, duration: 0.9, delay: d * 0.16 }}
              />
            ))}
            <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600, marginLeft: 4 }}>
              Réflexion…
            </span>
          </motion.div>
        )}
        <div ref={bottomRef} style={{ height: 1, flexShrink: 0 }} />
      </div>

      <div style={{ marginBottom: 12 }}>
        <p
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: 'var(--muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            margin: '0 0 8px',
          }}
        >
          Questions expert
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {EXPERT_PROMPTS.map(({ pill, message }) => (
            <button
              key={pill}
              type="button"
              style={chipBase}
              onClick={() => {
                setInput(message)
                inputRef.current?.focus()
              }}
            >
              {pill}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <p
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: 'var(--muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            margin: '0 0 8px',
          }}
        >
          Modifier le plan {hasPlan ? '' : '(génère un plan 7 jours avant)'}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {PLAN_PROMPTS.map(({ pill, message }) => (
            <button
              key={pill}
              type="button"
              style={hasPlan ? chipBase : chipDisabled}
              disabled={!hasPlan}
              onClick={() => {
                setInput(message)
                inputRef.current?.focus()
              }}
            >
              {pill}
            </button>
          ))}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px 12px 10px 14px',
          borderRadius: 9999,
          border: '1px solid var(--line)',
          background: 'var(--surface-input)',
        }}
      >
        <button
          type="button"
          aria-label="Pièce jointe (bientôt)"
          disabled
          style={{
            flexShrink: 0,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 6,
            border: 'none',
            borderRadius: 12,
            background: 'transparent',
            color: 'var(--muted)',
            cursor: 'not-allowed',
            opacity: 0.5,
          }}
        >
          <Paperclip size={20} strokeWidth={2} />
        </button>
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSend()
            }
          }}
          placeholder="Question nutrition, conseil… ou demande de changer ton plan (si tu en as un)."
          rows={1}
          style={{
            flex: 1,
            minWidth: 0,
            minHeight: 44,
            maxHeight: 120,
            padding: '10px 4px',
            border: 'none',
            background: 'transparent',
            fontSize: 14,
            fontFamily: 'inherit',
            resize: 'none',
            outline: 'none',
            color: 'var(--text)',
            lineHeight: 1.45,
          }}
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={sendDisabled}
          aria-label="Envoyer"
          style={{
            flexShrink: 0,
            width: 46,
            height: 46,
            borderRadius: '50%',
            border: 'none',
            cursor: sendDisabled ? 'not-allowed' : 'pointer',
            background: sendDisabled ? 'var(--line)' : 'var(--accent)',
            color: sendDisabled ? 'var(--muted)' : '#fff',
            boxShadow: sendDisabled ? 'none' : '0 4px 14px rgba(255, 122, 0, 0.35)',
            opacity: sendDisabled ? 0.55 : 1,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          }}
        >
          <Send size={20} strokeWidth={2.25} />
        </button>
      </div>

      <p
        style={{
          margin: '14px 0 0',
          textAlign: 'center',
          fontSize: 11,
          fontWeight: 600,
          color: 'var(--muted)',
          lineHeight: 1.5,
        }}
      >
        Propulsé par Anthropic Claude · Conseils personnalisés selon ton profil ; le plan n&apos;est modifié que si tu le demandes et qu&apos;un plan 7 jours est chargé.
      </p>
    </section>
  )
}
