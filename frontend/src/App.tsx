import React from 'react'
import { AuthProvider, useAuth } from '@/store/AuthContext'
import { NotificationProvider } from '@/store/NotificationContext'
import { PaymentProvider } from '@/store/PaymentContext'
import { LoginPage } from '@/modules/auth/LoginPage'
import { AppShell } from '@/components/layout/AppShell'

function AppContent() {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <AppShell /> : <LoginPage />
}

export default function App() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <PaymentProvider>
          <AppContent />
        </PaymentProvider>
      </AuthProvider>
    </NotificationProvider>
  )
}
