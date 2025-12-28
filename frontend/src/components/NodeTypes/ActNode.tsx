import { memo } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { Zap, AlertCircle } from 'lucide-react'
import type { ActNodeData } from '../../types'

const ActNode = ({ data, selected }: NodeProps<ActNodeData>) => {
  const statusColors = {
    pending: 'bg-gray-100 border-gray-300',
    executing: 'bg-yellow-100 border-yellow-400 animate-pulse',
    success: 'bg-green-100 border-green-400',
    error: 'bg-red-100 border-red-400',
  }

  return (
    <div
      className={`px-4 py-3 shadow-lg rounded-lg border-2 min-w-[220px] ${
        statusColors[data.status]
      } ${selected ? 'ring-2 ring-blue-500' : ''}`}
    >
      <Handle type="target" position={Position.Left} className="w-3 h-3" />

      <div className="flex items-center gap-2 mb-2">
        <Zap className="w-5 h-5 text-orange-600" />
        <div className="font-bold text-sm">{data.label}</div>
      </div>

      <div className="text-xs text-gray-700 mb-1">
        <span className="font-semibold">Tool:</span> {data.tool_name}
      </div>

      <div className="text-xs text-gray-600 mb-2">{data.tool_description}</div>

      {data.output && (
        <div className="text-xs bg-white p-2 rounded mb-2 max-h-20 overflow-auto">
          <pre className="whitespace-pre-wrap">
            {JSON.stringify(data.output, null, 2)}
          </pre>
        </div>
      )}

      {data.error_message && (
        <div className="flex items-center gap-1 text-xs text-red-600 mb-2">
          <AlertCircle className="w-3 h-3" />
          <span>{data.error_message}</span>
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

export default memo(ActNode)
