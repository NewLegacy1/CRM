'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { getNavItemsForRole } from '@/lib/nav-config'
import type { UserRole } from '@/types/database'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'
import { BrandWordmarkLink } from '@/components/brand-wordmark'

interface SidebarProps {
  role: UserRole
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function Sidebar({ role, open, onOpenChange }: SidebarProps) {
  const pathname = usePathname()
  const items = getNavItemsForRole(role)

  return (
    <>
      {/* Mobile overlay - glass blur */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/50 backdrop-blur-md lg:hidden transition-opacity',
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => onOpenChange(false)}
      />

      {/* Sidebar - glass UI */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-56 transition-transform duration-200 ease-out lg:translate-x-0',
          'bg-zinc-950/70 backdrop-blur-xl border-r border-white/[0.06]',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/[0.06] px-4 lg:px-6">
          <BrandWordmarkLink
            href="/dashboard"
            compact
            className="text-zinc-100"
            onClick={() => onOpenChange(false)}
          />
          <button
            type="button"
            className="lg:hidden rounded-lg p-2 text-zinc-400 hover:bg-white/5 hover:text-zinc-100 transition-colors"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="space-y-0.5 p-4">
          {items.map((item) => {
            const Icon = item.icon
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onOpenChange(false)}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-violet-500/15 text-violet-300 shadow-[inset_0_0_0_1px_rgba(167,139,250,0.25)]'
                    : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-100'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
