import React, { useRef, useEffect, useState } from 'react'
import { gsap } from 'gsap'
import { Receipt, Download, Filter, ChevronDown } from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { usePayment } from '@/store/PaymentContext'
import { formatXAF, formatDateTime, shortHash } from '@/utils'
import { cn } from '@/utils'
import type { Transaction } from '@/types'

export function ReceiptsPage() {
  const { transactions } = usePayment()
  const [filter, setFilter] = useState<'all' | 'success' | 'pending' | 'failed'>('all')
  const listRef = useRef<HTMLDivElement>(null)

  const filtered = transactions.filter(t => filter === 'all' || t.status === filter)

  useEffect(() => {
    if (!listRef.current) return
    const rows = listRef.current.querySelectorAll('.tx-row')
    gsap.fromTo(rows,
      { x: -10, opacity: 0 },
      { x: 0, opacity: 1, stagger: 0.05, duration: 0.35, ease: 'power2.out' }
    )
  }, [filter])

  const statusBadge = (status: Transaction['status']) => {
    const map = { success: 'success', pending: 'pending', failed: 'failed' } as const
    const labels = { success: 'Minted', pending: 'Pending', failed: 'Failed' }
    return <Badge variant={map[status]} dot>{labels[status]}</Badge>
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Transaction History</h1>
          <p className="text-sm text-[#8b8fa8] mt-0.5">{transactions.length} total transactions</p>
        </div>
        <Button variant="ghost" size="sm" icon={<Download className="w-3.5 h-3.5" />}>
          Export CSV
        </Button>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'success', 'pending', 'failed'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-3.5 py-1.5 rounded-full text-[12.5px] font-medium transition-all duration-150 capitalize border',
              filter === f
                ? 'bg-[rgba(0,229,160,0.10)] text-[#00e5a0] border-[rgba(0,229,160,0.25)]'
                : 'text-[#8b8fa8] border-[rgba(255,255,255,0.07)] hover:border-[rgba(255,255,255,0.14)] hover:text-[#e8eaf0]'
            )}
          >
            {f === 'all' ? `All (${transactions.length})` :
             f === 'success' ? `Minted (${transactions.filter(t => t.status === 'success').length})` :
             f === 'pending' ? `Pending (${transactions.filter(t => t.status === 'pending').length})` :
             `Failed (${transactions.filter(t => t.status === 'failed').length})`}
          </button>
        ))}
      </div>

      <Card>
        {/* Table header */}
        <div className="hidden md:grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-5 py-2.5 border-b border-[rgba(255,255,255,0.06)]">
          {['Date', 'Fee Category', 'Amount', 'Tx Hash', 'Status'].map(h => (
            <p key={h} className="text-[10px] font-mono uppercase tracking-wide text-[#3e4155]">{h}</p>
          ))}
        </div>

        <div ref={listRef} className="divide-y divide-[rgba(255,255,255,0.04)]">
          {filtered.map(tx => (
            <div key={tx.id} className="tx-row grid grid-cols-1 md:grid-cols-[auto_1fr_auto_auto_auto] gap-2 md:gap-4 px-5 py-4 hover:bg-[rgba(255,255,255,0.02)] transition-colors items-center">
              <p className="text-[11.5px] font-mono text-[#8b8fa8] whitespace-nowrap">
                {formatDateTime(tx.timestamp)}
              </p>
              <div>
                <p className="text-[13px] font-medium">{tx.feeLabel}</p>
                {tx.ipfsCid && (
                  <p className="text-[10.5px] font-mono text-[#3e4155] mt-0.5">IPFS: {tx.ipfsCid}</p>
                )}
              </div>
              <p className="font-mono font-bold text-[13px] text-[#00e5a0]">
                ₣ {formatXAF(tx.amount)}
              </p>
              <p className="text-[11px] font-mono text-[#4f9cf9]">
                {tx.txHash ? shortHash(tx.txHash, 5) : '—'}
              </p>
              <div>{statusBadge(tx.status)}</div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="flex flex-col items-center py-16 text-[#3e4155]">
              <Receipt className="w-8 h-8 mb-3 opacity-30" />
              <p className="text-sm font-mono">No transactions found</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
