import React, { useState } from 'react'
import { Settings, Wallet, Bell, Shield, User, ChevronRight, CheckCircle2 } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { useAuth } from '@/store/AuthContext'
import { shortAddress } from '@/utils'
import { cn } from '@/utils'

export function SettingsPage() {
  const { student, connectWalletAction, isConnecting } = useAuth()
  const [notifications, setNotifications] = useState({ mint: true, verify: true, fail: true })

  return (
    <div className="flex flex-col gap-5 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-[#8b8fa8] mt-0.5">Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle icon={<User className="w-4 h-4" />}>Student Profile</CardTitle>
        </CardHeader>
        <CardBody className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold text-[#050708] flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #4f9cf9, #00e5a0)' }}>
              {student?.avatarInitials}
            </div>
            <div>
              <p className="font-semibold text-[15px]">{student?.name}</p>
              <p className="text-sm text-[#8b8fa8]">{student?.faculty}</p>
              <p className="text-[11.5px] font-mono text-[#8b8fa8] mt-0.5">{student?.id} · {student?.level}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Student ID" value={student?.id || ''} readOnly className="opacity-60 cursor-not-allowed" />
            <Input label="University" value={student?.university || ''} readOnly className="opacity-60 cursor-not-allowed" />
          </div>
        </CardBody>
      </Card>

      {/* Wallet */}
      <Card>
        <CardHeader>
          <CardTitle icon={<Wallet className="w-4 h-4" />}>Blockchain Wallet</CardTitle>
          {student?.walletAddress
            ? <Badge variant="success" dot>Connected</Badge>
            : <Badge variant="pending" dot>Not Connected</Badge>
          }
        </CardHeader>
        <CardBody className="flex flex-col gap-4">
          {student?.walletAddress ? (
            <div>
              <p className="text-[10.5px] font-mono uppercase tracking-wide text-[#8b8fa8] mb-1.5">Connected Address</p>
              <div className="flex items-center gap-3 bg-[rgba(0,229,160,0.06)] border border-[rgba(0,229,160,0.15)] rounded-xl px-4 py-3">
                <span className="w-2 h-2 rounded-full bg-[#00e5a0] pulse-dot flex-shrink-0" />
                <span className="font-mono text-[13px] text-[#00e5a0] break-all">{student.walletAddress}</span>
              </div>
              <p className="text-[11.5px] text-[#8b8fa8] mt-2.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#00e5a0]" />
                SBT receipts will be minted directly to this address on Polygon Amoy.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-[#8b8fa8]">
                Connect your MetaMask wallet to receive Soulbound Token receipts on Polygon Amoy Testnet.
              </p>
              <Button onClick={connectWalletAction} loading={isConnecting} icon={<Wallet className="w-4 h-4" />}>
                Connect MetaMask
              </Button>
            </div>
          )}

          <div className="p-3 bg-[#161921] rounded-xl text-[12px] font-mono text-[#8b8fa8] leading-relaxed">
            <span className="text-[#4f9cf9]">Network:</span> Polygon Amoy Testnet (Chain ID: 80002)<br/>
            <span className="text-[#4f9cf9]">Standard:</span> ERC-5192 Minimal Soulbound Token<br/>
            <span className="text-[#4f9cf9]">Cost:</span> ~0.00001 MATIC per mint (testnet: free)
          </div>
        </CardBody>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle icon={<Bell className="w-4 h-4" />}>Notifications</CardTitle>
        </CardHeader>
        <CardBody className="flex flex-col gap-1">
          {[
            { id: 'mint',   label: 'Receipt Minted',    desc: 'When an SBT is successfully minted to your wallet' },
            { id: 'verify', label: 'Payment Confirmed',  desc: 'When your MoMo payment is confirmed by the gateway' },
            { id: 'fail',   label: 'Transaction Failed', desc: 'When a payment or minting attempt fails' },
          ].map(item => (
            <div key={item.id} className="flex items-center justify-between py-3 border-b border-[rgba(255,255,255,0.05)] last:border-0">
              <div>
                <p className="text-[13px] font-medium">{item.label}</p>
                <p className="text-[11.5px] text-[#8b8fa8] mt-0.5">{item.desc}</p>
              </div>
              <button
                onClick={() => setNotifications(prev => ({ ...prev, [item.id]: !prev[item.id as keyof typeof prev] }))}
                className={cn(
                  'w-10 h-5.5 rounded-full transition-all duration-200 relative flex-shrink-0',
                  notifications[item.id as keyof typeof notifications]
                    ? 'bg-[#00e5a0]'
                    : 'bg-[#161921] border border-[rgba(255,255,255,0.12)]'
                )}
                style={{ height: '22px', width: '40px' }}
              >
                <span
                  className={cn(
                    'absolute top-[3px] w-4 h-4 rounded-full bg-white transition-all duration-200',
                    notifications[item.id as keyof typeof notifications] ? 'left-[20px]' : 'left-[3px]'
                  )}
                  style={{ background: notifications[item.id as keyof typeof notifications] ? '#050708' : '#8b8fa8' }}
                />
              </button>
            </div>
          ))}
        </CardBody>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle icon={<Shield className="w-4 h-4" />}>Security</CardTitle>
        </CardHeader>
        <CardBody className="flex flex-col gap-3">
          {[
            { label: 'ERC-5192 Non-transferable', desc: 'Receipts are permanently locked to your wallet', active: true },
            { label: 'IPFS Immutable Storage',    desc: 'Receipt metadata stored on decentralized IPFS', active: true },
            { label: 'Checksum Verification',      desc: 'Amount validated before any blockchain action', active: true },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-3 p-3 bg-[#161921] rounded-xl">
              <CheckCircle2 className="w-4 h-4 text-[#00e5a0] flex-shrink-0" />
              <div>
                <p className="text-[13px] font-medium">{item.label}</p>
                <p className="text-[11.5px] text-[#8b8fa8]">{item.desc}</p>
              </div>
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  )
}
