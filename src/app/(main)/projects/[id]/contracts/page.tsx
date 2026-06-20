import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { fetchProjectOnboardingLinks } from '@/lib/onboarding/project-onboarding'
import { ProjectContractsPanel } from './project-contracts-panel'

export default async function ProjectContractsPage({
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

  const links = await fetchProjectOnboardingLinks(supabase, id)

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-zinc-100">Contracts &amp; onboarding</h2>
      <ProjectContractsPanel projectId={id} initialLinks={links} />
    </div>
  )
}
