import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { AdCreativesList } from '@/app/(main)/ads/ad-creatives-list'
import type { UserRole } from '@/types/database'

export default async function ProjectAdsPage({
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

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id ?? '')
    .single()

  const role = (profile?.role as UserRole) ?? 'pending'

  const { data: creatives } = await supabase
    .from('ad_creatives')
    .select('*')
    .eq('project_id', id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-zinc-100">Client Ads (Creatives)</h2>
      <p className="text-sm text-zinc-400">
        Copy and creative assets for this project. Media buyers can use these in the main Ads page.
      </p>
      <AdCreativesList projectId={id} initialCreatives={creatives ?? []} isDemo={role === 'demo'} />
    </div>
  )
}
