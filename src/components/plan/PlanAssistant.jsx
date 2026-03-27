import { useState, useRef, useEffect } from 'react'
import { callAnthropic, parseWeekPlanStrict, applyWeekPlanUpdate } from '../../lib/anthropic.js'
import { buildPlanChatPrompt } from '../../lib/prompts.js'
import { DAYS } from '../../constants/nutrition.js'
import Button from '../ui/Button.jsx'
import Spinner from '../ui/Spinner.jsx'

function buildTranscript(messages) {
  return messages
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => `${m.role === 'user' ? 'Utilisateur' : 'Assistant'}: ${m.content}`)
    .join('\n')
}

/** Démo : remplace un repas “lourd” (ex. canard) par du poisson, ou le dîner du samedi. */
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
        meal.aliments = ['180g dos de cabillaud (cru)', 'Courgettes poêlées', '120g quinoa (cru)', '1 cs huile d’olive']
        meal.proteines = Math.round(Number(meal.proteines) || 40)
        meal.glucides = Math.round(Number(meal.glucides) || 35)
        meal.lipides = Math.round(Number(meal.lipides) || 14)
        meal.calories = Math.round(Number(meal.calories) || 520)
        return {
          plan: copy,
          msg: `Exemple démo : j’ai remplacé ce repas (canard / magret) par du cabillaud et des accompagnements sur ${d} (${mk}). Avec ta clé API, dis-moi simplement ce que tu n’aimes pas et j’adapte toute la semaine.`,
        }
      }
    }
  }
  if (copy.Samedi?.Dîner) {
    const m = copy.Samedi.Dîner
    m.aliments = ['180g saumon (cru)', 'Riz complet 100g (cru)', 'Brocoli vapeur', '1 cs huile d’olive']
    m.calories = 560
    m.proteines = 42
    m.glucides = 52
    m.lipides = 18
    return {
      plan: copy,
      msg: 'Exemple démo : j’ai réorganisé le dîner du samedi (saumon, riz, légumes). Configure VITE_ANTHROPIC_API_KEY pour que je réponde à tes vraies préférences sur tout le plan.',
    }
  }
  return {
    plan: copy,
    msg: 'Mode démo : ajoute une clé API Anthropic dans .env pour que je modifie le plan selon ce que tu écris.',
  }
}

export default function PlanAssistant({ weekPlan, setWeekPlan, results, foods }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        'Le plan est généré automatiquement : tu n’as rien à modifier à la main. Dis-moi ce qui ne te plaît pas (aliment, repas, jour) et je réorganise la semaine : remplacements, échanges entre jours, ou repas déplacés ailleurs tout en gardant tes objectifs.',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function handleSend() {
    const text = input.trim()
    if (!text || loading || !weekPlan) return
    setInput('')
    const transcript = buildTranscript(messages)
    setMessages((m) => [...m, { role: 'user', content: text }])
    setLoading(true)

    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
    const useDemo = !apiKey || apiKey === 'sk-ant-votre-cle-ici'

    try {
      if (useDemo) {
        await new Promise((r) => setTimeout(r, 1000))
        const { plan, msg } = demoReschedulePlan(weekPlan)
        setWeekPlan(plan)
        setMessages((m) => [...m, { role: 'assistant', content: msg }])
        return
      }

      const prompt = buildPlanChatPrompt(weekPlan, results, foods, transcript, text)
      const raw = await callAnthropic(prompt, 'analysis', { max_tokens: 8192, timeoutMs: 120000 })
      const parsed = parseWeekPlanStrict(raw)
      if (!parsed) {
        setMessages((m) => [
          ...m,
          {
            role: 'assistant',
            content:
              'Je n’ai pas reçu un JSON de plan valide. Réessaie avec une demande simple, ou reformule.',
          },
        ])
        return
      }
      const { plan: next, changed } = applyWeekPlanUpdate(parsed, weekPlan)
      if (!changed) {
        setMessages((m) => [
          ...m,
          {
            role: 'assistant',
            content:
              'Je n’ai pas pu appliquer une mise à jour (réponse incomplète). Réessaie en une phrase claire, ex. : « Enlève le porc » ou « Je déteste le thon, propose autre chose ».',
          },
        ])
        return
      }
      setWeekPlan(next)
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          content:
            'C’est fait : le plan sur 7 jours a été mis à jour. Parcours les jours pour voir où j’ai déplacé ou remplacé les repas. Tu peux enchaîner avec une autre demande si besoin.',
        },
      ])
    } catch (e) {
      setMessages((m) => [...m, { role: 'assistant', content: `Erreur : ${e.message || String(e)}` }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        border: '1px solid var(--line)',
        borderRadius: 22,
        background: 'var(--surface-input)',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: 520,
        minHeight: 300,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '14px 16px',
          borderBottom: '1px solid var(--line)',
          background: 'var(--card)',
        }}
      >
        <strong style={{ fontSize: 14, color: 'var(--text)', display: 'block' }}>Assistant plan</strong>
        <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>
          Dis ce que tu n’aimes pas → l’IA réorganise toute la semaine
        </span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '92%',
              padding: '10px 14px',
              borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
              background: msg.role === 'user' ? 'var(--accent-soft)' : 'var(--card)',
              border: `1px solid ${msg.role === 'user' ? 'var(--accent-border)' : 'var(--line)'}`,
              fontSize: 13,
              lineHeight: 1.5,
              color: 'var(--text)',
              fontWeight: 500,
              whiteSpace: 'pre-wrap',
            }}
          >
            {msg.content}
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--muted)', fontSize: 13 }}>
            <Spinner size={18} /> Réorganisation du plan…
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{ padding: '12px', borderTop: '1px solid var(--line)', background: 'var(--card)' }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSend()
            }
          }}
          placeholder="Ex. Je n’aime pas le magret samedi — mets du poisson et décale le repas riche au dimanche…"
          rows={2}
          style={{
            width: '100%',
            padding: '12px 14px',
            borderRadius: 16,
            border: '1px solid var(--line)',
            background: 'var(--surface-input)',
            fontSize: 13,
            fontFamily: 'inherit',
            resize: 'none',
            marginBottom: 10,
            outline: 'none',
          }}
        />
        <Button style={{ width: '100%', justifyContent: 'center' }} onClick={handleSend} disabled={loading || !input.trim()}>
          {loading ? 'Envoi…' : 'Envoyer'}
        </Button>
      </div>
    </div>
  )
}
