import React from 'react'
import { cn } from '@/utils'
import { Loader2 } from 'lucide-react'

type Variant = 'primary' | 'ghost' | 'danger' | 'outline'

const MAP: Record<Variant, string> = {
  primary: 'bg-[#00e5a0] text-[#050708] hover:opacity-85 font-semibold',
  ghost:   'bg-transparent border border-[rgba(255,255,255,0.12)] text-[#8b8fa8] hover:bg-[#161921] hover:text-[#e8eaf0]',
  danger:  'bg-[rgba(255,87,87,0.12)] text-[#ff5757] border border-[rgba(255,87,87,0.2)] hover:bg-[rgba(255,87,87,0.2)]',
  outline: 'bg-transparent border border-[rgba(0,229,160,0.3)] text-[#00e5a0] hover:bg-[rgba(0,229,160,0.08)]',
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: React.ReactNode
}

export function Button({
  variant = 'primary', size = 'md', loading, icon, children, className, disabled, ...props
}: ButtonProps) {
  const sizes = { sm: 'px-3 py-1.5 text-xs gap-1.5', md: 'px-4 py-2 text-sm gap-2', lg: 'px-6 py-3 text-base gap-2' }
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center rounded-lg transition-all duration-150 focus:outline-none font-sans',
        'disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97]',
        MAP[variant], sizes[size], className
      )}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      {children}
    </button>
  )
}
