import { createClient } from '@/lib/supabase/server'
import { ClientsTable } from './clients-table'

export default async function ClientsPage() {
  const supabase = await createClient()
  
  const { data: clients, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching clients:', error)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-100">Clients</h1>
      </div>
      <ClientsTable initialClients={clients ?? []} />
    </div>
  )
}
