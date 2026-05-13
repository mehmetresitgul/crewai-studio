'use client'

import { useState, useCallback } from 'react'
import type { AgentConfig, TaskConfig, LLMConfig, RunStatus, StreamEvent } from '../types'

const BACKEND = 'http://localhost:8000'

export function useCrew() {
  const [status, setStatus] = useState<RunStatus>('idle')
  const [progress, setProgress] = useState('')
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const run = useCallback(async (
    agents: AgentConfig[],
    tasks: TaskConfig[],
    llm: LLMConfig,
  ) => {
    setStatus('running')
    setProgress('Bağlanıyor...')
    setResult(null)
    setError(null)

    try {
      const res = await fetch(`${BACKEND}/api/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agents, tasks, llm }),
      })

      if (!res.ok) throw new Error(`Backend hatası: ${res.status}`)
      if (!res.body) throw new Error('Stream alınamadı')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const raw = line.slice(6).trim()
          if (raw === '[DONE]') { setStatus('done'); continue }

          try {
            const event = JSON.parse(raw) as StreamEvent
            if (event.type === 'progress') setProgress(event.content)
            if (event.type === 'result') { setResult(event.content); setStatus('done') }
            if (event.type === 'error')  { setError(event.content);  setStatus('error') }
          } catch { /* ignore malformed lines */ }
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Bilinmeyen hata')
      setStatus('error')
    }
  }, [])

  const reset = useCallback(() => {
    setStatus('idle')
    setProgress('')
    setResult(null)
    setError(null)
  }, [])

  return { status, progress, result, error, run, reset }
}
