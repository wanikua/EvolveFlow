import { memo } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { Eye, TrendingUp } from 'lucide-react'
import type { ObserveNodeData } from '../../types'

const ObserveNode = ({ data, selected }: NodeProps<ObserveNodeData>) => {
  return (
    <div
      className={`px-4 py-3 shadow-lg rounded-lg border-2 min-w-[200px] bg-indigo-50 border-indigo-300 ${
        selected ? 'ring-2 ring-blue-500' : ''
      } ${data.needs_evolution ? 'border-red-400 bg-red-50' : ''}`}
    >
      <Handle type="target" position={Position.Left} className="w-3 h-3" />

      <div className="flex items-center gap-2 mb-2">
        <Eye className="w-5 h-5 text-indigo-600" />
        <div className="font-bold text-sm">{data.label}</div>
      </div>

      <div className="text-xs text-gray-700 mb-2">{data.interpretation}</div>

      {data.observation && (
        <div className="text-xs bg-white p-2 rounded mb-2 max-h-20 overflow-auto">
          <pre className="whitespace-pre-wrap">
            {JSON.stringify(data.observation, null, 2)}
          </pre>
        </div>
      )}

      {data.needs_evolution && (
        <div className="flex items-center gap-1 text-xs text-red-600 mb-2 font-semibold">
          <TrendingUp className="w-3 h-3" />
          <span>Evolution Triggered</span>
        </div>
      )}

      <div className="text-xs text-gray-500">
        {new Date(data.timestamp).toLocaleTimeString()}
      </div>

      <Handle type="source" position={Position.Right} className="w-3 h-3" />
    </div>
  )
}

export default memo(ObserveNode)
