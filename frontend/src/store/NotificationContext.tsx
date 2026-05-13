import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { AppNotification } from '@/types'
import { generateId } from '@/utils'

interface NotifState {
  notifications: AppNotification[]
  unreadCount: number
  add: (n: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void
  markAllRead: () => void
  dismiss: (id: string) => void
}

const NotifContext = createContext<NotifState | null>(null)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([])

  const add = useCallback((n: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    setNotifications(prev => [
      { ...n, id: generateId(), timestamp: new Date(), read: false },
      ...prev,
    ])
  }, [])

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }, [])

  const dismiss = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  return (
    <NotifContext.Provider value={{
      notifications,
      unreadCount: notifications.filter(n => !n.read).length,
      add,
      markAllRead,
      dismiss,
    }}>
      {children}
    </NotifContext.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotifContext)
  if (!ctx) throw new Error('useNotifications outside provider')
  return ctx
}
