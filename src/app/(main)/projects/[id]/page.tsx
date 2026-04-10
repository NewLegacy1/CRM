import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ProjectOverviewClient } from './project-overview-client'

export default async function ProjectOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  
  const [
    { data: project },
    { data: team },
    { data: invoices },
  ] = await Promise.all([
    supabase
      .from('projects')
      .select('*, client:clients(id, name)')
      .eq('id', id)
      .single(),
    supabase
      .from('profiles')
      .select('id, display_name, role'),
    supabase
      .from('invoices')
      .select('id, amount_total, status, created_at')
      .order('created_at', { ascending: false }),
  ])

  if (!project) notFound()

  return (
    <ProjectOverviewClient
      project={project}
      teamMembers={team ?? []}
      allInvoices={invoices ?? []}
    />
  )
}
