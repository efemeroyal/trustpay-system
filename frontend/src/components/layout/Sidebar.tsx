import React, { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import {
  LayoutDashboard, CreditCard, Receipt, QrCode,
  Coins, Activity, Settings, LogOut, ChevronRight,
  ShieldCheck
} from 'lucide-react'
import { useAuth } from '@/store/AuthContext'
import { cn } from '@/utils'

interface NavItem {
  icon: React.ReactNode
  label: string
  id: string
  badge?: string
}

const STUDENT_NAV: NavItem[] = [
  { icon: <LayoutDashboard className="w-4 h-4" />, label: 'Overview', id: 'dashboard' },
  { icon: <CreditCard className="w-4 h-4" />, label: 'Pay Fees', id: 'pay' },
  { icon: <Receipt className="w-4 h-4" />, label: 'My Receipts', id: 'receipts' },
  { icon: <QrCode className="w-4 h-4" />, label: 'Verify Receipt', id: 'verify' },
]

const CHAIN_NAV: NavItem[] = [
  { icon: <Coins className="w-4 h-4" />, label: 'SBT Vault', id: 'vault' },
  { icon: <Activity className="w-4 h-4" />, label: 'Chain Activity', id: 'chain' },
]

interface SidebarProps {
  active: string
  onChange: (id: string) => void
  isMobileOpen: boolean
  onClose: () => void
}

export function Sidebar({ active, onChange, isMobileOpen, onClose }: SidebarProps) {
  const { student, logout } = useAuth()
  const sidebarRef = useRef<HTMLDivElement>(null)
  const itemsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!itemsRef.current) return
    const items = itemsRef.current.querySelectorAll('.nav-item')
    gsap.fromTo(items,
      { x: -12, opacity: 0 },
      { x: 0, opacity: 1, stagger: 0.06, duration: 0.4, ease: 'power2.out', delay: 0.1 }
    )
  }, [])

  const NavSection = ({ title, items }: { title: string; items: NavItem[] }) => (
    <div className="mb-1">
      <p className="text-[9.5px] font-mono font-bold uppercase tracking-[1.2px] text-[#3e4155] px-3 py-2.5">{title}</p>
      {items.map(item => (
        <button
          key={item.id}
          onClick={() => { onChange(item.id); onClose() }}
          className={cn(
            'nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13.5px] font-medium transition-all duration-150 mb-0.5',
            active === item.id
              ? 'bg-[rgba(0,229,160,0.10)] text-[#00e5a0]'
              : 'text-[#8b8fa8] hover:text-[#e8eaf0] hover:bg-[#161921]'
          )}
        >
          <span className={active === item.id ? 'text-[#00e5a0]' : 'text-[#3e4155]'}>{item.icon}</span>
          {item.label}
          {item.badge && (
            <span className="ml-auto text-[10px] bg-[rgba(245,166,35,0.15)] text-[#f5a623] px-1.5 py-0.5 rounded-full font-mono">
              {item.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  )

  const sidebarContent = (
    <div ref={itemsRef} className="flex flex-col h-full px-2 py-3">
      {/* Student info */}
      <div className="px-3 py-3 mb-3 border-b border-[rgba(255,255,255,0.06)]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-bold text-[#050708] flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #4f9cf9, #00e5a0)' }}>
            {student?.avatarInitials || 'TP'}
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold truncate">{student?.name || 'Student'}</p>
            <p className="text-[10.5px] font-mono text-[#8b8fa8]">{student?.id || '---'}</p>
          </div>
        </div>
      </div>

      <NavSection title="Student" items={STUDENT_NAV} />
      <NavSection title="Blockchain" items={CHAIN_NAV} />

      <div className="mt-auto border-t border-[rgba(255,255,255,0.06)] pt-2">
        <NavSection title="Account" items={[
          { icon: <Settings className="w-4 h-4" />, label: 'Settings', id: 'settings' },
        ]} />
        <button
          onClick={logout}
          className="nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13.5px] text-[#ff5757] hover:bg-[rgba(255,87,87,0.08)] transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside ref={sidebarRef} className="hidden lg:flex w-[200px] flex-shrink-0 bg-[#0f1117] border-r border-[rgba(255,255,255,0.06)] flex-col overflow-y-auto">
        {sidebarContent}
      </aside>

      {/* Mobile drawer */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <aside className="relative z-50 w-[220px] bg-[#0f1117] border-r border-[rgba(255,255,255,0.08)] flex flex-col overflow-y-auto">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  )
}
