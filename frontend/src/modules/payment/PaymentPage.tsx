import React, { useState, useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { Phone, CheckCircle2, ChevronRight, Smartphone, Zap } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { MintingScreen } from '@/modules/minting/MintingScreen'
import { useAuth } from '@/store/AuthContext'
import { usePayment } from '@/store/PaymentContext'
import { useNotifications } from '@/store/NotificationContext'
import { FEE_CATALOG, formatXAF } from '@/utils'
import type { FeeItem, MoMoProvider } from '@/types'
import { cn } from '@/utils'

export function PaymentPage() {
  const { student } = useAuth()
  const { addTransaction, updateTransaction, setPaymentStatus, setMintStatus, updateMintStep, resetMintSteps } = usePayment()
  const { add: addNotif } = useNotifications()

  const [selectedFee, setSelectedFee] = useState<FeeItem | null>(null)
  const [provider, setProvider] = useState<MoMoProvider>('mtn')
  const [phone, setPhone] = useState('')
  const [step, setStep] = useState<'select' | 'confirm' | 'minting'>('select')
  const [isLoading, setIsLoading] = useState(false)
  const [txId, setTxId] = useState<string | null>(null)

  const cardsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!cardsRef.current) return
    const cards = cardsRef.current.querySelectorAll('.fee-card')
    gsap.fromTo(cards,
      { y: 16, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.07, duration: 0.4, ease: 'power2.out' }
    )
  }, [])

  const handleSelectFee = (fee: FeeItem) => {
    setSelectedFee(fee)
    gsap.to('.fee-card', { scale: 0.98, duration: 0.1 })
    gsap.to('.fee-card', { scale: 1, duration: 0.2, delay: 0.1 })
    setStep('confirm')
  }

  const handlePay = async () => {
    if (!selectedFee || !student) return
    setIsLoading(true)
    const id = addTransaction({
      feeLabel: selectedFee.label,
      feeCategory: selectedFee.id,
      amount: selectedFee.amount,
      status: 'pending',
    })
    setTxId(id)
    setPaymentStatus('initiating')
    setIsLoading(false)
    setStep('minting')

    // Simulate minting flow
    resetMintSteps()
    setMintStatus('idle')

    const steps = [
      { id: 'payment', delay: 800, detail: `MTN webhook received · ${new Date().toLocaleTimeString()}` },
      { id: 'verify', delay: 2000, detail: 'Checksum passed · Node.js middleware' },
      { id: 'ipfs', delay: 3500, detail: 'CID: bafybeig…3xk9q' },
      { id: 'mint', delay: 5500, detail: 'Block confirmed on Polygon Amoy' },
      { id: 'notify', delay: 7200, detail: 'WebSocket push delivered' },
    ]

    for (let i = 0; i < steps.length; i++) {
      const { id, delay, detail } = steps[i]
      setTimeout(() => {
        if (i > 0) updateMintStep(steps[i-1].id, { status: 'done', detail: steps[i-1].detail })
        updateMintStep(id, { status: 'active', description: 'In progress…' })
        if (i === steps.length - 1) {
          setTimeout(() => {
            updateMintStep(id, { status: 'done', detail })
            updateTransaction(id, { status: 'success', txHash: `0x${Math.random().toString(16).slice(2, 42)}` as `0x${string}`, sbtTokenId: Math.floor(Math.random() * 1000) })
            setMintStatus('minted')
            addNotif({ type: 'success', title: 'Receipt Minted!', message: `SBT for ${selectedFee.label} is now on-chain.` })
          }, 800)
        }
      }, delay)
    }
  }

  if (step === 'minting') {
    return <MintingScreen fee={selectedFee!} onBack={() => { setStep('select'); setSelectedFee(null) }} />
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Pay Fees</h1>
        <p className="text-sm text-[#8b8fa8] mt-0.5">Select a fee category and pay via MTN MoMo or Orange Money</p>
      </div>

      {step === 'select' && (
        <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {FEE_CATALOG.map(fee => (
            <button
              key={fee.id}
              onClick={() => handleSelectFee(fee)}
              className={cn(
                'fee-card text-left bg-[#0f1117] border border-[rgba(255,255,255,0.07)] rounded-xl p-4',
                'hover:border-[rgba(0,229,160,0.3)] hover:shadow-[0_0_20px_rgba(0,229,160,0.06)] transition-all duration-200 group'
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={cn(
                  'w-9 h-9 rounded-lg flex items-center justify-center',
                  fee.mandatory ? 'bg-[rgba(0,229,160,0.10)]' : 'bg-[rgba(79,156,249,0.10)]'
                )}>
                  <Zap className={cn('w-4 h-4', fee.mandatory ? 'text-[#00e5a0]' : 'text-[#4f9cf9]')} />
                </div>
                <Badge variant={fee.mandatory ? 'success' : 'info'}>
                  {fee.mandatory ? 'Mandatory' : 'Optional'}
                </Badge>
              </div>
              <h3 className="text-[13.5px] font-semibold mb-1">{fee.label}</h3>
              <p className="text-[11.5px] text-[#8b8fa8] mb-3">{fee.description}</p>
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-[15px] text-[#00e5a0]">
                  ₣ {formatXAF(fee.amount)}
                </span>
                <ChevronRight className="w-4 h-4 text-[#3e4155] group-hover:text-[#00e5a0] group-hover:translate-x-0.5 transition-all" />
              </div>
            </button>
          ))}
        </div>
      )}

      {step === 'confirm' && selectedFee && (
        <div className="max-w-[520px]">
          <Card>
            <CardHeader>
              <CardTitle icon={<Phone className="w-4 h-4" />}>Confirm Payment</CardTitle>
              <button onClick={() => setStep('select')} className="text-[12px] text-[#8b8fa8] hover:text-[#e8eaf0]">← Back</button>
            </CardHeader>
            <CardBody className="flex flex-col gap-5">
              {/* Fee summary */}
              <div className="bg-[#161921] rounded-xl p-4">
                <p className="text-xs text-[#8b8fa8] font-mono uppercase tracking-wide mb-1">Paying for</p>
                <p className="text-[15px] font-semibold">{selectedFee.label}</p>
                <p className="text-[11.5px] text-[#8b8fa8] mt-0.5">{selectedFee.description}</p>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-[rgba(255,255,255,0.06)]">
                  <span className="text-sm text-[#8b8fa8]">Total</span>
                  <span className="font-mono font-bold text-[20px] text-[#00e5a0]">₣ {formatXAF(selectedFee.amount)}</span>
                </div>
              </div>

              {/* Provider select */}
              <div>
                <p className="text-xs font-mono uppercase tracking-wide text-[#8b8fa8] mb-2.5">Payment provider</p>
                <div className="grid grid-cols-2 gap-2.5">
                  {([
                    { id: 'mtn', label: 'MTN MoMo', color: '#f5a623', prefix: '677' },
                    { id: 'orange', label: 'Orange Money', color: '#ff7626', prefix: '699' },
                  ] as const).map(p => (
                    <button
                      key={p.id}
                      onClick={() => setProvider(p.id)}
                      className={cn(
                        'flex items-center gap-2.5 p-3 rounded-xl border transition-all duration-150',
                        provider === p.id
                          ? 'border-current bg-[rgba(255,255,255,0.04)]'
                          : 'border-[rgba(255,255,255,0.07)] hover:border-[rgba(255,255,255,0.13)]'
                      )}
                      style={{ color: provider === p.id ? p.color : '#8b8fa8' }}
                    >
                      <Smartphone className="w-4 h-4 flex-shrink-0" />
                      <div className="text-left">
                        <p className="text-[12.5px] font-semibold" style={{ color: provider === p.id ? p.color : '#e8eaf0' }}>{p.label}</p>
                        <p className="text-[10.5px] font-mono opacity-60">{p.prefix}…</p>
                      </div>
                      {provider === p.id && <CheckCircle2 className="w-3.5 h-3.5 ml-auto flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

              <Input
                label="Mobile Number"
                placeholder={provider === 'mtn' ? '677 XXX XXX' : '699 XXX XXX'}
                value={phone}
                onChange={e => setPhone(e.target.value)}
                icon={<Phone className="w-4 h-4" />}
              />

              <div className="flex items-start gap-2 text-xs text-[#8b8fa8] bg-[rgba(0,229,160,0.05)] border border-[rgba(0,229,160,0.12)] rounded-lg p-3">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#00e5a0] mt-0.5 flex-shrink-0" />
                <span>You will receive an STK Push on your phone. Confirm the payment to trigger automatic SBT minting on Polygon.</span>
              </div>

              <Button
                onClick={handlePay}
                loading={isLoading}
                size="lg"
                className="w-full justify-center"
              >
                Pay ₣ {formatXAF(selectedFee.amount)} via {provider === 'mtn' ? 'MTN MoMo' : 'Orange Money'}
              </Button>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  )
}
