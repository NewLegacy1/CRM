import { createClient } from '@/lib/supabase/server'
import { SitesTable } from './sites-table'

export default async function SitesPage() {
  const supabase = await createClient()
  
  const [{ data: sites }, { data: clients }] = await Promise.all([
    supabase
      .from('sites')
      .select('*, client:clients(id, name)')
      .order('created_at', { ascending: false }),
    supabase.from('clients').select('id, name').order('name'),
  ])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-100">Sites</h1>
      <SitesTable initialSites={sites ?? []} clients={clients ?? []} />
    </div>
  )
}
