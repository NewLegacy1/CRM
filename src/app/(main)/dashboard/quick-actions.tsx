'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { UserPlus, Upload, FileText, Calendar } from 'lucide-react'

export function QuickActions() {
  const router = useRouter()

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-zinc-900/40 backdrop-blur-xl p-6">
      <h2 className="text-lg font-semibold text-zinc-100 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Button
          variant="outline"
          onClick={() => router.push('/clients')}
          className="flex flex-col items-center gap-2 h-auto py-4"
        >
          <UserPlus className="h-5 w-5" />
          <span className="text-sm">Add Client</span>
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push('/leads')}
          className="flex flex-col items-center gap-2 h-auto py-4"
        >
          <Upload className="h-5 w-5" />
          <span className="text-sm">Upload Leads</span>
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push('/invoices')}
          className="flex flex-col items-center gap-2 h-auto py-4"
        >
          <FileText className="h-5 w-5" />
          <span className="text-sm">Send Invoice</span>
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push('/meetings')}
          className="flex flex-col items-center gap-2 h-auto py-4"
        >
          <Calendar className="h-5 w-5" />
          <span className="text-sm">New Meeting</span>
        </Button>
      </div>
    </div>
  )
}
