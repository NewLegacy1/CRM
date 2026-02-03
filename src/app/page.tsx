import { redirect } from 'next/navigation'

export default async function HomePage() {
  // Always redirect to login - let login page handle auth check
  // This ensures the root route always works
  redirect('/login')
}
