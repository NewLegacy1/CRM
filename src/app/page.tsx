import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function HomePage() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) redirect('/dashboard')
    redirect('/login')
  } catch (error) {
    // If Supabase is not configured, redirect to login page
    // This prevents 404 errors when env vars are missing
    redirect('/login')
  }
}
