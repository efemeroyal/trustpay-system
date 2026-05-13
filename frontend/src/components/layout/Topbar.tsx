import React from 'react'
import { Bell, ChevronDown } from 'lucide-react'
import { useAuth } from '@/store/AuthContext'
import { useNotifications } from '@/store/NotificationContext'
import { shortAddress } from '@/utils'
import { cn } from '@/utils'

interface TopbarProps {
  onMenuToggle: () => void
}

export function Topbar({ onMenuToggle }: TopbarProps) {
  const { student } = useAuth()
  const { unreadCount } = useNotifications()

  return (
    <header className="h-14 flex items-center justify-between px-4 md:px-6 border-b border-[rgba(255,255,255,0.06)] bg-[#0f1117] flex-shrink-0 z-30">
      {/* Left: Logo + mobile menu */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-1.5 rounded-lg text-[#8b8fa8] hover:bg-[#161921] transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M2 4.5h14M2 9h14M2 13.5h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-[#00e5a0] rounded-[7px] flex items-center justify-center flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2L13 5V11L8 14L3 11V5L8 2Z" stroke="#050708" strokeWidth="1.5" fill="none"/>
              <circle cx="8" cy="8" r="2" fill="#050708"/>
            </svg>
          </div>
          <span className="font-mono font-bold text-[15px] tracking-tight">
            Trust<span className="text-[#00e5a0]">Pay</span>
          </span>
        </div>
      </div>

      {/* Center: Nav pills (desktop only) */}
      <nav className="hidden md:flex items-center gap-1">
        {['Dashboard', 'Pay Fees', 'My Receipts', 'Verify'].map(item => (
          <button
            key={item}
            className={cn(
              'px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all duration-150',
              item === 'Dashboard'
                ? 'bg-[rgba(0,229,160,0.10)] text-[#00e5a0]'
                : 'text-[#8b8fa8] hover:text-[#e8eaf0] hover:bg-[#161921]'
            )}
          >
            {item}
          </button>
        ))}
      </nav>

      {/* Right: Wallet + avatar */}
      <div className="flex items-center gap-2.5">
        <button className="relative p-2 rounded-lg hover:bg-[#161921] text-[#8b8fa8] hover:text-[#e8eaf0] transition-colors">
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#00e5a0] rounded-full" />
          )}
        </button>

        {student?.walletAddress ? (
          <div className="hidden sm:flex items-center gap-2 bg-[#161921] border border-[rgba(255,255,255,0.08)] rounded-full px-3 py-1.5 cursor-pointer hover:border-[rgba(255,255,255,0.15)] transition-colors">
            <span className="w-2 h-2 rounded-full bg-[#00e5a0] pulse-dot flex-shrink-0" />
            <span className="text-[11.5px] font-mono text-[#8b8fa8]">
              {shortAddress(student.walletAddress)}
            </span>
          </div>
        ) : (
          <button className="hidden sm:block text-[11.5px] font-mono text-[#f5a623] bg-[rgba(245,166,35,0.10)] border border-[rgba(245,166,35,0.2)] rounded-full px-3 py-1.5 hover:bg-[rgba(245,166,35,0.16)] transition-colors">
            Connect Wallet
          </button>
        )}

        <div className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold text-[#050708] flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #4f9cf9, #00e5a0)' }}>
          {student?.avatarInitials || 'TP'}
        </div>
      </div>
    </header>
  )
}
