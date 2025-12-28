import { create } from 'zustand'
import type { WorkflowState, FlowNode, FlowEdge, Skill, MCPTool } from '../types'
import { workflowAPI, skillAPI, toolAPI } from '../api/client'

interface WorkflowStore {
  currentWorkflow: WorkflowState | null
  workflows: WorkflowState[]
  skills: Skill[]
  tools: MCPTool[]
  selectedNode: string | null
  isExecuting: boolean

  setCurrentWorkflow: (workflow: WorkflowState | null) => void
  createWorkflow: (name: string) => Promise<void>
  loadWorkflow: (id: string) => Promise<void>
  loadWorkflows: () => Promise<void>

  addNode: (node: FlowNode) => void
  updateNode: (nodeId: string, data: Partial<FlowNode['data']>) => void
  deleteNode: (nodeId: string) => void

  addEdge: (edge: FlowEdge) => void
  deleteEdge: (edgeId: string) => void

  selectNode: (nodeId: string | null) => void
  executeNode: (nodeId: string, inputs?: Record<string, any>) => Promise<void>

  loadSkills: () => Promise<void>
  loadTools: () => Promise<void>
}

export const useWorkflowStore = create<WorkflowStore>((set, get) => ({
  currentWorkflow: null,
  workflows: [],
  skills: [],
  tools: [],
  selectedNode: null,
  isExecuting: false,

  setCurrentWorkflow: (workflow) => set({ currentWorkflow: workflow }),

  createWorkflow: async (name) => {
    const workflow = await workflowAPI.create(name)
    set({ currentWorkflow: workflow })
  },

  loadWorkflow: async (id) => {
    const workflow = await workflowAPI.get(id)
    set({ currentWorkflow: workflow })
  },

  loadWorkflows: async () => {
    const workflows = await workflowAPI.list()
    set({ workflows })
  },

  addNode: (node) => {
    const { currentWorkflow } = get()
    if (!currentWorkflow) return

    set({
      currentWorkflow: {
        ...currentWorkflow,
        nodes: [...currentWorkflow.nodes, node],
      },
    })
  },

  updateNode: (nodeId, data) => {
    const { currentWorkflow } = get()
    if (!currentWorkflow) return

    set({
      currentWorkflow: {
        ...currentWorkflow,
        nodes: currentWorkflow.nodes.map((node) =>
          node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node
        ),
      },
    })
  },

  deleteNode: (nodeId) => {
    const { currentWorkflow } = get()
    if (!currentWorkflow) return

    set({
      currentWorkflow: {
        ...currentWorkflow,
        nodes: currentWorkflow.nodes.filter((node) => node.id !== nodeId),
        edges: currentWorkflow.edges.filter(
          (edge) => edge.source !== nodeId && edge.target !== nodeId
        ),
      },
    })
  },

  addEdge: (edge) => {
    const { currentWorkflow } = get()
    if (!currentWorkflow) return

    set({
      currentWorkflow: {
        ...currentWorkflow,
        edges: [...currentWorkflow.edges, edge],
      },
    })
  },

  deleteEdge: (edgeId) => {
    const { currentWorkflow } = get()
    if (!currentWorkflow) return

    set({
      currentWorkflow: {
        ...currentWorkflow,
        edges: currentWorkflow.edges.filter((edge) => edge.id !== edgeId),
      },
    })
  },

  selectNode: (nodeId) => set({ selectedNode: nodeId }),

  executeNode: async (nodeId, inputs) => {
    const { currentWorkflow, updateNode } = get()
    if (!currentWorkflow) return

    set({ isExecuting: true })

    try {
      const result = await workflowAPI.executeNode(
        currentWorkflow.workflow_id,
        nodeId,
        inputs
      )

      if (result.evolution_triggered) {
        result.new_nodes.forEach((node: FlowNode) => {
          get().addNode(node)
        })
        result.new_edges.forEach((edge: FlowEdge) => {
          get().addEdge(edge)
        })
      }

      await get().loadWorkflow(currentWorkflow.workflow_id)
    } catch (error) {
      console.error('Node execution failed:', error)
    } finally {
      set({ isExecuting: false })
    }
  },

  loadSkills: async () => {
    const skills = await skillAPI.list()
    set({ skills })
  },

  loadTools: async () => {
    const tools = await toolAPI.list()
    set({ tools })
  },
}))
