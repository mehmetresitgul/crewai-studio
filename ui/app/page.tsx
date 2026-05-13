'use client'

import { useState } from 'react'
import { AgentCard } from './components/AgentCard'
import { TaskCard } from './components/TaskCard'
import { ResultPanel } from './components/ResultPanel'
import { useCrew } from './hooks/useCrew'
import type { AgentConfig, TaskConfig, LLMConfig } from './types'

const DEFAULT_LLM: LLMConfig = {
  model: 'openai/claude-sonnet-4-6',
  base_url: 'https://app.claude.gg/',
  api_key: 'sk-e3455b976eca4f05a0c6d9c3045cc9bb',
}

type Tab = 'agents' | 'tasks' | 'settings'

export default function Home() {
  const [tab, setTab] = useState<Tab>('agents')
  const [llm, setLlm] = useState<LLMConfig>(DEFAULT_LLM)
  const [agents, setAgents] = useState<AgentConfig[]>([
    { role: 'Researcher', goal: 'Research the given topic thoroughly and provide accurate information.', backstory: 'You are an expert researcher with years of experience.' },
  ])
  const [tasks, setTasks] = useState<TaskConfig[]>([
    { description: 'Research and summarize the topic given below. Be detailed and informative. Answer in Turkish.', expected_output: 'A detailed Turkish summary with key points.', agent_index: 0 },
  ])

  const { status, progress, result, error, run, reset } = useCrew()

  const addAgent = () => setAgents(prev => [...prev, { role: '', goal: '', backstory: '' }])
  const removeAgent = (i: number) => setAgents(prev => prev.filter((_, idx) => idx !== i))
  const updateAgent = (i: number, field: keyof AgentConfig, value: string) =>
    setAgents(prev => prev.map((a, idx) => idx === i ? { ...a, [field]: value } : a))

  const addTask = () => setTasks(prev => [...prev, { description: '', expected_output: '', agent_index: 0 }])
  const removeTask = (i: number) => setTasks(prev => prev.filter((_, idx) => idx !== i))
  const updateTask = (i: number, field: keyof TaskConfig, value: string | number) =>
    setTasks(prev => prev.map((t, idx) => idx === i ? { ...t, [field]: value } : t))

  const canRun = agents.every(a => a.role && a.goal) && tasks.every(t => t.description)

  const tabBtn = (t: Tab, label: string): React.CSSProperties => ({
    padding: '8px 18px',
    borderRadius: '8px 8px 0 0',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    border: 'none',
    background: tab === t ? 'var(--surface2)' : 'none',
    color: tab === t ? 'var(--accent)' : 'var(--muted)',
    borderBottom: tab === t ? '2px solid var(--accent)' : '2px solid transparent',
    transition: 'all 0.15s',
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

      {/* Topbar */}
      <header style={{
        borderBottom: '1px solid var(--border)',
        padding: '0 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '56px',
        position: 'sticky',
        top: 0,
        background: 'rgba(15,15,23,0.9)',
        backdropFilter: 'blur(12px)',
        zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px' }}>🤖</span>
          <span style={{ fontWeight: 700, fontSize: '16px', letterSpacing: '-0.01em' }}>CrewAI Studio</span>
          <span style={{ fontSize: '11px', color: 'var(--muted)', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '4px', padding: '1px 7px' }}>
            beta
          </span>
        </div>
        <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
          {agents.length} agent · {tasks.length} task
        </span>
      </header>

      {/* Body */}
      <div style={{ display: 'flex', flex: 1, maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '0 24px' }}>

        {/* Main */}
        <main style={{ flex: 1, paddingTop: '28px', paddingBottom: '80px', paddingRight: '28px' }}>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '2px', marginBottom: '0', borderBottom: '1px solid var(--border)' }}>
            {(['agents', 'tasks', 'settings'] as Tab[]).map(t => (
              <button key={t} style={tabBtn(t, t)} onClick={() => setTab(t)}>
                {t === 'agents' ? '👥 Agents' : t === 'tasks' ? '📋 Tasks' : '⚙️ Ayarlar'}
              </button>
            ))}
          </div>

          <div style={{ paddingTop: '20px' }}>

            {/* Agents Tab */}
            {tab === 'agents' && (
              <div>
                {agents.map((agent, i) => (
                  <AgentCard key={i} index={i} agent={agent} onChange={updateAgent} onRemove={removeAgent} canRemove={agents.length > 1} />
                ))}
                <button onClick={addAgent} style={{
                  width: '100%', padding: '12px',
                  background: 'none', border: '1px dashed var(--border)',
                  borderRadius: '10px', color: 'var(--muted)',
                  fontSize: '13px', cursor: 'pointer', transition: 'all 0.15s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)' }}
                >+ Agent Ekle</button>
              </div>
            )}

            {/* Tasks Tab */}
            {tab === 'tasks' && (
              <div>
                {tasks.map((task, i) => (
                  <TaskCard key={i} index={i} task={task} agents={agents} onChange={updateTask} onRemove={removeTask} canRemove={tasks.length > 1} />
                ))}
                <button onClick={addTask} style={{
                  width: '100%', padding: '12px',
                  background: 'none', border: '1px dashed var(--border)',
                  borderRadius: '10px', color: 'var(--muted)',
                  fontSize: '13px', cursor: 'pointer', transition: 'all 0.15s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.color = 'var(--green)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)' }}
                >+ Task Ekle</button>
              </div>
            )}

            {/* Settings Tab */}
            {tab === 'settings' && (
              <div style={{ maxWidth: '520px' }}>
                <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '20px' }}>
                  crewAI backend'in kullandığı LLM bağlantı ayarları.
                </p>
                {(['model', 'base_url', 'api_key'] as (keyof LLMConfig)[]).map(field => (
                  <div key={field} style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {field === 'api_key' ? 'API Key' : field === 'base_url' ? 'Base URL' : 'Model'}
                    </label>
                    <input
                      type={field === 'api_key' ? 'password' : 'text'}
                      value={llm[field]}
                      onChange={e => setLlm(prev => ({ ...prev, [field]: e.target.value }))}
                      style={{
                        width: '100%', background: 'var(--surface2)',
                        border: '1px solid var(--border)', borderRadius: '8px',
                        padding: '10px 12px', color: 'var(--text)',
                        fontSize: '14px', outline: 'none', fontFamily: 'inherit',
                      }}
                    />
                  </div>
                ))}
              </div>
            )}

            <ResultPanel status={status} progress={progress} result={result} error={error} onReset={reset} />
          </div>
        </main>

        {/* Sidebar */}
        <aside style={{
          width: '240px',
          paddingTop: '28px',
          position: 'sticky',
          top: '56px',
          height: 'calc(100vh - 56px)',
          overflowY: 'auto',
        }}>
          <div style={{
            background: 'var(--surface2)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '18px',
          }}>
            <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '14px' }}>
              Özet
            </p>

            <div style={{ marginBottom: '14px' }}>
              {agents.map((a, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '10px', background: 'var(--accent-glow)', color: 'var(--accent)', border: '1px solid var(--accent)', borderRadius: '4px', padding: '1px 6px', fontWeight: 700, whiteSpace: 'nowrap', marginTop: '2px' }}>A{i + 1}</span>
                  <span style={{ fontSize: '13px', color: a.role ? 'var(--text)' : 'var(--muted)', lineHeight: 1.4 }}>{a.role || 'İsimsiz'}</span>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px', marginBottom: '18px' }}>
              {tasks.map((t, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '10px', background: 'rgba(61,214,140,0.1)', color: 'var(--green)', border: '1px solid var(--green)', borderRadius: '4px', padding: '1px 6px', fontWeight: 700, whiteSpace: 'nowrap', marginTop: '2px' }}>T{i + 1}</span>
                  <span style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.4 }}>
                    {t.description ? t.description.slice(0, 48) + (t.description.length > 48 ? '…' : '') : 'Boş'}
                  </span>
                </div>
              ))}
            </div>

            {!canRun && (
              <p style={{ fontSize: '12px', color: 'var(--yellow)', marginBottom: '10px', lineHeight: 1.5 }}>
                Tüm rol/hedef ve görev alanları dolu olmalı.
              </p>
            )}

            <button
              onClick={() => run(agents, tasks, llm)}
              disabled={!canRun || status === 'running'}
              style={{
                width: '100%', padding: '11px',
                borderRadius: '9px', border: 'none',
                background: canRun && status !== 'running'
                  ? 'linear-gradient(135deg, #7c6af7, #a78bfa)'
                  : 'var(--surface)',
                color: canRun && status !== 'running' ? '#fff' : 'var(--muted)',
                fontWeight: 700, fontSize: '14px',
                cursor: canRun && status !== 'running' ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s',
                boxShadow: canRun && status !== 'running' ? '0 4px 20px rgba(124,106,247,0.35)' : 'none',
              }}
            >
              {status === 'running' ? 'Çalışıyor…' : '▶ Kickoff'}
            </button>

            <p style={{ fontSize: '11px', color: 'var(--muted)', textAlign: 'center', marginTop: '10px' }}>
              {llm.model.split('/').pop()}
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
