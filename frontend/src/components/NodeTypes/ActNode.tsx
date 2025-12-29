import { memo } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { Zap, AlertCircle, Clock, Loader, CheckCircle, XCircle } from 'lucide-react'
import type { ActNodeData } from '../../types'

const ActNode = ({ data, selected }: NodeProps<ActNodeData>) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          bg: 'bg-gray-50 border-gray-300',
          icon: <Clock className="w-3 h-3 text-gray-500" />,
          badge: 'bg-gray-200 text-gray-700',
        }
      case 'executing':
        return {
          bg: 'bg-yellow-50 border-yellow-400 animate-pulse',
          icon: <Loader className="w-3 h-3 text-yellow-600 animate-spin" />,
          badge: 'bg-yellow-200 text-yellow-700',
        }
      case 'success':
        return {
          bg: 'bg-green-50 border-green-400',
          icon: <CheckCircle className="w-3 h-3 text-green-600" />,
          badge: 'bg-green-200 text-green-700',
        }
      case 'error':
        return {
          bg: 'bg-red-50 border-red-400',
          icon: <XCircle className="w-3 h-3 text-red-600" />,
          badge: 'bg-red-200 text-red-700',
        }
      default:
        return {
          bg: 'bg-gray-50 border-gray-300',
          icon: <Clock className="w-3 h-3 text-gray-500" />,
          badge: 'bg-gray-200 text-gray-700',
        }
    }
  }

  const statusConfig = getStatusConfig(data.status)

  return (
    <div
      className={`px-4 py-3 shadow-lg rounded-lg border-2 min-w-[220px] transition-all duration-200 ${
        statusConfig.bg
      } ${selected ? 'ring-2 ring-orange-500 ring-offset-2' : ''}`}
    >
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-orange-400" />

      <div className="flex items-center gap-2 mb-2">
        <div className="bg-orange-100 p-1.5 rounded">
          <Zap className="w-4 h-4 text-orange-600" />
        </div>
        <div className="font-bold text-sm flex-1">{data.label}</div>
        <div className={`px-2 py-0.5 rounded-full text-xs flex items-center gap-1 ${statusConfig.badge}`}>
          {statusConfig.icon}
          <span className="capitalize">{data.status}</span>
        </div>
      </div>

      <div className="bg-white/50 rounded p-2 mb-2 space-y-1">
        <div className="text-xs text-gray-700">
          <span className="font-semibold text-gray-900">Tool:</span> {data.tool_name}
        </div>
        <div className="text-xs text-gray-600">{data.tool_description}</div>
      </div>

      {data.output && (
        <div className="text-xs bg-white border border-green-200 p-2 rounded mb-2 max-h-20 overflow-auto">
          <div className="text-green-700 font-semibold mb-1">Output:</div>
          <pre className="whitespace-pre-wrap text-gray-700">
            {JSON.stringify(data.output, null, 2)}
          </pre>
        </div>
      )}

      {data.error_message && (
        <div className="flex items-center gap-1 text-xs text-red-600 bg-red-50 p-2 rounded mb-2 border border-red-200">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          <span>{data.error_message}</span>
        </div>
      )}

      <div className="text-xs text-gray-500">
        {new Date(data.timestamp).toLocaleTimeString()}
      </div>

      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-orange-400" />
    </div>
  )
}

export default memo(ActNode)
