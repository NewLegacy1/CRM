import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { eventTypeUri, inviteeName, inviteeEmail, startTime, endTime, timezone = 'America/New_York', notes } = body

    if (!inviteeName || !inviteeEmail || !startTime) {
      return NextResponse.json(
        { error: 'inviteeName, inviteeEmail, and startTime are required' },
        { status: 400 }
      )
    }

    // Get Calendly API token from environment variable
    const token = process.env.CALENDLY_API_TOKEN
    
    if (!token) {
      return NextResponse.json({ error: 'Calendly API token not configured. Set CALENDLY_API_TOKEN in environment variables.' }, { status: 400 })
    }

    // Get user's event types to find the default one
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

    // Get event types
    const eventTypesResponse = await fetch(
      `https://api.calendly.com/event_types?user=${encodeURIComponent(userUri)}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!eventTypesResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch event types' }, { status: eventTypesResponse.status })
    }

    const eventTypesData = await eventTypesResponse.json()
    const eventTypes = eventTypesData.collection || []
    
    if (eventTypes.length === 0) {
      return NextResponse.json({ error: 'No event types found. Please create an event type in Calendly.' }, { status: 400 })
    }

    // Use provided eventTypeUri or default to first available
    const finalEventTypeUri = eventTypeUri || eventTypes[0].uri
    const selectedEventType = eventTypes.find((et: any) => et.uri === finalEventTypeUri) || eventTypes[0]

    // Generate a prefilled booking link since Calendly API doesn't support direct event creation
    // The booking link will have the invitee info prefilled
    const bookingLink = selectedEventType.scheduling_url || selectedEventType.booking_url
    
    // Create prefilled link with invitee info
    const prefilledLink = `${bookingLink}?name=${encodeURIComponent(inviteeName)}&email=${encodeURIComponent(inviteeEmail)}`

    return NextResponse.json({
      ok: true,
      bookingLink: prefilledLink,
      eventType: selectedEventType.name,
      message: 'Booking link generated. Note: Calendly API does not support direct event creation. Use the booking link to complete the booking.',
      note: 'Calendly API limitation: Events must be created through their booking interface. The booking link has been prefilled with invitee information.',
    })
  } catch (err) {
    console.error('Calendly create event error:', err)
    return NextResponse.json({ error: 'Failed to generate booking link' }, { status: 500 })
  }
}
