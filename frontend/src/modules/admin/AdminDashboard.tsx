import React, { useState, useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { Search, QrCode, ShieldCheck, AlertCircle, User, Wallet, CheckCircle2 } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { usePayment } from '@/store/PaymentContext'
import { shortAddress, shortHash, formatXAF, formatDate } from '@/utils'
import { cn } from '@/utils'
import type { SBTReceipt } from '@/types'

type SearchMode = 'student' | 'wallet'

export function AdminDashboard() {
  const { receipts } = usePayment()
  const [mode, setMode] = useState<SearchMode>('student')
  const [query, setQuery] = useState('')
  const [result, setResult] = useState<SBTReceipt[] | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [searched, setSearched] = useState(false)
  const resultRef = useRef<HTMLDivElement>(null)

  const handleSearch = async () => {
    if (!query.trim()) return
    setIsSearching(true)
    setSearched(false)
    await new Promise(r => setTimeout(r, 900))
    const matches = receipts.filter(r =>
      mode === 'student'
        ? r.studentId.toLowerCase().includes(query.toLowerCase())
        : r.contractAddress.toLowerCase().includes(query.toLowerCase()) || query.startsWith('0x')
    )
    setResult(matches.length > 0 ? matches : [])
    setIsSearching(false)
    setSearched(true)
  }

  useEffect(() => {
    if (result !== null && resultRef.current) {
      gsap.fromTo(resultRef.current,
        { y: 12, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' }
      )
    }
  }, [result])

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Verification Portal</h1>
        <p className="text-sm text-[#8b8fa8] mt-0.5">Verify student payment receipts via blockchain query</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total SBTs Issued', value: receipts.length.toString(), color: '#00e5a0' },
          { label: 'Verified Today', value: '12', color: '#4f9cf9' },
          { label: 'Total Volume', value: `₣ ${formatXAF(receipts.reduce((a,r) => a+r.amount,0))}`, color: '#f5a623' },
          { label: 'Contract', value: shortAddress('0x742d35Cc6634C0532925a3b'), color: '#8b8fa8' },
        ].map(s => (
          <div key={s.label} className="bg-[#0f1117] border border-[rgba(255,255,255,0.07)] rounded-xl p-4">
            <p className="text-[10px] font-mono uppercase tracking-wide text-[#8b8fa8] mb-1">{s.label}</p>
            <p className="font-semibold text-sm" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Search Panel */}
        <Card>
          <CardHeader>
            <CardTitle icon={<Search className="w-4 h-4" />}>Verify Receipt</CardTitle>
          </CardHeader>
          <CardBody className="flex flex-col gap-4">
            {/* Mode toggle */}
            <div className="flex rounded-lg overflow-hidden border border-[rgba(255,255,255,0.07)]">
              {([
                { id: 'student', label: 'Student ID', icon: <User className="w-3.5 h-3.5" /> },
                { id: 'wallet', label: 'Wallet Address', icon: <Wallet className="w-3.5 h-3.5" /> },
              ] as const).map(m => (
                <button
                  key={m.id}
                  onClick={() => { setMode(m.id); setQuery(''); setResult(null); setSearched(false) }}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 py-2.5 text-[12.5px] font-medium transition-colors',
                    mode === m.id
                      ? 'bg-[rgba(0,229,160,0.10)] text-[#00e5a0]'
                      : 'text-[#8b8fa8] hover:text-[#e8eaf0] bg-[#161921]'
                  )}
                >
                  {m.icon}{m.label}
                </button>
              ))}
            </div>

            <Input
              placeholder={mode === 'student' ? 'e.g. UB22CS041' : 'e.g. 0x3f9a…c7d2'}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              icon={mode === 'student' ? <User className="w-4 h-4" /> : <Wallet className="w-4 h-4" />}
            />

            <Button onClick={handleSearch} loading={isSearching} className="w-full justify-center">
              Search Blockchain
            </Button>

            {/* QR hint */}
            <div className="flex items-center gap-2 text-xs text-[#8b8fa8] bg-[#161921] rounded-lg p-3">
              <QrCode className="w-4 h-4 flex-shrink-0 text-[#4f9cf9]" />
              <span>You can also scan the QR code on the student's SBT receipt card to verify instantly.</span>
            </div>
          </CardBody>
        </Card>

        {/* Result Panel */}
        <Card>
          <CardHeader>
            <CardTitle icon={<ShieldCheck className="w-4 h-4" />}>Verification Result</CardTitle>
            {result !== null && (
              <Badge variant={result.length > 0 ? 'success' : 'failed'} dot>
                {result.length > 0 ? `${result.length} receipt${result.length > 1 ? 's' : ''} found` : 'Not found'}
              </Badge>
            )}
          </CardHeader>
          <CardBody>
            {!searched && !isSearching && (
              <div className="flex flex-col items-center justify-center py-10 text-[#3e4155]">
                <ShieldCheck className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm font-mono">Enter a query to verify</p>
              </div>
            )}

            {isSearching && (
              <div className="flex flex-col items-center justify-center py-10 gap-3">
                <div className="w-10 h-10 rounded-full border-2 border-[rgba(0,229,160,0.3)] border-t-[#00e5a0] animate-spin" />
                <p className="text-sm font-mono text-[#8b8fa8]">Querying Polygon network…</p>
              </div>
            )}

            {searched && result !== null && (
              <div ref={resultRef} className="flex flex-col gap-3">
                {result.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-8">
                    <AlertCircle className="w-8 h-8 text-[#ff5757] opacity-60" />
                    <p className="text-sm text-[#8b8fa8] font-mono">No receipts found on-chain</p>
                  </div>
                ) : (
                  result.map(r => (
                    <div key={r.tokenId} className="bg-[#161921] rounded-xl p-4 border border-[rgba(0,229,160,0.12)]">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-[10.5px] font-mono uppercase tracking-wide text-[#8b8fa8]">Receipt #{r.tokenId}</p>
                          <p className="text-[13.5px] font-semibold mt-0.5">{r.feeLabel}</p>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-[#00e5a0] font-mono">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Verified
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11.5px]">
                        {[
                          ['Student', r.studentId],
                          ['Amount', `₣ ${formatXAF(r.amount)}`],
                          ['Date', formatDate(r.mintedAt)],
                          ['Block', `#${r.blockNumber.toString()}`],
                          ['Tx Hash', shortHash(r.txHash, 5)],
                          ['IPFS CID', r.ipfsCid],
                        ].map(([k, v]) => (
                          <div key={k}>
                            <p className="text-[#8b8fa8] font-mono text-[10px] uppercase tracking-wide">{k}</p>
                            <p className="font-mono font-medium mt-0.5 truncate">{v}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Recent verifications */}
      <Card>
        <CardHeader>
          <CardTitle icon={<CheckCircle2 className="w-4 h-4" />}>Recent Receipts on Chain</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="border-b border-[rgba(255,255,255,0.06)]">
                {['Token ID', 'Student', 'Fee', 'Amount', 'Date', 'Tx Hash', 'Status'].map(h => (
                  <th key={h} className="text-left px-5 py-2.5 text-[10px] font-mono uppercase tracking-wide text-[#3e4155]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {receipts.map((r, i) => (
                <tr key={r.tokenId} className="border-b border-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                  <td className="px-5 py-3 font-mono text-[#8b8fa8]">#{r.tokenId}</td>
                  <td className="px-5 py-3 font-mono">{r.studentId}</td>
                  <td className="px-5 py-3 max-w-[160px] truncate">{r.feeLabel}</td>
                  <td className="px-5 py-3 font-mono text-[#00e5a0]">₣ {formatXAF(r.amount)}</td>
                  <td className="px-5 py-3 font-mono text-[#8b8fa8]">{formatDate(r.mintedAt)}</td>
                  <td className="px-5 py-3 font-mono text-[#4f9cf9]">{shortHash(r.txHash, 5)}</td>
                  <td className="px-5 py-3"><Badge variant="success" dot>Soulbound</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
