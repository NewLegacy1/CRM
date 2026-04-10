import { createClient } from '@/lib/supabase/server'
import { LeadsTable } from './leads-table'
import { LeadsCsvUpload } from './leads-csv-upload'
import { LeadListsTable } from './lead-lists-table'

export default async function LeadsPage() {
  const supabase = await createClient()
  
  const [{ data: leads }, { data: leadLists }, { data: allLeadLists }] = await Promise.all([
    supabase
      .from('leads')
      .select('*, list:lead_lists(id, name)')
      .order('created_at', { ascending: false })
      .limit(1000),
    supabase.from('lead_lists').select('id, name').order('name'),
    supabase.from('lead_lists').select('id, name, niche, total_count, created_at').order('name'),
  ])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-zinc-100">Leads</h1>
        <div className="flex gap-2">
          <LeadListsTable initialLeadLists={allLeadLists ?? []} />
          <LeadsCsvUpload leadLists={leadLists ?? []} />
        </div>
      </div>
      <LeadsTable
        initialLeads={leads ?? []}
        leadLists={leadLists ?? []}
      />
    </div>
  )
}
