import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react'
import type { AppNotification } from '@/types'

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
}
const COLORS = {
  success: 'text-[#00e5a0] bg-[rgba(0,229,160,0.08)] border-[rgba(0,229,160,0.2)]',
  error:   'text-[#ff5757] bg-[rgba(255,87,87,0.08)]  border-[rgba(255,87,87,0.2)]',
  info:    'text-[#4f9cf9] bg-[rgba(79,156,249,0.08)]  border-[rgba(79,156,249,0.2)]',
  warning: 'text-[#f5a623] bg-[rgba(245,166,35,0.08)]  border-[rgba(245,166,35,0.2)]',
}

export function Toast({ notification, onDismiss }: { notification: AppNotification; onDismiss: (id: string) => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const Icon = ICONS[notification.type]

  useEffect(() => {
    if (!ref.current) return
    gsap.fromTo(ref.current,
      { x: 40, opacity: 0, scale: 0.95 },
      { x: 0, opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(1.4)' }
    )
    const timer = setTimeout(() => {
      gsap.to(ref.current, {
        x: 40, opacity: 0, scale: 0.95, duration: 0.25, ease: 'power2.in',
        onComplete: () => onDismiss(notification.id)
      })
    }, 4500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      ref={ref}
      className={`flex items-start gap-3 p-3.5 rounded-xl border backdrop-blur-md max-w-[320px] shadow-2xl ${COLORS[notification.type]}`}
    >
      <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold leading-tight">{notification.title}</p>
        <p className="text-xs opacity-70 mt-0.5 leading-snug">{notification.message}</p>
      </div>
      <button onClick={() => onDismiss(notification.id)} className="opacity-50 hover:opacity-100 flex-shrink-0">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

export function ToastContainer({ notifications, onDismiss }: {
  notifications: AppNotification[]
  onDismiss: (id: string) => void
}) {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 items-end">
      {notifications.slice(0, 4).map(n => (
        <Toast key={n.id} notification={n} onDismiss={onDismiss} />
      ))}
    </div>
  )
}
