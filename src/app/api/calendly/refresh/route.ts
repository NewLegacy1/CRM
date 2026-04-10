import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    // Verify this is a cron request (Vercel adds a header)
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      // Allow if no CRON_SECRET is set (for local dev) or if it matches
      if (process.env.CRON_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    // Get Calendly API token from environment variable
    const token = process.env.CALENDLY_API_TOKEN
    
    if (!token) {
      return NextResponse.json({ error: 'Calendly API token not configured. Set CALENDLY_API_TOKEN in environment variables.' }, { status: 400 })
    }

    // Fetch events from Calendly API to refresh cache/keep API warm
    const userResponse = await fetch('https://api.calendly.com/users/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!userResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch Calendly user' }, { status: userResponse.status })
    }

    const userData = await userResponse.json()
    const userUri = userData.resource.uri

    const eventsResponse = await fetch(
      `https://api.calendly.com/scheduled_events?user=${encodeURIComponent(userUri)}&min_start_time=${new Date().toISOString()}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!eventsResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch Calendly events' }, { status: eventsResponse.status })
    }

    const eventsData = await eventsResponse.json()
    const eventCount = eventsData.collection?.length || 0

    return NextResponse.json({
      ok: true,
      message: `Refreshed calendar. Found ${eventCount} upcoming events.`,
      eventCount,
    })
  } catch (err) {
    console.error('Calendly refresh error:', err)
    return NextResponse.json({ error: 'Failed to refresh calendar' }, { status: 500 })
  }
}
