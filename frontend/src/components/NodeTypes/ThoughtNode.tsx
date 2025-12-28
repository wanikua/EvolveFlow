import { memo } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { Brain } from 'lucide-react'
import type { ThoughtNodeData } from '../../types'

const ThoughtNode = ({ data, selected }: NodeProps<ThoughtNodeData>) => {
  const statusColors = {
    pending: 'bg-gray-100 border-gray-300',
    processing: 'bg-blue-100 border-blue-400 animate-pulse',
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
        <Brain className="w-5 h-5 text-purple-600" />
        <div className="font-bold text-sm">{data.label}</div>
      </div>

      <div className="text-xs text-gray-700 mb-2">{data.content}</div>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span className="capitalize">{data.status}</span>
        <span>{new Date(data.timestamp).toLocaleTimeString()}</span>
      </div>

      <Handle type="source" position={Position.Right} className="w-3 h-3" />
    </div>
  )
}

export default memo(ThoughtNode)
