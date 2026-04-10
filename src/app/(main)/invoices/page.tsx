import { createClient } from '@/lib/supabase/server'
import { InvoicesList } from './invoices-list'

export default async function InvoicesPage() {
  const supabase = await createClient()
  
  const [{ data: invoices }, { data: clients }] = await Promise.all([
    supabase
      .from('invoices')
      .select('*, client:clients(id, name, email)')
      .order('created_at', { ascending: false }),
    supabase.from('clients').select('id, name, email').order('name'),
  ])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-100">Invoices</h1>
      <InvoicesList
        initialInvoices={invoices ?? []}
        clients={clients ?? []}
      />
    </div>
  )
}
