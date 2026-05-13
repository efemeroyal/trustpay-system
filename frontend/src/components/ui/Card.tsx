import React from 'react'
import { cn } from '@/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  noPad?: boolean
}

export function Card({ children, className, noPad }: CardProps) {
  return (
    <div className={cn(
      'bg-[#0f1117] border border-[rgba(255,255,255,0.07)] rounded-xl overflow-hidden',
      className
    )}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-center justify-between px-5 py-3.5 border-b border-[rgba(255,255,255,0.06)]', className)}>
      {children}
    </div>
  )
}

export function CardTitle({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <h3 className="flex items-center gap-2 text-sm font-semibold text-[#e8eaf0]">
      {icon && <span className="text-[#8b8fa8]">{icon}</span>}
      {children}
    </h3>
  )
}

export function CardBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('p-5', className)}>{children}</div>
}
