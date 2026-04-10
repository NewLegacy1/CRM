import { createClient } from '@/lib/supabase/server'
import { UpdatesFeed } from './updates-feed'

export default async function UpdatesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Check if user is owner or demo
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id ?? '')
    .single()

  if (profile?.role !== 'owner' && profile?.role !== 'demo') {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4">
          <p className="text-red-400">Access denied. Only owners and demo users can view activity updates.</p>
        </div>
      </div>
    )
  }

  // Fetch recent activity (last 500 entries)
  const { data: activities } = await supabase
    .from('activity_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Activity Updates</h1>
          <p className="text-sm text-zinc-400 mt-1">Track all changes and activities across your CRM</p>
        </div>
      </div>
      <UpdatesFeed initialActivities={activities ?? []} />
    </div>
  )
}
