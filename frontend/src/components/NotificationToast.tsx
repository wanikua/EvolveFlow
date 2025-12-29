import { useEffect } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  actionLabel?: string
  onAction?: () => void
  duration?: number
}

interface NotificationToastProps {
  notification: Notification
  onDismiss: (id: string) => void
}

export default function NotificationToast({ notification, onDismiss }: NotificationToastProps) {
  const { id, type, title, message, actionLabel, onAction, duration = 5000 } = notification

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onDismiss(id)
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [id, duration, onDismiss])

  const getConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle className="w-5 h-5" />,
          bgColor: 'bg-green-50',
          borderColor: 'border-green-400',
          iconColor: 'text-green-600',
          titleColor: 'text-green-900',
          messageColor: 'text-green-700',
        }
      case 'error':
        return {
          icon: <AlertCircle className="w-5 h-5" />,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-400',
          iconColor: 'text-red-600',
          titleColor: 'text-red-900',
          messageColor: 'text-red-700',
        }
      case 'warning':
        return {
          icon: <AlertTriangle className="w-5 h-5" />,
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-400',
          iconColor: 'text-yellow-600',
          titleColor: 'text-yellow-900',
          messageColor: 'text-yellow-700',
        }
      case 'info':
        return {
          icon: <Info className="w-5 h-5" />,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-400',
          iconColor: 'text-blue-600',
          titleColor: 'text-blue-900',
          messageColor: 'text-blue-700',
        }
    }
  }

  const config = getConfig()

  return (
    <div
      className={`${config.bgColor} ${config.borderColor} border-l-4 p-4 rounded-lg shadow-lg max-w-md animate-slide-in`}
    >
      <div className="flex items-start gap-3">
        <div className={config.iconColor}>{config.icon}</div>
        <div className="flex-1">
          <h4 className={`font-semibold text-sm ${config.titleColor}`}>{title}</h4>
          <p className={`text-xs mt-1 ${config.messageColor}`}>{message}</p>
          {actionLabel && onAction && (
            <button
              onClick={onAction}
              className={`mt-2 text-xs font-semibold underline ${config.iconColor} hover:opacity-80`}
            >
              {actionLabel}
            </button>
          )}
        </div>
        <button
          onClick={() => onDismiss(id)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
