import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { FunnelsList } from './funnels-list'

export default async function ProjectFunnelsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: project } = await supabase
    .from('projects')
    .select('id, name')
    .eq('id', id)
    .single()

  if (!project) notFound()

  const { data: projectRow } = await supabase
    .from('projects')
    .select('client_id')
    .eq('id', id)
    .single()
  const { data: funnelsList } = projectRow
    ? await supabase
        .from('funnels')
        .select('*')
        .eq('client_id', projectRow.client_id)
        .order('created_at', { ascending: false })
    : { data: [] }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-zinc-100">Funnels</h2>
      <FunnelsList
        projectId={id}
        clientId={projectRow?.client_id ?? ''}
        initialFunnels={funnelsList ?? []}
      />
    </div>
  )
}
