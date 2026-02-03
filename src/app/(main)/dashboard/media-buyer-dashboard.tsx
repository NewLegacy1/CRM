import { createClient } from '@/lib/supabase/server'
import { Megaphone, GitBranch, Globe } from 'lucide-react'
import { QuickActions } from './quick-actions'

export async function MediaBuyerDashboard() {
  const supabase = await createClient()

  const [
    { count: adsCount },
    { count: funnelsCount },
    { count: sitesCount },
  ] = await Promise.all([
    supabase.from('ads').select('*', { count: 'exact', head: true }),
    supabase.from('funnels').select('*', { count: 'exact', head: true }),
    supabase.from('sites').select('*', { count: 'exact', head: true }),
  ])

  const stats = [
    { label: 'Ad Campaigns', value: adsCount ?? 0, icon: Megaphone },
    { label: 'Funnels', value: funnelsCount ?? 0, icon: GitBranch },
    { label: 'Sites', value: sitesCount ?? 0, icon: Globe },
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/[0.06] bg-zinc-900/40 backdrop-blur-xl p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-zinc-100">{stat.value}</p>
                </div>
                <Icon className="h-8 w-8 text-amber-500" />
              </div>
            </div>
          )
        })}
      </div>
      <QuickActions />
    </div>
  )
}
