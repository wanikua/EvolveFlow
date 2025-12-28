import axios from 'axios'
import type { WorkflowState, MCPTool, Skill, EvolutionRecord } from '../types'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

export const workflowAPI = {
  create: async (name: string): Promise<WorkflowState> => {
    const { data } = await api.post('/workflows', null, { params: { name } })
    return data
  },

  get: async (id: string): Promise<WorkflowState> => {
    const { data } = await api.get(`/workflows/${id}`)
    return data
  },

  list: async (): Promise<WorkflowState[]> => {
    const { data } = await api.get('/workflows')
    return data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/workflows/${id}`)
  },

  executeNode: async (
    workflowId: string,
    nodeId: string,
    inputs?: Record<string, any>
  ): Promise<any> => {
    const { data } = await api.post('/execute', {
      workflow_id: workflowId,
      node_id: nodeId,
      inputs,
    })
    return data
  },
}

export const toolAPI = {
  list: async (): Promise<MCPTool[]> => {
    const { data } = await api.get('/tools')
    return data
  },

  get: async (name: string): Promise<MCPTool> => {
    const { data } = await api.get(`/tools/${name}`)
    return data
  },

  register: async (tool: MCPTool): Promise<void> => {
    await api.post('/tools/register', tool)
  },
}

export const skillAPI = {
  list: async (category?: string): Promise<Skill[]> => {
    const { data } = await api.get('/skills', { params: { category } })
    return data
  },

  get: async (id: string): Promise<Skill> => {
    const { data } = await api.get(`/skills/${id}`)
    return data
  },

  create: async (skill: Skill): Promise<Skill> => {
    const { data } = await api.post('/skills', skill)
    return data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/skills/${id}`)
  },
}

export const evolutionAPI = {
  getHistory: async (): Promise<EvolutionRecord[]> => {
    const { data } = await api.get('/evolution/history')
    return data
  },

  getStats: async (): Promise<any> => {
    const { data } = await api.get('/evolution/stats')
    return data
  },
}

export const createWebSocket = (workflowId: string): WebSocket => {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const ws = new WebSocket(`${protocol}//${window.location.host}/ws/${workflowId}`)
  return ws
}
