import React from 'react'
import { cn } from '@/utils'

type Variant = 'success' | 'pending' | 'failed' | 'info' | 'default'

const MAP: Record<Variant, string> = {
  success: 'bg-[rgba(0,229,160,0.10)] text-[#00e5a0] border-[rgba(0,229,160,0.2)]',
  pending: 'bg-[rgba(245,166,35,0.12)] text-[#f5a623] border-[rgba(245,166,35,0.2)]',
  failed:  'bg-[rgba(255,87,87,0.10)]  text-[#ff5757] border-[rgba(255,87,87,0.2)]',
  info:    'bg-[rgba(79,156,249,0.10)]  text-[#4f9cf9] border-[rgba(79,156,249,0.2)]',
  default: 'bg-[rgba(255,255,255,0.06)] text-[#8b8fa8] border-[rgba(255,255,255,0.1)]',
}

interface BadgeProps {
  variant?: Variant
  dot?: boolean
  children: React.ReactNode
  className?: string
}

export function Badge({ variant = 'default', dot, children, className }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border font-mono',
      MAP[variant], className
    )}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {children}
    </span>
  )
}
