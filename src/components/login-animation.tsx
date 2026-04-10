'use client'

import { useEffect, useState } from 'react'
import { BrandWordmark } from '@/components/brand-wordmark'

interface LoginAnimationProps {
  onComplete: () => void
}

export function LoginAnimation({ onComplete }: LoginAnimationProps) {
  const [phase, setPhase] = useState<'glow' | 'rise' | 'fade'>('glow')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    const glowTimer = setTimeout(() => {
      setPhase('rise')
    }, 600)

    const riseTimer = setTimeout(() => {
      setPhase('fade')
    }, 1600)

    const fadeTimer = setTimeout(() => {
      onComplete()
    }, 2200)

    return () => {
      clearTimeout(glowTimer)
      clearTimeout(riseTimer)
      clearTimeout(fadeTimer)
    }
  }, [onComplete])

  if (!mounted) {
    return null
  }

  const auroraBg =
    phase === 'glow' || phase === 'rise'
      ? 'radial-gradient(circle at 50% 45%, rgba(34, 211, 238, 0.22) 0%, rgba(167, 139, 250, 0.14) 35%, transparent 65%)'
      : 'radial-gradient(circle at 50% 45%, rgba(34, 211, 238, 0.1) 0%, rgba(167, 139, 250, 0.06) 35%, transparent 65%)'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950">
      <div
        className={`absolute inset-0 transition-all duration-700 ease-out ${
          phase === 'fade' ? 'opacity-0' : 'opacity-100'
        }`}
        style={{ background: auroraBg }}
      />

      <div className="relative z-10">
        <div
          className={`transition-all duration-700 ease-out ${
            phase === 'glow'
              ? 'opacity-0 scale-75 translate-y-16 blur-sm'
              : phase === 'rise'
                ? 'opacity-100 scale-100 translate-y-0 blur-0'
                : 'opacity-0 scale-95 translate-y-[-8px] blur-0'
          }`}
        >
          <div className="relative flex flex-col items-center">
            <div
              className={`pointer-events-none absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-700 ${
                phase === 'rise'
                  ? 'bg-violet-500/15 blur-3xl scale-150'
                  : 'opacity-0 scale-50'
              }`}
              aria-hidden
            />
            <div className="relative z-10 rounded-2xl px-8 py-6 text-center drop-shadow-[0_0_28px_rgba(167,139,250,0.25)]">
              <BrandWordmark className="text-2xl tracking-[0.08em] md:text-3xl" />
            </div>
          </div>
        </div>
      </div>

      <div
        className={`absolute inset-0 bg-zinc-950 transition-opacity duration-500 ease-in ${
          phase === 'fade' ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  )
}
