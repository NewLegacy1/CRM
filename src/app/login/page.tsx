'use client'

import { Suspense, useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { LoginAnimation } from '@/components/login-animation'
import { BrandWordmark } from '@/components/brand-wordmark'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showAnimation, setShowAnimation] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') ?? '/dashboard'

  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push(redirectTo)
        router.refresh()
      }
    }
    checkSession()
  }, [router, redirectTo])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    setShowAnimation(true)
    setTimeout(() => {
      router.push(redirectTo)
      router.refresh()
    }, 2500)
  }

  if (showAnimation) {
    return <LoginAnimation onComplete={() => setShowAnimation(false)} />
  }

  return (
    <div className="relative min-h-screen">
      <div className="crm-app-atmosphere" aria-hidden />
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-8">
          <div className="text-center">
            <div className="mb-3 flex justify-center">
              <BrandWordmark />
            </div>
            <p className="mt-1 text-sm text-zinc-400">Sign in to your account</p>
          </div>
          <div className="rounded-[1.25rem] border-galaxy-neon p-[1px]">
            <form
              onSubmit={handleSubmit}
              className="space-y-6 rounded-[calc(1.25rem-1px)] card-galaxy-glass p-8 ring-1 ring-white/[0.08] shadow-xl"
            >
              {error && (
                <div className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
                  {error}
                </div>
              )}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-zinc-300">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-lg border border-zinc-700 bg-zinc-800/80 px-3 py-2 text-zinc-100 placeholder-zinc-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  placeholder="you@agency.com"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-zinc-300">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-lg border border-zinc-700 bg-zinc-800/80 px-3 py-2 text-zinc-100 placeholder-zinc-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-gradient-to-br from-[var(--aurora-cyan)] to-[var(--aurora-violet)] px-4 py-2.5 font-semibold text-[#09090b] shadow-[0_4px_20px_rgba(167,139,250,0.25)] transition hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2 focus:ring-offset-zinc-950 disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
              <p className="text-center text-sm text-zinc-400">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="text-violet-400 hover:text-violet-300">
                  Sign up
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="relative min-h-screen">
          <div className="crm-app-atmosphere" aria-hidden />
          <div className="relative z-10 flex min-h-screen items-center justify-center">
            <div className="text-zinc-400">Loading...</div>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
