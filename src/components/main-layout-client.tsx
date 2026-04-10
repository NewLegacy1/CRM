'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/sidebar'
import { Header } from '@/components/header'
import type { UserRole } from '@/types/database'

interface MainLayoutClientProps {
  role: UserRole
  userEmail?: string | null
  displayName?: string | null
  children: React.ReactNode
}

export function MainLayoutClient({
  role,
  userEmail,
  displayName,
  children,
}: MainLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="relative min-h-screen bg-zinc-950">
      <div className="crm-app-atmosphere pointer-events-none" aria-hidden />
      <Sidebar
        role={role}
        open={sidebarOpen}
        onOpenChange={setSidebarOpen}
      />
      <div className="relative z-10 lg:pl-56 min-h-screen">
        <Header
          userEmail={userEmail}
          displayName={displayName}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="p-4 lg:p-6 bg-gradient-to-b from-zinc-950 via-zinc-950/95 to-zinc-950">
          {children}
        </main>
      </div>
    </div>
  )
}
