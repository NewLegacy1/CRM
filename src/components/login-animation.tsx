'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

interface LoginAnimationProps {
  onComplete: () => void
}

export function LoginAnimation({ onComplete }: LoginAnimationProps) {
  const [phase, setPhase] = useState<'glow' | 'rise' | 'fade'>('glow')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Phase 1: Golden glow appears (0-600ms)
    const glowTimer = setTimeout(() => {
      setPhase('rise')
    }, 600)

    // Phase 2: Logo rises up (600-1600ms)
    const riseTimer = setTimeout(() => {
      setPhase('fade')
    }, 1600)

    // Phase 3: Fade out and show login form (1600-2200ms)
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950">
      {/* Animated golden glow background */}
      <div
        className={`absolute inset-0 transition-all duration-700 ease-out ${
          phase === 'glow'
            ? 'bg-gradient-radial from-amber-500/30 via-amber-500/10 to-transparent opacity-100'
            : phase === 'rise'
            ? 'bg-gradient-radial from-amber-500/40 via-amber-500/15 to-transparent opacity-100'
            : 'bg-gradient-radial from-amber-500/20 via-amber-500/5 to-transparent opacity-0'
        }`}
        style={{
          background: phase === 'glow' || phase === 'rise'
            ? 'radial-gradient(circle at center, rgba(245, 158, 11, 0.3) 0%, rgba(245, 158, 11, 0.1) 40%, transparent 70%)'
            : 'radial-gradient(circle at center, rgba(245, 158, 11, 0.2) 0%, rgba(245, 158, 11, 0.05) 40%, transparent 70%)',
        }}
      />

      {/* Logo container with smooth animations */}
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
          <div className="relative">
            {/* Glowing ring around logo */}
            <div
              className={`absolute inset-0 rounded-full transition-all duration-700 ${
                phase === 'rise'
                  ? 'bg-amber-500/20 blur-2xl scale-150 animate-pulse'
                  : 'opacity-0'
              }`}
              style={{
                width: '200px',
                height: '200px',
                margin: '-100px',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            />
            
            {/* Logo image */}
            <Image
              src="/logo.png?v=2"
              alt="New Legacy Logo"
              width={160}
              height={160}
              className="relative z-10 object-contain drop-shadow-[0_0_30px_rgba(245,158,11,0.5)]"
              priority
              unoptimized
            />
          </div>
        </div>
      </div>

      {/* Fade out overlay */}
      <div
        className={`absolute inset-0 bg-zinc-950 transition-opacity duration-600 ease-in ${
          phase === 'fade' ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  )
}
