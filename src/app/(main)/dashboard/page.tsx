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

  const role = (profile?.role as UserRole) ?? 'pending'

  // Show pending message for users without an assigned role
  if (role === 'pending') {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-8 text-center">
          <h2 className="text-xl font-bold text-amber-400 mb-2">Account Pending Approval</h2>
          <p className="text-zinc-400">
            Your account is waiting for approval. Once an administrator assigns you a role, you'll be able to access the CRM.
          </p>
        </div>
      </div>
    )
  }

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
