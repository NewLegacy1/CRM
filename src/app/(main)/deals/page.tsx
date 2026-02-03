import { createClient } from '@/lib/supabase/server'
import { DealsTable } from './deals-table'

export default async function DealsPage() {
  const supabase = await createClient()
  
  const [{ data: deals }, { data: clients }] = await Promise.all([
    supabase
      .from('deals')
      .select('*, client:clients(id, name)')
      .order('created_at', { ascending: false }),
    supabase.from('clients').select('id, name').order('name'),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-100">Deals</h1>
      </div>
      <DealsTable
        initialDeals={deals ?? []}
        clients={clients ?? []}
      />
    </div>
  )
}
