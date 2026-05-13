'use client'

import type { TaskConfig, AgentConfig } from '../types'

interface TaskCardProps {
  index: number
  task: TaskConfig
  agents: AgentConfig[]
  onChange: (index: number, field: keyof TaskConfig, value: string | number) => void
  onRemove: (index: number) => void
  canRemove: boolean
}

export function TaskCard({ index, task, agents, onChange, onRemove, canRemove }: TaskCardProps) {
  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: '10px 12px',
    color: 'var(--text)',
    fontSize: '14px',
    outline: 'none',
    fontFamily: 'inherit',
    lineHeight: 1.5,
  }

  return (
    <div className="animate-slide-up" style={{
      background: 'var(--surface2)',
      border: '1px solid var(--border)',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '12px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            background: 'rgba(61,214,140,0.1)',
            border: '1px solid var(--green)',
            color: 'var(--green)',
            borderRadius: '6px',
            padding: '2px 10px',
            fontSize: '12px',
            fontWeight: 600,
          }}>
            Task {index + 1}
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

      <div style={{ marginBottom: '14px' }}>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Agent
        </label>
        <select
          value={task.agent_index}
          onChange={e => onChange(index, 'agent_index', Number(e.target.value))}
          style={{ ...inputStyle, cursor: 'pointer' }}
        >
          {agents.map((a, i) => (
            <option key={i} value={i} style={{ background: 'var(--surface2)' }}>
              Agent {i + 1}{a.role ? ` — ${a.role}` : ''}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: '14px' }}>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Görev Tanımı
        </label>
        <textarea
          value={task.description}
          onChange={e => onChange(index, 'description', e.target.value)}
          placeholder="Bu agent ne yapmalı?"
          style={{ ...inputStyle, resize: 'vertical', minHeight: '90px' }}
        />
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Beklenen Çıktı
        </label>
        <textarea
          value={task.expected_output}
          onChange={e => onChange(index, 'expected_output', e.target.value)}
          placeholder="Sonuç nasıl görünmeli?"
          style={{ ...inputStyle, resize: 'vertical', minHeight: '60px' }}
        />
      </div>
    </div>
  )
}
