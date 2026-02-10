'use client'

import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface Meeting {
  id: string
  scheduled_at: string
  source: string
  notes: string | null
  lead?: { name: string; phone: string }
}

interface MeetingsTableProps {
  initialMeetings: Meeting[]
}

export function MeetingsTable({ initialMeetings }: MeetingsTableProps) {
  const [meetings] = useState<Meeting[]>(initialMeetings)

  function formatDateTime(isoString: string) {
    const date = new Date(isoString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Lead</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Scheduled</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {meetings.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-zinc-500">
                No meetings scheduled yet.
              </TableCell>
            </TableRow>
          ) : (
            meetings.map((meeting) => (
              <TableRow key={meeting.id}>
                <TableCell className="font-medium">
                  {meeting.lead?.name || '—'}
                </TableCell>
                <TableCell>{meeting.lead?.phone || '—'}</TableCell>
                <TableCell>{formatDateTime(meeting.scheduled_at)}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-amber-500/10 text-amber-500">
                    {meeting.source}
                  </span>
                </TableCell>
                <TableCell className="max-w-xs truncate">
                  {meeting.notes || '—'}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
