'use client'

import type { AgentConfig } from '../types'

interface AgentCardProps {
  index: number
  agent: AgentConfig
  onChange: (index: number, field: keyof AgentConfig, value: string) => void
  onRemove: (index: number) => void
  canRemove: boolean
}

export function AgentCard({ index, agent, onChange, onRemove, canRemove }: AgentCardProps) {
  return (
    <div className="agent-card animate-slide-up" style={{
      background: 'var(--surface2)',
      border: '1px solid var(--border)',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '12px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            background: 'var(--accent-glow)',
            border: '1px solid var(--accent)',
            color: 'var(--accent)',
            borderRadius: '6px',
            padding: '2px 10px',
            fontSize: '12px',
            fontWeight: 600,
          }}>
            Agent {index + 1}
          </span>
          <span style={{ color: 'var(--muted)', fontSize: '13px' }}>
            {agent.role || 'İsimsiz'}
          </span>
        </div>
        {canRemove && (
          <button onClick={() => onRemove(index)} title="Sil" style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--muted)', fontSize: '18px', lineHeight: 1,
            padding: '4px 8px', borderRadius: '6px',
            transition: 'color 0.15s',
          }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--red)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
          >
            ×
          </button>
        )}
      </div>

      <Field label="Rol" placeholder="örn. Araştırmacı, Yazar, Analist..."
        value={agent.role}
        onChange={v => onChange(index, 'role', v)}
      />
      <Field label="Hedef" placeholder="Bu agent ne yapmak istiyor?"
        value={agent.goal} multiline
        onChange={v => onChange(index, 'goal', v)}
      />
      <Field label="Arka Plan" placeholder="Uzmanlık alanı, deneyimi..."
        value={agent.backstory} multiline last
        onChange={v => onChange(index, 'backstory', v)}
      />
    </div>
  )
}

function Field({ label, placeholder, value, onChange, multiline, last }: {
  label: string
  placeholder: string
  value: string
  onChange: (v: string) => void
  multiline?: boolean
  last?: boolean
}) {
  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: '10px 12px',
    color: 'var(--text)',
    fontSize: '14px',
    outline: 'none',
    resize: multiline ? 'vertical' : 'none',
    fontFamily: 'inherit',
    lineHeight: 1.5,
    minHeight: multiline ? '72px' : undefined,
  }

  return (
    <div style={{ marginBottom: last ? 0 : '14px' }}>
      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </label>
      {multiline ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={inputStyle}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={inputStyle}
        />
      )}
    </div>
  )
}
