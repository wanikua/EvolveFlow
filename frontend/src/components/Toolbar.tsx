import { Play, Plus, Brain, Zap, Eye, Sparkles, HelpCircle, FileText } from 'lucide-react'
import { useWorkflowStore } from '../store/workflow'
import type { Position } from '../types'

interface ToolbarProps {
  onToggleSkillLibrary: () => void
  onOpenTutorial: () => void
  onOpenTemplates: () => void
}

const Toolbar = ({ onToggleSkillLibrary, onOpenTutorial, onOpenTemplates }: ToolbarProps) => {
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
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-semibold text-gray-600">Add Nodes</div>
        <div className="flex gap-1">
          <button
            onClick={onOpenTemplates}
            className="p-1 hover:bg-gray-100 rounded transition group relative"
            title="Workflow Templates (W)"
          >
            <FileText className="w-4 h-4 text-gray-500" />
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">
              Templates (W)
            </span>
          </button>
          <button
            onClick={onOpenTutorial}
            className="p-1 hover:bg-gray-100 rounded transition group relative"
            title="Open Tutorial (H)"
          >
            <HelpCircle className="w-4 h-4 text-gray-500" />
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">
              Help (H)
            </span>
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => createNode('thought')}
          className="flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition text-sm group relative"
          title="Add Thought Node - Press T"
        >
          <Brain className="w-4 h-4" />
          <span>Thought</span>
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">
            Reasoning & Planning (T)
          </span>
        </button>

        <button
          onClick={() => createNode('act')}
          className="flex items-center gap-2 px-3 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition text-sm group relative"
          title="Add Act Node - Press A"
        >
          <Zap className="w-4 h-4" />
          <span>Act</span>
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">
            Execute Tools (A)
          </span>
        </button>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => createNode('observe')}
          className="flex items-center gap-2 px-3 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition text-sm group relative"
          title="Add Observe Node - Press O"
        >
          <Eye className="w-4 h-4" />
          <span>Observe</span>
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">
            Record Results (O)
          </span>
        </button>

        <button
          onClick={onToggleSkillLibrary}
          className="flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition text-sm group relative"
          title="Open Skill Library - Press S"
        >
          <Sparkles className="w-4 h-4" />
          <span>Skills</span>
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">
            Learned Patterns (S)
          </span>
        </button>
      </div>

      {selectedNode && (
        <div className="pt-2 border-t border-gray-200">
          <button
            onClick={handleExecute}
            disabled={isExecuting}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed group relative"
            title="Execute selected node - Press E"
          >
            <Play className="w-4 h-4" />
            <span>{isExecuting ? 'Executing...' : 'Execute Node'}</span>
            {!isExecuting && (
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">
                Run selected node (E)
              </span>
            )}
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
