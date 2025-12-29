import { memo } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { Brain, Clock, CheckCircle, XCircle, Loader } from 'lucide-react'
import type { ThoughtNodeData } from '../../types'

const ThoughtNode = ({ data, selected }: NodeProps<ThoughtNodeData>) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          bg: 'bg-gray-50 border-gray-300',
          icon: <Clock className="w-3 h-3 text-gray-500" />,
          badge: 'bg-gray-200 text-gray-700',
        }
      case 'processing':
        return {
          bg: 'bg-blue-50 border-blue-400 animate-pulse',
          icon: <Loader className="w-3 h-3 text-blue-600 animate-spin" />,
          badge: 'bg-blue-200 text-blue-700',
        }
      case 'completed':
        return {
          bg: 'bg-green-50 border-green-400',
          icon: <CheckCircle className="w-3 h-3 text-green-600" />,
          badge: 'bg-green-200 text-green-700',
        }
      case 'failed':
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
      className={`px-4 py-3 shadow-lg rounded-lg border-2 min-w-[200px] transition-all duration-200 ${
        statusConfig.bg
      } ${selected ? 'ring-2 ring-purple-500 ring-offset-2' : ''}`}
    >
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-purple-400" />

      <div className="flex items-center gap-2 mb-2">
        <div className="bg-purple-100 p-1.5 rounded">
          <Brain className="w-4 h-4 text-purple-600" />
        </div>
        <div className="font-bold text-sm flex-1">{data.label}</div>
        <div className={`px-2 py-0.5 rounded-full text-xs flex items-center gap-1 ${statusConfig.badge}`}>
          {statusConfig.icon}
          <span className="capitalize">{data.status}</span>
        </div>
      </div>

      <div className="text-xs text-gray-700 mb-2 leading-relaxed">{data.content}</div>

      <div className="text-xs text-gray-500">
        {new Date(data.timestamp).toLocaleTimeString()}
      </div>

      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-purple-400" />
    </div>
  )
}

export default memo(ThoughtNode)
