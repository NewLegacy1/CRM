import { createClient } from '@/lib/supabase/server'
import { ProjectsTable } from './projects-table'

export default async function ProjectsPage() {
  const supabase = await createClient()
  
  const [{ data: projects }, { data: clients }] = await Promise.all([
    supabase
      .from('projects')
      .select('*, client:clients(id, name)')
      .order('created_at', { ascending: false }),
    supabase.from('clients').select('id, name').order('name'),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-100">Projects</h1>
      </div>
      <ProjectsTable
        initialProjects={projects ?? []}
        clients={clients ?? []}
      />
    </div>
  )
}
