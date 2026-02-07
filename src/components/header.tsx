'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Menu } from 'lucide-react'

interface HeaderProps {
  userEmail?: string | null
  displayName?: string | null
  onMenuClick?: () => void
}

export function Header({ userEmail, displayName, onMenuClick }: HeaderProps) {
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/[0.06] bg-zinc-950/50 px-4 lg:px-6 backdrop-blur-xl">
      <button
        type="button"
        onClick={onMenuClick}
        className="lg:hidden rounded-xl p-2 text-zinc-400 hover:bg-white/5 hover:text-zinc-100 transition-colors"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="flex-1 lg:flex-none lg:w-56" />
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-zinc-400 truncate max-w-[120px] lg:max-w-none">
          {displayName || userEmail || 'User'}
        </span>
        <button
          onClick={handleSignOut}
          className="rounded-xl px-3 py-1.5 text-sm text-zinc-400 hover:bg-white/5 hover:text-zinc-100 transition-colors"
        >
          Sign out
        </button>
      </div>
    </header>
  )
}
