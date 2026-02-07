'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center max-h-[100dvh] overflow-hidden">
      <div
        className="fixed inset-0 bg-black/80"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-50 max-h-[100dvh] w-full flex items-center justify-center p-4 overflow-hidden">
        {children}
      </div>
    </div>
  )
}

interface DialogContentProps {
  children: React.ReactNode
  className?: string
}

export function DialogContent({ children, className }: DialogContentProps) {
  return (
    <div
      className={cn(
        'relative w-full max-w-lg max-h-[64dvh] min-h-0 overflow-y-auto overflow-x-hidden rounded-2xl border border-white/[0.06] bg-zinc-900/80 backdrop-blur-xl p-6 shadow-2xl overscroll-contain touch-pan-y',
        className
      )}
      style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
    >
      {children}
    </div>
  )
}

interface DialogHeaderProps {
  children: React.ReactNode
}

export function DialogHeader({ children }: DialogHeaderProps) {
  return <div className="mb-4 space-y-1.5">{children}</div>
}

interface DialogTitleProps {
  children: React.ReactNode
}

export function DialogTitle({ children }: DialogTitleProps) {
  return <h2 className="text-lg font-semibold text-zinc-100">{children}</h2>
}

interface DialogCloseProps {
  onClick: () => void
}

export function DialogClose({ onClick }: DialogCloseProps) {
  return (
    <button
      onClick={onClick}
      className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-zinc-900 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
    >
      <X className="h-4 w-4 text-zinc-400" />
      <span className="sr-only">Close</span>
    </button>
  )
}
