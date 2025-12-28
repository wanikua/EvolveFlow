import { memo } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { Sparkles } from 'lucide-react'
import type { SkillNodeData } from '../../types'

const SkillNode = ({ data, selected }: NodeProps<SkillNodeData>) => {
  const statusColors = {
    ready: 'bg-purple-50 border-purple-300',
    executing: 'bg-purple-100 border-purple-400 animate-pulse',
    completed: 'bg-green-100 border-green-400',
    failed: 'bg-red-100 border-red-400',
  }

  return (
    <div
      className={`px-4 py-3 shadow-lg rounded-lg border-2 min-w-[200px] ${
        statusColors[data.status]
      } ${selected ? 'ring-2 ring-blue-500' : ''}`}
    >
      <Handle type="target" position={Position.Left} className="w-3 h-3" />

      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-5 h-5 text-purple-600" />
        <div className="font-bold text-sm">{data.label}</div>
      </div>

      <div className="text-xs text-gray-600 mb-2">
        <span className="font-semibold">Skill ID:</span> {data.skill_id}
      </div>

      {data.outputs && (
        <div className="text-xs bg-white p-2 rounded mb-2 max-h-20 overflow-auto">
          <pre className="whitespace-pre-wrap">
            {JSON.stringify(data.outputs, null, 2)}
          </pre>
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span className="capitalize">{data.status}</span>
        <span>{new Date(data.timestamp).toLocaleTimeString()}</span>
      </div>

      <Handle type="source" position={Position.Right} className="w-3 h-3" />
    </div>
  )
}

export default memo(SkillNode)
