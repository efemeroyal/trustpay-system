import React, { useState } from 'react'
import { Topbar } from './Topbar'
import { Sidebar } from './Sidebar'
import { ToastContainer } from '@/components/ui/Toast'
import { useNotifications } from '@/store/NotificationContext'
import { DashboardPage } from '@/modules/dashboard/DashboardPage'
import { PaymentPage } from '@/modules/payment/PaymentPage'
import { VaultPage } from '@/modules/vault/VaultPage'
import { ReceiptsPage } from '@/modules/vault/ReceiptsPage'
import { AdminDashboard } from '@/modules/admin/AdminDashboard'
import { ChainActivityPage } from '@/modules/chain/ChainActivityPage'
import { SettingsPage } from '@/modules/settings/SettingsPage'

type PageId = 'dashboard' | 'pay' | 'receipts' | 'verify' | 'vault' | 'chain' | 'settings'

const PAGE_MAP: Record<PageId, React.ReactNode> = {
  dashboard: <DashboardPage />,
  pay:       <PaymentPage />,
  receipts:  <ReceiptsPage />,
  verify:    <AdminDashboard />,
  vault:     <VaultPage />,
  chain:     <ChainActivityPage />,
  settings:  <SettingsPage />,
}

export function AppShell() {
  const [activePage, setActivePage] = useState<PageId>('dashboard')
  const [mobileOpen, setMobileOpen] = useState(false)
  const { notifications, dismiss } = useNotifications()

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#080a0e]">
      <Topbar onMenuToggle={() => setMobileOpen(v => !v)} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          active={activePage}
          onChange={(id) => setActivePage(id as PageId)}
          isMobileOpen={mobileOpen}
          onClose={() => setMobileOpen(false)}
        />

        <main className="flex-1 overflow-y-auto p-5 md:p-6">
          {PAGE_MAP[activePage]}
        </main>
      </div>

      <ToastContainer notifications={notifications} onDismiss={dismiss} />
    </div>
  )
}
