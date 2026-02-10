import { createClient } from '@/lib/supabase/server'
import { TeamTable } from './team-table'

export default async function TeamPage() {
  const supabase = await createClient()
  
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-100">Team</h1>
      <TeamTable initialProfiles={profiles ?? []} />
    </div>
  )
}
