export interface AgentConfig {
  role: string
  goal: string
  backstory: string
}

export interface TaskConfig {
  description: string
  expected_output: string
  agent_index: number
}

export interface LLMConfig {
  model: string
  base_url: string
  api_key: string
}

export type StreamEvent =
  | { type: 'start'; content: string }
  | { type: 'progress'; content: string }
  | { type: 'result'; content: string }
  | { type: 'error'; content: string }

export type RunStatus = 'idle' | 'running' | 'done' | 'error'
