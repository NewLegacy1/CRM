import { createClient } from '@/lib/supabase/server'
import { ProjectsTable } from './projects-table'
import { fetchPendingContractCountsByProject } from '@/lib/onboarding/project-onboarding'

export default async function ProjectsPage() {
  const supabase = await createClient()
  
  const [{ data: projects }, { data: clients }, pendingContractCounts] = await Promise.all([
    supabase
      .from('projects')
      .select('*, client:clients(id, name)')
      .order('created_at', { ascending: false }),
    supabase.from('clients').select('id, name').order('name'),
    fetchPendingContractCountsByProject(supabase),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Projects</h1>
          {Object.values(pendingContractCounts).reduce((a, b) => a + b, 0) > 0 ? (
            <p className="mt-1 text-sm text-violet-400">
              {Object.values(pendingContractCounts).reduce((a, b) => a + b, 0)} contract submission
              {Object.values(pendingContractCounts).reduce((a, b) => a + b, 0) > 1 ? 's' : ''}{' '}
              need invoice review
            </p>
          ) : null}
        </div>
      </div>
      <ProjectsTable
        initialProjects={projects ?? []}
        clients={clients ?? []}
        pendingContractCounts={pendingContractCounts}
      />
    </div>
  )
}
