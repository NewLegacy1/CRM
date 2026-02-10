'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface ProjectTabsProps {
  projectId: string
}

export function ProjectTabs({ projectId }: ProjectTabsProps) {
  const pathname = usePathname()
  const base = `/projects/${projectId}`

  const tabs = [
    { href: base, label: 'Overview' },
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
              'px-4 py-2 text-sm font-medium rounded-t-lg transition-colors',
              isActive
                ? 'bg-zinc-800 text-amber-500'
                : 'text-zinc-400 hover:text-zinc-100'
            )}
          >
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
