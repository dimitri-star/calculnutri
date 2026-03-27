import { useState } from 'react'
import Tag from '../ui/Tag.jsx'

export default function FoodTagInput({ label, description, tags, onChange, tagColor }) {
  const [input, setInput] = useState('')

  function addTag(val) {
    const trimmed = val.trim().toLowerCase()
    if (!trimmed || tags.includes(trimmed)) return
    onChange([...tags, trimmed])
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(input)
      setInput('')
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      onChange(tags.slice(0, -1))
    }
  }

  function removeTag(tag) {
    onChange(tags.filter((t) => t !== tag))
  }

  return (
    <div>
      <label style={{ display: 'block', fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
        {label}
      </label>
      {description && <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 10, fontWeight: 500 }}>{description}</p>}
      <div
        style={{
          minHeight: 56,
          padding: '10px 16px',
          borderRadius: 9999,
          border: '1px solid var(--line)',
          background: 'var(--surface-input)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          alignItems: 'center',
          cursor: 'text',
          boxShadow: 'inset 0 1px 2px rgba(26, 26, 26, 0.04)',
        }}
        onClick={() => document.getElementById(`tag-input-${label}`)?.focus()}
      >
        {tags.map((tag) => (
          <Tag key={tag} label={tag} onRemove={() => removeTag(tag)} color={tagColor} />
        ))}
        <input
          id={`tag-input-${label}`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            if (input.trim()) {
              addTag(input)
              setInput('')
            }
          }}
          placeholder={tags.length === 0 ? 'Tape et appuie sur Entrée…' : ''}
          style={{
            background: 'none',
            border: 'none',
            outline: 'none',
            color: 'var(--text)',
            fontSize: 14,
            minWidth: 140,
            flex: 1,
            fontFamily: 'inherit',
            fontWeight: 500,
          }}
        />
      </div>
    </div>
  )
}
