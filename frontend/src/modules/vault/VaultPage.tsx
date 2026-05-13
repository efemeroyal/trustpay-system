import React, { useRef, useEffect, useState } from 'react'
import { gsap } from 'gsap'
import { ShieldCheck, ExternalLink, Download, QrCode, Search, Filter } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { usePayment } from '@/store/PaymentContext'
import { shortHash, formatDate, formatXAF, polygonscanTx } from '@/utils'
import { cn } from '@/utils'
import type { SBTReceipt } from '@/types'

export function VaultPage() {
  const { receipts } = usePayment()
  const [search, setSearch] = useState('')
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!gridRef.current) return
    const cards = gridRef.current.querySelectorAll('.receipt-card')
    gsap.fromTo(cards,
      { y: 20, opacity: 0, scale: 0.97 },
      { y: 0, opacity: 1, scale: 1, stagger: 0.1, duration: 0.45, ease: 'back.out(1.3)' }
    )
  }, [])

  const filtered = receipts.filter(r =>
    r.feeLabel.toLowerCase().includes(search.toLowerCase()) ||
    r.tokenId.toString().includes(search)
  )

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">SBT Vault</h1>
          <p className="text-sm text-[#8b8fa8] mt-0.5">{receipts.length} Soulbound Token{receipts.length !== 1 ? 's' : ''} permanently on Polygon</p>
        </div>
        <div className="w-full sm:w-64">
          <Input
            placeholder="Search receipts…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Chain stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Receipts', value: receipts.length.toString(), color: '#00e5a0' },
          { label: 'Total Paid', value: `₣ ${formatXAF(receipts.reduce((a,r) => a+r.amount, 0))}`, color: '#4f9cf9' },
          { label: 'Network', value: 'Polygon Amoy', color: '#f5a623' },
        ].map(s => (
          <div key={s.label} className="bg-[#0f1117] border border-[rgba(255,255,255,0.07)] rounded-xl p-4">
            <p className="text-[10.5px] font-mono uppercase tracking-wide text-[#8b8fa8] mb-1">{s.label}</p>
            <p className="font-semibold text-[15px]" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Receipt grid */}
      <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(receipt => (
          <ReceiptCard key={receipt.tokenId} receipt={receipt} />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-[#3e4155]">
            <ShieldCheck className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm font-mono">No receipts found</p>
          </div>
        )}
      </div>
    </div>
  )
}

function ReceiptCard({ receipt }: { receipt: SBTReceipt }) {
  const cardRef = useRef<HTMLDivElement>(null)

  const handleHover = (enter: boolean) => {
    if (!cardRef.current) return
    gsap.to(cardRef.current, {
      y: enter ? -4 : 0,
      duration: 0.2,
      ease: 'power2.out',
    })
  }

  return (
    <div
      ref={cardRef}
      className="receipt-card relative rounded-xl overflow-hidden border border-[rgba(255,255,255,0.07)] cursor-pointer"
      onMouseEnter={() => handleHover(true)}
      onMouseLeave={() => handleHover(false)}
      style={{
        background: 'linear-gradient(145deg, #0d1a14 0%, #0a1220 50%, #120e1a 100%)'
      }}
    >
      {/* Grid pattern */}
      <div className="absolute inset-0 sbt-grid-bg opacity-60 pointer-events-none" />

      <div className="relative z-10 p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-[9.5px] font-mono font-bold uppercase tracking-[1.2px] text-[#00e5a0] mb-0.5">
              {receipt.university}
            </p>
            <h3 className="text-[14px] font-semibold leading-tight">{receipt.feeLabel}</h3>
          </div>
          <div className="flex items-center gap-1.5 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] rounded-full px-2.5 py-1 flex-shrink-0">
            <svg width="8" height="8" viewBox="0 0 20 20" fill="none">
              <polygon points="10,1 19,6 19,14 10,19 1,14 1,6" stroke="#8b8fa8" strokeWidth="1.5" fill="none"/>
            </svg>
            <span className="text-[10px] font-mono text-[#8b8fa8]">Polygon</span>
          </div>
        </div>

        {/* Fields grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <p className="text-[9.5px] font-mono uppercase tracking-wide text-[#8b8fa8] mb-0.5">Student ID</p>
            <p className="text-[12.5px] font-mono font-medium">{receipt.studentId}</p>
          </div>
          <div>
            <p className="text-[9.5px] font-mono uppercase tracking-wide text-[#8b8fa8] mb-0.5">Amount</p>
            <p className="text-[12.5px] font-mono font-bold text-[#00e5a0]">₣ {formatXAF(receipt.amount)}</p>
          </div>
          <div>
            <p className="text-[9.5px] font-mono uppercase tracking-wide text-[#8b8fa8] mb-0.5">Token ID</p>
            <p className="text-[12.5px] font-mono font-medium">#{receipt.tokenId}</p>
          </div>
          <div>
            <p className="text-[9.5px] font-mono uppercase tracking-wide text-[#8b8fa8] mb-0.5">Date</p>
            <p className="text-[12.5px] font-mono font-medium">{formatDate(receipt.mintedAt)}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-[rgba(255,255,255,0.06)]">
          <div className="flex items-center gap-1.5 text-[11px] text-[#00e5a0] font-mono">
            <ShieldCheck className="w-3.5 h-3.5" />
            ERC-5192 Locked
          </div>
          <div className="flex gap-1.5">
            <button className="w-7 h-7 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.07)] flex items-center justify-center text-[#8b8fa8] hover:text-[#00e5a0] hover:bg-[rgba(0,229,160,0.08)] transition-colors">
              <QrCode className="w-3.5 h-3.5" />
            </button>
            <button className="w-7 h-7 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.07)] flex items-center justify-center text-[#8b8fa8] hover:text-[#00e5a0] hover:bg-[rgba(0,229,160,0.08)] transition-colors">
              <Download className="w-3.5 h-3.5" />
            </button>
            <a
              href={polygonscanTx(receipt.txHash)}
              target="_blank"
              rel="noreferrer"
              className="w-7 h-7 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.07)] flex items-center justify-center text-[#8b8fa8] hover:text-[#4f9cf9] hover:bg-[rgba(79,156,249,0.08)] transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
