import React, { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { CheckCircle2, Loader2, Clock, ArrowLeft, ExternalLink } from 'lucide-react'
import { usePayment } from '@/store/PaymentContext'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatXAF } from '@/utils'
import type { FeeItem } from '@/types'
import { cn } from '@/utils'

interface MintingScreenProps {
  fee: FeeItem
  onBack: () => void
}

export function MintingScreen({ fee, onBack }: MintingScreenProps) {
  const { mintSteps, mintStatus } = usePayment()
  const containerRef = useRef<HTMLDivElement>(null)
  const hexRef = useRef<SVGSVGElement>(null)
  const particlesRef = useRef<HTMLDivElement>(null)

  const isMinted = mintStatus === 'minted'
  const completedCount = mintSteps.filter(s => s.status === 'done').length
  const progress = (completedCount / mintSteps.length) * 100

  useEffect(() => {
    if (!containerRef.current) return
    gsap.fromTo(containerRef.current,
      { opacity: 0, scale: 0.97 },
      { opacity: 1, scale: 1, duration: 0.5, ease: 'power3.out' }
    )

    // Hex rotation animation
    if (hexRef.current) {
      gsap.to(hexRef.current, {
        rotation: 360,
        duration: 12,
        repeat: -1,
        ease: 'none',
        transformOrigin: 'center center',
      })
    }
  }, [])

  // Particle burst on mint
  useEffect(() => {
    if (!isMinted || !particlesRef.current) return
    const parent = particlesRef.current
    for (let i = 0; i < 18; i++) {
      const p = document.createElement('div')
      p.className = 'absolute w-1.5 h-1.5 rounded-full'
      p.style.background = i % 3 === 0 ? '#00e5a0' : i % 3 === 1 ? '#4f9cf9' : '#f5a623'
      p.style.left = '50%'; p.style.top = '50%'
      parent.appendChild(p)
      const angle = (i / 18) * Math.PI * 2
      const dist = 60 + Math.random() * 50
      gsap.fromTo(p,
        { x: 0, y: 0, opacity: 1, scale: 1 },
        {
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist,
          opacity: 0, scale: 0,
          duration: 0.8 + Math.random() * 0.4,
          ease: 'power2.out',
          onComplete: () => p.remove(),
        }
      )
    }
    // Flash the hex
    if (hexRef.current) {
      gsap.to(hexRef.current, { filter: 'brightness(2)', duration: 0.2, yoyo: true, repeat: 1 })
    }
  }, [isMinted])

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-6 py-4">
      {/* Back button */}
      {isMinted && (
        <div className="w-full">
          <Button variant="ghost" size="sm" onClick={onBack} icon={<ArrowLeft className="w-3.5 h-3.5" />}>
            Back to Payments
          </Button>
        </div>
      )}

      <div className="w-full max-w-[520px]">
        {/* Hero visual */}
        <div className="relative flex items-center justify-center h-[200px] mb-4">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={cn(
              'w-[140px] h-[140px] rounded-full transition-all duration-700',
              isMinted
                ? 'bg-[rgba(0,229,160,0.15)]'
                : 'bg-[rgba(79,156,249,0.08)]'
            )}
              style={{ boxShadow: isMinted ? '0 0 60px rgba(0,229,160,0.2)' : '0 0 40px rgba(79,156,249,0.1)' }}
            />
          </div>

          {/* Particle container */}
          <div ref={particlesRef} className="absolute inset-0 flex items-center justify-center pointer-events-none" />

          {/* Rotating hex */}
          <svg ref={hexRef} width="120" height="120" viewBox="0 0 120 120" fill="none" className="absolute">
            <path
              d="M60 8L108 34V86L60 112L12 86V34L60 8Z"
              stroke={isMinted ? '#00e5a0' : '#4f9cf9'}
              strokeWidth="1"
              strokeDasharray="6 4"
              fill="none"
              opacity={isMinted ? 0.6 : 0.3}
            />
          </svg>

          {/* Center icon */}
          <div className={cn(
            'w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 z-10',
            isMinted ? 'bg-[#00e5a0]' : 'bg-[#161921] border border-[rgba(79,156,249,0.3)]'
          )}>
            {isMinted
              ? <CheckCircle2 className="w-8 h-8 text-[#050708]" />
              : <Loader2 className="w-7 h-7 text-[#4f9cf9] animate-spin" />
            }
          </div>
        </div>

        {/* Status text */}
        <div className="text-center mb-6">
          <h2 className="text-lg font-semibold mb-1">
            {isMinted ? 'Receipt Minted On-Chain 🎉' : 'Minting Your Receipt…'}
          </h2>
          <p className="text-sm text-[#8b8fa8]">
            {isMinted
              ? 'Your SBT receipt is permanently recorded on Polygon. It cannot be transferred or forged.'
              : 'This usually takes 5–15 seconds. Do not close this page.'}
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-mono text-[#8b8fa8] uppercase tracking-wide">Progress</span>
            <span className="text-[11px] font-mono text-[#8b8fa8]">{completedCount}/{mintSteps.length} steps</span>
          </div>
          <div className="h-1 bg-[#161921] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${progress}%`,
                background: isMinted ? '#00e5a0' : 'linear-gradient(90deg, #4f9cf9, #00e5a0)',
              }}
            />
          </div>
        </div>

        {/* Fee summary */}
        <div className="bg-[#161921] rounded-xl p-4 mb-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10.5px] font-mono uppercase tracking-wide text-[#8b8fa8] mb-0.5">Fee</p>
              <p className="text-[13.5px] font-semibold">{fee.label}</p>
            </div>
            <div className="text-right">
              <p className="text-[10.5px] font-mono uppercase tracking-wide text-[#8b8fa8] mb-0.5">Amount</p>
              <p className="font-mono font-bold text-[16px] text-[#00e5a0]">₣ {formatXAF(fee.amount)}</p>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="flex flex-col">
          {mintSteps.map((step, i) => (
            <MintStepRow key={step.id} step={step} isLast={i === mintSteps.length - 1} />
          ))}
        </div>

        {/* Done actions */}
        {isMinted && (
          <div className="flex gap-3 mt-6">
            <Button variant="outline" size="md" icon={<ExternalLink className="w-3.5 h-3.5" />} className="flex-1 justify-center">
              View on Polygonscan
            </Button>
            <Button size="md" className="flex-1 justify-center" onClick={onBack}>
              Back to Dashboard
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

function MintStepRow({ step, isLast }: { step: { id: string; label: string; description: string; status: string; detail?: string }; isLast: boolean }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (step.status === 'active' && ref.current) {
      gsap.fromTo(ref.current,
        { backgroundColor: 'rgba(79,156,249,0.0)' },
        { backgroundColor: 'rgba(79,156,249,0.05)', duration: 0.3, yoyo: true, repeat: 1 }
      )
    }
  }, [step.status])

  const iconMap = {
    done: <CheckCircle2 className="w-4 h-4 text-[#00e5a0]" />,
    active: <Loader2 className="w-4 h-4 text-[#f5a623] animate-spin" />,
    queued: <Clock className="w-4 h-4 text-[#3e4155]" />,
    error: <CheckCircle2 className="w-4 h-4 text-[#ff5757]" />,
  }

  const bgMap = {
    done: 'bg-[rgba(0,229,160,0.10)]',
    active: 'bg-[rgba(245,166,35,0.10)]',
    queued: 'bg-[rgba(255,255,255,0.04)]',
    error: 'bg-[rgba(255,87,87,0.10)]',
  }

  return (
    <div ref={ref} className="flex gap-3 rounded-xl p-2 -mx-2 transition-colors duration-300">
      <div className="flex flex-col items-center">
        <div className={cn('w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-300', bgMap[step.status as keyof typeof bgMap])}>
          {iconMap[step.status as keyof typeof iconMap]}
        </div>
        {!isLast && <div className="w-px flex-1 bg-[rgba(255,255,255,0.06)] my-1" />}
      </div>
      <div className="pb-4 min-w-0">
        <p className={cn('text-[13px] font-medium leading-none mt-1.5', step.status === 'queued' ? 'text-[#3e4155]' : 'text-[#e8eaf0]')}>
          {step.label}
        </p>
        <p className="text-[11.5px] font-mono mt-1 text-[#8b8fa8]">
          {step.detail || step.description}
        </p>
      </div>
    </div>
  )
}
