import { memo } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { Eye, TrendingUp, AlertTriangle } from 'lucide-react'
import type { ObserveNodeData } from '../../types'

const ObserveNode = ({ data, selected }: NodeProps<ObserveNodeData>) => {
  return (
    <div
      className={`px-4 py-3 shadow-lg rounded-lg border-2 min-w-[200px] transition-all duration-200 ${
        data.needs_evolution
          ? 'bg-amber-50 border-amber-400 animate-pulse'
          : 'bg-indigo-50 border-indigo-300'
      } ${selected ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}`}
    >
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-indigo-400" />

      <div className="flex items-center gap-2 mb-2">
        <div className={`p-1.5 rounded ${data.needs_evolution ? 'bg-amber-100' : 'bg-indigo-100'}`}>
          <Eye className={`w-4 h-4 ${data.needs_evolution ? 'text-amber-600' : 'text-indigo-600'}`} />
        </div>
        <div className="font-bold text-sm flex-1">{data.label}</div>
        {data.needs_evolution && (
          <div className="bg-amber-200 text-amber-700 px-2 py-0.5 rounded-full text-xs flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            <span>Needs Evolution</span>
          </div>
        )}
      </div>

      <div className="text-xs text-gray-700 mb-2 leading-relaxed bg-white/50 p-2 rounded">
        {data.interpretation}
      </div>

      {data.observation && (
        <div className="text-xs bg-white border border-indigo-200 p-2 rounded mb-2 max-h-20 overflow-auto">
          <div className="text-indigo-700 font-semibold mb-1">Observation:</div>
          <pre className="whitespace-pre-wrap text-gray-700">
            {JSON.stringify(data.observation, null, 2)}
          </pre>
        </div>
      )}

      {data.needs_evolution && (
        <div className="flex items-center gap-1 text-xs text-amber-700 bg-amber-100 p-2 rounded mb-2 border border-amber-300">
          <TrendingUp className="w-3 h-3 flex-shrink-0" />
          <span className="font-semibold">Evolution will be triggered to handle this observation</span>
        </div>
      )}

      <div className="text-xs text-gray-500">
        {new Date(data.timestamp).toLocaleTimeString()}
      </div>

      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-indigo-400" />
    </div>
  )
}

export default memo(ObserveNode)
