'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface ProjectTabsProps {
  projectId: string
  pendingContractsCount?: number
}

export function ProjectTabs({ projectId, pendingContractsCount = 0 }: ProjectTabsProps) {
  const pathname = usePathname()
  const base = `/projects/${projectId}`

  const tabs = [
    { href: base, label: 'Overview' },
    { href: `${base}/contracts`, label: 'Contracts', badge: pendingContractsCount },
    { href: `${base}/funnels`, label: 'Funnels' },
    { href: `${base}/ads`, label: 'Client Ads' },
  ]

  return (
    <nav className="flex gap-1 border-b border-zinc-800">
      {tabs.map((tab) => {
        const isActive =
          tab.href === base
            ? pathname === base
            : pathname.startsWith(tab.href)
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              'relative inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors',
              isActive
                ? 'bg-zinc-800 text-violet-400'
                : 'text-zinc-400 hover:text-zinc-100'
            )}
          >
            {tab.label}
            {tab.badge && tab.badge > 0 ? (
              <span className="inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-violet-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                {tab.badge}
              </span>
            ) : null}
          </Link>
        )
      })}
    </nav>
  )
}
