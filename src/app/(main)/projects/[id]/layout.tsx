import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  countPendingForProject,
  fetchProjectOnboardingLinks,
} from '@/lib/onboarding/project-onboarding'
import { ProjectTabs } from './project-tabs'

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: project } = await supabase
    .from('projects')
    .select('*, client:clients(id, name)')
    .eq('id', id)
    .single()

  if (!project) notFound()

  const onboardingLinks = await fetchProjectOnboardingLinks(supabase, id)
  const pendingContractsCount = countPendingForProject(onboardingLinks)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <Link
          href="/projects"
          className="text-sm text-zinc-400 hover:text-zinc-100"
        >
          ← Projects
        </Link>
        <h1 className="text-2xl font-bold text-zinc-100">{project.name}</h1>
        <span className="text-zinc-500">·</span>
        <span className="text-zinc-400">{project.client?.name}</span>
        {pendingContractsCount > 0 ? (
          <span className="inline-flex items-center rounded-full bg-violet-500/20 px-2.5 py-1 text-xs font-medium text-violet-300">
            {pendingContractsCount} new contract submission
            {pendingContractsCount > 1 ? 's' : ''}
          </span>
        ) : null}
      </div>
      <ProjectTabs projectId={id} pendingContractsCount={pendingContractsCount} />
      {children}
    </div>
  )
}
