export type NodeStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'executing' | 'success' | 'error' | 'ready'

export interface Position {
  x: number
  y: number
}

export interface ThoughtNodeData {
  label: string
  content: string
  timestamp: string
  status: NodeStatus
}

export interface ActNodeData {
  label: string
  tool_name: string
  tool_description: string
  input_schema: Record<string, any>
  input_params?: Record<string, any>
  output?: any
  status: NodeStatus
  error_message?: string
  timestamp: string
}

export interface ObserveNodeData {
  label: string
  observation: any
  interpretation: string
  needs_evolution: boolean
  timestamp: string
}

export interface SkillNodeData {
  label: string
  skill_id: string
  inputs?: Record<string, any>
  outputs?: Record<string, any>
  status: NodeStatus
  timestamp: string
}

export interface FlowNode {
  id: string
  type: 'thought' | 'act' | 'observe' | 'skill'
  position: Position
  data: ThoughtNodeData | ActNodeData | ObserveNodeData | SkillNodeData
}

export interface FlowEdge {
  id: string
  source: string
  target: string
  type?: string
  animated?: boolean
  label?: string
  style?: Record<string, any>
  data?: Record<string, any>
}

export interface MCPTool {
  name: string
  description: string
  input_schema: Record<string, any>
  endpoint?: string
  handler?: string
  timeout: number
}

export interface SkillWorkflow {
  nodes: any[]
  edges: any[]
}

export interface Skill {
  skill_id: string
  name: string
  description: string
  category: string
  created_at: string
  success_count: number
  workflow: SkillWorkflow
  input_schema: Record<string, any>
  output_schema: Record<string, any>
  code?: string
}

export interface WorkflowState {
  workflow_id: string
  name: string
  status: 'idle' | 'running' | 'paused' | 'completed' | 'failed'
  created_at: string
  updated_at: string
  nodes: FlowNode[]
  edges: FlowEdge[]
  current_node?: string
  metadata: {
    total_evolutions: number
    total_skills_learned: number
    success_rate: number
  }
}

export interface EvolutionRecord {
  evolution_id: string
  timestamp: string
  trigger: {
    node_id: string
    error_type: string
    error_message: string
  }
  proposal: {
    approach: string
    code: string
    estimated_complexity: 'low' | 'medium' | 'high'
  }
  evaluation: {
    test_passed: boolean
    performance_score: number
    feedback: string
  }
  update: {
    new_skill_created: boolean
    skill_id?: string
    nodes_added: string[]
    edges_added: string[]
  }
}
