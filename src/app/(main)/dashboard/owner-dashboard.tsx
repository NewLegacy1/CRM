import { createClient } from '@/lib/supabase/server'
import { Users, FolderKanban, HandCoins, UserPlus } from 'lucide-react'
import { QuickActions } from './quick-actions'

export async function OwnerDashboard() {
  const supabase = await createClient()

  const [
    { count: clientsCount },
    { count: projectsCount },
    { count: dealsCount },
    { count: leadsCount },
  ] = await Promise.all([
    supabase.from('clients').select('*', { count: 'exact', head: true }),
    supabase.from('projects').select('*', { count: 'exact', head: true }),
    supabase.from('deals').select('*', { count: 'exact', head: true }),
    supabase.from('leads').select('*', { count: 'exact', head: true }),
  ])

  const stats = [
    { label: 'Clients', value: clientsCount ?? 0, icon: Users },
    { label: 'Projects', value: projectsCount ?? 0, icon: FolderKanban },
    { label: 'Deals', value: dealsCount ?? 0, icon: HandCoins },
    { label: 'Leads', value: leadsCount ?? 0, icon: UserPlus },
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/[0.06] bg-zinc-900/40 backdrop-blur-xl p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-zinc-400">{stat.label}</p>
                  <p className="text-2xl font-bold tracking-tight text-zinc-100">{stat.value}</p>
                </div>
                <Icon className="h-8 w-8 text-amber-500/90" />
              </div>
            </div>
          )
        })}
      </div>
      <QuickActions />
    </div>
  )
}
