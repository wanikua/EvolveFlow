import { create } from 'zustand'
import NotificationToast, { Notification } from './NotificationToast'

interface NotificationStore {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id'>) => void
  removeNotification: (id: string) => void
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  addNotification: (notification) => {
    const id = `notification-${Date.now()}-${Math.random()}`
    set((state) => ({
      notifications: [...state.notifications, { ...notification, id }],
    }))
  },
  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }))
  },
}))

export default function NotificationContainer() {
  const { notifications, removeNotification } = useNotificationStore()

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 max-w-md">
      {notifications.map((notification) => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          onDismiss={removeNotification}
        />
      ))}
    </div>
  )
}

// Helper function to show notifications easily
export const notify = {
  success: (title: string, message: string, options?: Partial<Notification>) => {
    useNotificationStore.getState().addNotification({
      type: 'success',
      title,
      message,
      ...options,
    })
  },
  error: (title: string, message: string, options?: Partial<Notification>) => {
    useNotificationStore.getState().addNotification({
      type: 'error',
      title,
      message,
      duration: 8000, // Errors stay longer
      ...options,
    })
  },
  warning: (title: string, message: string, options?: Partial<Notification>) => {
    useNotificationStore.getState().addNotification({
      type: 'warning',
      title,
      message,
      ...options,
    })
  },
  info: (title: string, message: string, options?: Partial<Notification>) => {
    useNotificationStore.getState().addNotification({
      type: 'info',
      title,
      message,
      ...options,
    })
  },
}
