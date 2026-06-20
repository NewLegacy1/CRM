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
    .select('id, name, client:clients(id, name, email, company)')
    .eq('id', id)
    .single()

  if (!project) notFound()

  const links = await fetchProjectOnboardingLinks(supabase, id)
  const client = project.client as
    | { id: string; name: string | null; email: string | null; company: string | null }
    | null

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-zinc-100">Contracts &amp; onboarding</h2>
      <ProjectContractsPanel
        projectId={id}
        projectName={project.name}
        clientId={client?.id ?? null}
        clientName={client?.name ?? null}
        clientEmail={client?.email ?? null}
        clientCompany={client?.company ?? null}
        initialLinks={links}
      />
    </div>
  )
}
