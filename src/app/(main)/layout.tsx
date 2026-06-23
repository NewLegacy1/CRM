import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MainLayoutClient } from '@/components/main-layout-client'
import { getUnseenSubscriberCount } from '@/lib/products/notifications'
import type { UserRole } from '@/types/database'

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, display_name')
    .eq('id', user.id)
    .single()

  const role = (profile?.role as UserRole) ?? 'pending'

  let navBadges: Record<string, number> | undefined
  if (role === 'owner') {
    const newSubscriberCount = await getUnseenSubscriberCount(supabase, user.id)
    if (newSubscriberCount > 0) {
      navBadges = { '/products': newSubscriberCount }
    }
  }

  return (
    <MainLayoutClient
      role={role}
      userEmail={user.email}
      displayName={profile?.display_name}
      navBadges={navBadges}
    >
      {children}
    </MainLayoutClient>
  )
}
