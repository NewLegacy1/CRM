'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, MapPin, Users, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CalendlyEvent {
  id: string
  uri: string
  name: string
  start_time: string
  end_time: string
  location?: {
    type: string
    location: string
  }
  invitees: string[]
  invitee_count: number
  status: string
  event_type: string
}

export function CalendlyCalendarView() {
  const [events, setEvents] = useState<CalendlyEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function fetchEvents() {
    try {
      setError(null)
      const res = await fetch('/api/calendly/events')
      
      // Check if response is ok before parsing JSON
      if (!res.ok) {
        let errorMsg = `Failed to load events (${res.status})`
        try {
          const errorData = await res.json()
          errorMsg = errorData.error || errorMsg
        } catch {
          // If JSON parsing fails, use status text
          errorMsg = `Failed to load events: ${res.status} ${res.statusText}`
        }
        console.error('Calendly API error:', errorMsg, res.status)
        setError(errorMsg)
        setEvents([])
        setLoading(false)
        setRefreshing(false)
        return
      }
      
      const data = await res.json()
      
      // Validate response structure
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response format from API')
      }
      
      setEvents(Array.isArray(data.events) ? data.events : [])
      setError(null)
    } catch (err) {
      console.error('Failed to fetch events:', err)
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(`Failed to load events: ${errorMessage}`)
      setEvents([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  function handleRefresh() {
    setRefreshing(true)
    setError(null)
    fetchEvents()
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-12 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
        <p className="mt-4 text-zinc-400">Loading calendar events...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <div className="text-center mb-4">
          <p className="text-red-400 font-medium">{error}</p>
        </div>
        <div className="text-center">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Try Again
          </Button>
        </div>
        <p className="text-xs text-zinc-500 mt-4 text-center">
          Check your Calendly API token in Settings and ensure it&apos;s valid.
        </p>
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-100">Calendly Events</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing || loading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 text-center">
          <p className="text-zinc-400">No upcoming events scheduled.</p>
        </div>
      </div>
    )
  }

  // Group events by date
  const eventsByDate = events.reduce((acc, event) => {
    const date = new Date(event.start_time).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(event)
    return acc
  }, {} as Record<string, CalendlyEvent[]>)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-100">Calendly Events</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing || loading}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      {Object.entries(eventsByDate).map(([date, dateEvents]) => (
        <div key={date} className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
          <div className="bg-zinc-800/50 px-6 py-3 border-b border-zinc-800">
            <h3 className="text-lg font-semibold text-zinc-100">{date}</h3>
          </div>
          <div className="divide-y divide-zinc-800">
            {dateEvents.map((event) => {
              const startTime = new Date(event.start_time)
              const endTime = new Date(event.end_time)
              const timeStr = `${startTime.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
              })} - ${endTime.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
              })}`

              return (
                <div key={event.id} className="p-6 hover:bg-zinc-800/30 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-lg font-medium text-zinc-100 mb-2">{event.name}</h4>
                      <div className="space-y-1 text-sm text-zinc-400">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{timeStr}</span>
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>
                              {event.location.type === 'physical' || event.location.type === 'custom_location'
                                ? event.location.location
                                : event.location.type === 'zoom'
                                ? 'Zoom Meeting'
                                : event.location.type === 'google_meet'
                                ? 'Google Meet'
                                : event.location.location || 'Location TBD'}
                            </span>
                          </div>
                        )}
                        {event.invitees.length > 0 && (
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>
                              {event.invitees.join(', ')}
                              {event.invitees.length > 1 && ` (${event.invitees.length} invitees)`}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="ml-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          event.status === 'active'
                            ? 'bg-green-500/10 text-green-500'
                            : event.status === 'canceled'
                            ? 'bg-red-500/10 text-red-500'
                            : 'bg-zinc-500/10 text-zinc-500'
                        }`}
                      >
                        {event.status}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
