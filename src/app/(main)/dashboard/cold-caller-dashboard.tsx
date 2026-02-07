import { createClient } from '@/lib/supabase/server'
import { Phone, UserPlus, Calendar } from 'lucide-react'
import { QuickActions } from './quick-actions'

export async function ColdCallerDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [
    { count: callsCount },
    { count: leadsCount },
    { count: bookedCount },
  ] = await Promise.all([
    supabase.from('call_logs').select('*', { count: 'exact', head: true }).eq('cold_caller_id', user?.id ?? ''),
    supabase.from('leads').select('*', { count: 'exact', head: true }).eq('cold_caller_id', user?.id ?? ''),
    supabase.from('meetings').select('*', { count: 'exact', head: true }).eq('booked_by', user?.id ?? ''),
  ])

  const stats = [
    { label: 'Total Calls', value: callsCount ?? 0, icon: Phone },
    { label: 'My Leads', value: leadsCount ?? 0, icon: UserPlus },
    { label: 'Meetings Booked', value: bookedCount ?? 0, icon: Calendar },
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
