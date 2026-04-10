'use client'

interface MeetingsCalendarEmbedProps {
  embedUrl: string
}

export function MeetingsCalendarEmbed({ embedUrl }: MeetingsCalendarEmbedProps) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
      <div className="aspect-video min-h-[400px] w-full">
        <iframe
          src={embedUrl}
          title="Meetings Calendar"
          className="h-full w-full border-0"
          allowFullScreen
        />
      </div>
    </div>
  )
}
