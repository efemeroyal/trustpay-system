import React, { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { cn } from '@/utils'

type Accent = 'green' | 'blue' | 'amber' | 'red'
const ACCENT: Record<Accent, string> = {
  green: '#00e5a0',
  blue:  '#4f9cf9',
  amber: '#f5a623',
  red:   '#ff5757',
}

interface StatCardProps {
  label: string
  value: string
  subtext?: string
  accent?: Accent
  subtextColor?: string
  icon?: React.ReactNode
  delay?: number
  className?: string
}

export function StatCard({ label, value, subtext, accent = 'green', subtextColor, icon, delay = 0, className }: StatCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const valRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    gsap.fromTo(ref.current,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out', delay }
    )
  }, [])

  return (
    <div
      ref={ref}
      className={cn(
        'relative bg-[#0f1117] border border-[rgba(255,255,255,0.07)] rounded-xl p-4 overflow-hidden card-hover',
        className
      )}
    >
      <div
        className="absolute top-0 left-0 right-0 h-[2px] rounded-t-xl"
        style={{ background: ACCENT[accent] }}
      />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10.5px] font-mono font-bold uppercase tracking-[0.8px] text-[#8b8fa8] mb-2">{label}</p>
          <div ref={valRef} className="text-[26px] font-semibold tracking-tight leading-none text-[#e8eaf0]">{value}</div>
          {subtext && (
            <p className={cn('text-xs mt-1.5 flex items-center gap-1', subtextColor || 'text-[#8b8fa8]')}>
              {subtext}
            </p>
          )}
        </div>
        {icon && (
          <div className="p-2 rounded-lg" style={{ background: `${ACCENT[accent]}14` }}>
            <span style={{ color: ACCENT[accent] }}>{icon}</span>
          </div>
        )}
      </div>
    </div>
  )
}
