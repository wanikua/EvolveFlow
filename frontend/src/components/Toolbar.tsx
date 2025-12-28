import { Play, Plus, Brain, Zap, Eye, Sparkles } from 'lucide-react'
import { useWorkflowStore } from '../store/workflow'
import type { Position } from '../types'

interface ToolbarProps {
  onToggleSkillLibrary: () => void
}

const Toolbar = ({ onToggleSkillLibrary }: ToolbarProps) => {
  const { addNode, selectedNode, executeNode, isExecuting, currentWorkflow } =
    useWorkflowStore()

  const createNode = (type: 'thought' | 'act' | 'observe' | 'skill') => {
    const position: Position = {
      x: Math.random() * 400 + 100,
      y: Math.random() * 300 + 100,
    }

    const baseData = {
      label: `New ${type}`,
      timestamp: new Date().toISOString(),
    }

    switch (type) {
      case 'thought':
        addNode({
          id: `node-thought-${Date.now()}`,
          type: 'thought',
          position,
          data: {
            ...baseData,
            content: 'Enter your reasoning here...',
            status: 'pending',
          },
        })
        break

      case 'act':
        addNode({
          id: `node-act-${Date.now()}`,
          type: 'act',
          position,
          data: {
            ...baseData,
            tool_name: 'get_weather',
            tool_description: 'Tool description',
            input_schema: {},
            status: 'pending',
          },
        })
        break

      case 'observe':
        addNode({
          id: `node-observe-${Date.now()}`,
          type: 'observe',
          position,
          data: {
            ...baseData,
            observation: null,
            interpretation: 'Observation...',
            needs_evolution: false,
          },
        })
        break

      case 'skill':
        addNode({
          id: `node-skill-${Date.now()}`,
          type: 'skill',
          position,
          data: {
            ...baseData,
            skill_id: 'skill-weather-query',
            status: 'ready',
          },
        })
        break
    }
  }

  const handleExecute = () => {
    if (selectedNode && currentWorkflow) {
      executeNode(selectedNode)
    }
  }

  return (
    <div className="absolute top-4 left-4 z-10 bg-white shadow-lg rounded-lg p-3 space-y-2">
      <div className="text-xs font-semibold text-gray-600 mb-2">Add Nodes</div>

      <div className="flex gap-2">
        <button
          onClick={() => createNode('thought')}
          className="flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition text-sm"
          title="Add Thought Node"
        >
          <Brain className="w-4 h-4" />
          <span>Thought</span>
        </button>

        <button
          onClick={() => createNode('act')}
          className="flex items-center gap-2 px-3 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition text-sm"
          title="Add Act Node"
        >
          <Zap className="w-4 h-4" />
          <span>Act</span>
        </button>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => createNode('observe')}
          className="flex items-center gap-2 px-3 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition text-sm"
          title="Add Observe Node"
        >
          <Eye className="w-4 h-4" />
          <span>Observe</span>
        </button>

        <button
          onClick={onToggleSkillLibrary}
          className="flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition text-sm"
          title="Open Skill Library"
        >
          <Sparkles className="w-4 h-4" />
          <span>Skills</span>
        </button>
      </div>

      {selectedNode && (
        <div className="pt-2 border-t border-gray-200">
          <button
            onClick={handleExecute}
            disabled={isExecuting}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="w-4 h-4" />
            <span>{isExecuting ? 'Executing...' : 'Execute Node'}</span>
          </button>
        </div>
      )}

      {currentWorkflow && (
        <div className="pt-2 border-t border-gray-200 text-xs text-gray-600">
          <div className="mb-1">
            <span className="font-semibold">Status:</span>{' '}
            <span className="capitalize">{currentWorkflow.status}</span>
          </div>
          <div>
            <span className="font-semibold">Evolutions:</span>{' '}
            {currentWorkflow.metadata.total_evolutions}
          </div>
        </div>
      )}
    </div>
  )
}

export default Toolbar
