'use client'

import type { RunStatus } from '../types'

interface ResultPanelProps {
  status: RunStatus
  progress: string
  result: string | null
  error: string | null
  onReset: () => void
}

export function ResultPanel({ status, progress, result, error, onReset }: ResultPanelProps) {
  if (status === 'idle') return null

  return (
    <div className="animate-slide-up" style={{
      marginTop: '24px',
      background: 'var(--surface2)',
      border: `1px solid ${status === 'error' ? 'var(--red)' : status === 'done' ? 'var(--green)' : 'var(--border)'}`,
      borderRadius: '12px',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 20px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--surface)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {status === 'running' && (
            <span style={{ display: 'flex', gap: '3px' }}>
              {[0, 1, 2].map(i => (
                <span key={i} style={{
                  width: '6px', height: '6px',
                  borderRadius: '50%',
                  background: 'var(--accent)',
                  animation: `pulse-dot 1.2s ease-in-out ${i * 0.2}s infinite`,
                  display: 'inline-block',
                }} />
              ))}
            </span>
          )}
          {status === 'done'  && <span style={{ color: 'var(--green)',  fontSize: '16px' }}>✓</span>}
          {status === 'error' && <span style={{ color: 'var(--red)',    fontSize: '16px' }}>✕</span>}
          <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>
            {status === 'running' ? progress
           : status === 'done'    ? 'Tamamlandı'
           : 'Hata'}
          </span>
        </div>

        {status !== 'running' && (
          <button onClick={onReset} style={{
            background: 'none', border: '1px solid var(--border)',
            color: 'var(--muted)', borderRadius: '6px',
            padding: '4px 12px', fontSize: '12px', cursor: 'pointer',
            transition: 'all 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.borderColor = 'var(--muted)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.borderColor = 'var(--border)' }}
          >
            Temizle
          </button>
        )}
      </div>

      {/* Body */}
      {error && (
        <div style={{ padding: '20px', color: 'var(--red)', fontSize: '14px', lineHeight: 1.6 }}>
          {error}
        </div>
      )}

      {result && (
        <div style={{ padding: '24px' }}>
          <div
            className="prose-result"
            style={{ fontSize: '15px', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}
          >
            {result}
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(result)}
            style={{
              marginTop: '20px',
              background: 'none',
              border: '1px solid var(--border)',
              color: 'var(--muted)',
              borderRadius: '6px',
              padding: '6px 14px',
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.borderColor = 'var(--muted)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.borderColor = 'var(--border)' }}
          >
            Kopyala
          </button>
        </div>
      )}
    </div>
  )
}
