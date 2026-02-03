'use client'

import { Button } from '@/components/ui/button'
import { Calendar, Plus } from 'lucide-react'
import type { UserRole } from '@/types/database'

interface MeetingsPageClientProps {
  role: UserRole
}

export function MeetingsPageClient({ role }: MeetingsPageClientProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        size="sm"
        className="text-xs whitespace-nowrap"
        onClick={() => window.open('https://calendly.com/newlegacyai/consultation', '_blank')}
      >
        <Plus className="mr-2 h-3 w-3" />
        New Meeting
      </Button>
      {role === 'owner' && (
        <Button
          size="sm"
          variant="outline"
          className="text-xs whitespace-nowrap"
          onClick={() => window.open('https://calendly.com/newlegacyai/new-meeting', '_blank')}
        >
          <Calendar className="mr-2 h-3 w-3" />
          Site Creation Meeting
        </Button>
      )}
    </div>
  )
}
