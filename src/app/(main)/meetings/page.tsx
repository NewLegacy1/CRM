import { createClient } from '@/lib/supabase/server'
import { CalendlyCalendarView } from './calendly-calendar-view'
import { MeetingsPageClient } from './meetings-page-client'
import type { UserRole } from '@/types/database'

export default async function MeetingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id ?? '')
    .single()
  
  const role = (profile?.role as UserRole) ?? 'cold_caller'
  const hasToken = !!process.env.CALENDLY_API_TOKEN

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-zinc-100">Meetings</h1>
        <MeetingsPageClient role={role} />
      </div>
      {hasToken ? (
        <CalendlyCalendarView />
      ) : (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 text-center text-zinc-400">
          <p>Configure <code className="text-amber-500">CALENDLY_API_TOKEN</code> in environment variables to view your calendar events here.</p>
        </div>
      )}
    </div>
  )
}
