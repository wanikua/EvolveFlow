import { create } from 'zustand'
import type { WorkflowState, FlowNode, FlowEdge, Skill, MCPTool } from '../types'
import { workflowAPI, skillAPI, toolAPI } from '../api/client'
import { notify } from '../components/NotificationContainer'

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
    try {
      const workflow = await workflowAPI.create(name)
      set({ currentWorkflow: workflow })
      notify.success('Workflow Created', `"${name}" has been created successfully`)
    } catch (error) {
      notify.error(
        'Failed to Create Workflow',
        'Could not create workflow. Check if backend is running at http://localhost:8000',
        {
          actionLabel: 'View Docs',
          onAction: () => window.open('http://localhost:8000/docs', '_blank'),
        }
      )
      throw error
    }
  },

  loadWorkflow: async (id) => {
    try {
      const workflow = await workflowAPI.get(id)
      set({ currentWorkflow: workflow })
    } catch (error) {
      notify.error(
        'Failed to Load Workflow',
        `Could not load workflow "${id}". It may have been deleted or backend is offline.`,
        {
          actionLabel: 'Reload Page',
          onAction: () => window.location.reload(),
        }
      )
      throw error
    }
  },

  loadWorkflows: async () => {
    try {
      const workflows = await workflowAPI.list()
      set({ workflows })
    } catch (error) {
      notify.error(
        'Failed to Load Workflows',
        'Could not connect to backend. Make sure it is running at http://localhost:8000',
        {
          actionLabel: 'Retry',
          onAction: () => get().loadWorkflows(),
        }
      )
      throw error
    }
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
    if (!currentWorkflow) {
      notify.warning('No Workflow Selected', 'Please create or load a workflow first')
      return
    }

    const node = currentWorkflow.nodes.find((n) => n.id === nodeId)
    if (!node) {
      notify.error('Node Not Found', `Could not find node with ID: ${nodeId}`)
      return
    }

    set({ isExecuting: true })

    try {
      const result = await workflowAPI.executeNode(
        currentWorkflow.workflow_id,
        nodeId,
        inputs
      )

      if (result.evolution_triggered) {
        notify.success(
          'Evolution Triggered!',
          `Created ${result.new_nodes?.length || 0} new nodes to handle the task`
        )
        result.new_nodes.forEach((node: FlowNode) => {
          get().addNode(node)
        })
        result.new_edges.forEach((edge: FlowEdge) => {
          get().addEdge(edge)
        })
      } else {
        notify.success('Node Executed', `"${node.data.label}" completed successfully`)
      }

      await get().loadWorkflow(currentWorkflow.workflow_id)
    } catch (error: any) {
      console.error('Node execution failed:', error)
      notify.error(
        'Execution Failed',
        error.message || 'Node execution encountered an error. Check console for details.',
        {
          actionLabel: 'View Logs',
          onAction: () => console.log('Full error:', error),
        }
      )
    } finally {
      set({ isExecuting: false })
    }
  },

  loadSkills: async () => {
    try {
      const skills = await skillAPI.list()
      set({ skills })
    } catch (error) {
      notify.error(
        'Failed to Load Skills',
        'Could not load skill library. Backend may be offline.',
        {
          actionLabel: 'Retry',
          onAction: () => get().loadSkills(),
        }
      )
    }
  },

  loadTools: async () => {
    try {
      const tools = await toolAPI.list()
      set({ tools })
    } catch (error) {
      notify.warning(
        'Failed to Load Tools',
        'MCP tools could not be loaded. Some features may be unavailable.',
        {
          actionLabel: 'Retry',
          onAction: () => get().loadTools(),
        }
      )
    }
  },
}))
