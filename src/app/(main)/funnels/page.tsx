import { createClient } from '@/lib/supabase/server'
import { FunnelsTable } from './funnels-table'

export default async function FunnelsPage() {
  const supabase = await createClient()
  
  const [{ data: funnels }, { data: clients }] = await Promise.all([
    supabase
      .from('funnels')
      .select('*, client:clients(id, name)')
      .order('created_at', { ascending: false }),
    supabase.from('clients').select('id, name').order('name'),
  ])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-100">Funnels</h1>
      <FunnelsTable initialFunnels={funnels ?? []} clients={clients ?? []} />
    </div>
  )
}
