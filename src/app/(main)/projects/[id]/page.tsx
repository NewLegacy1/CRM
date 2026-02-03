import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export default async function ProjectOverviewPage({
  params,
}: {
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

  const updates = (project.updates as { text: string; at: string }[]) ?? []

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <p className="text-sm text-zinc-400">Type</p>
          <p className="text-lg font-medium text-zinc-100 capitalize mt-1">
            {(project as { type?: string }).type?.replace('_', ' ') ?? 'Website'}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <p className="text-sm text-zinc-400">Progress</p>
          <div className="mt-2 flex items-center gap-4">
            <div className="relative w-20 h-20">
              <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="15"
                  fill="none"
                  stroke="rgb(39 39 42)"
                  strokeWidth="3"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="15"
                  fill="none"
                  stroke="rgb(34 197 94)"
                  strokeWidth="3"
                  strokeDasharray={`${94.25 * ((project as { progress?: number }).progress ?? 0) / 100}, 94.25`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-base font-semibold text-zinc-100">
                  {(project as { progress?: number }).progress ?? 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <p className="text-sm text-zinc-400">Status</p>
          <p className="text-lg font-medium text-amber-500 mt-1 capitalize">
            {project.status}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h2 className="text-lg font-semibold text-zinc-100 mb-4">Updates</h2>
        {updates.length === 0 ? (
          <p className="text-sm text-zinc-500">No updates yet.</p>
        ) : (
          <ul className="space-y-3">
            {updates.map((u, i) => (
              <li
                key={i}
                className="flex justify-between gap-4 border-b border-zinc-800 pb-3 last:border-0"
              >
                <span className="text-zinc-300">{u.text}</span>
                <span className="text-xs text-zinc-500 shrink-0">
                  {new Date(u.at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'numeric',
                    day: 'numeric',
                  })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
