import { createClient } from '@/lib/supabase/server'
import type { UserRole } from '@/types/database'
import { OwnerDashboard } from './owner-dashboard'
import { CloserDashboard } from './closer-dashboard'
import { MediaBuyerDashboard } from './media-buyer-dashboard'
import { ColdCallerDashboard } from './cold-caller-dashboard'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id ?? '')
    .single()

  const role = (profile?.role as UserRole) ?? 'cold_caller'

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-100">Dashboard</h1>
      {role === 'owner' && <OwnerDashboard />}
      {role === 'closer' && <CloserDashboard />}
      {role === 'media_buyer' && <MediaBuyerDashboard />}
      {role === 'cold_caller' && <ColdCallerDashboard />}
    </div>
  )
}
