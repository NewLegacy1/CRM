import { createClient } from '@/lib/supabase/server'
import { CallingScreen } from './calling-screen'

export default async function CallingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: leadLists } = await supabase
    .from('lead_lists')
    .select('id, name, niche')
    .order('name')

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-100">Cold Calling</h1>
      <CallingScreen leadLists={leadLists ?? []} userId={user?.id ?? ''} />
    </div>
  )
}
