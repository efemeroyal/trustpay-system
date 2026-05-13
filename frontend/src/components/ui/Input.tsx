import React from 'react'
import { cn } from '@/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
  suffix?: React.ReactNode
}

export function Input({ label, error, icon, suffix, className, id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-[#8b8fa8] uppercase tracking-wide font-mono">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <span className="absolute left-3 text-[#8b8fa8] pointer-events-none">{icon}</span>
        )}
        <input
          {...props}
          id={inputId}
          className={cn(
            'w-full bg-[#161921] border border-[rgba(255,255,255,0.08)] rounded-lg',
            'text-sm text-[#e8eaf0] placeholder-[#3e4155] font-sans',
            'py-2.5 pr-3 focus:outline-none focus:border-[rgba(0,229,160,0.5)]',
            'transition-colors duration-150',
            icon ? 'pl-10' : 'pl-3',
            error && 'border-[rgba(255,87,87,0.4)] focus:border-[rgba(255,87,87,0.6)]',
            className
          )}
        />
        {suffix && <span className="absolute right-3">{suffix}</span>}
      </div>
      {error && <p className="text-xs text-[#ff5757] font-mono">{error}</p>}
    </div>
  )
}
