import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get Calendly API token from environment variable
    const token = process.env.CALENDLY_API_TOKEN
    
    if (!token) {
      return NextResponse.json({ error: 'Calendly API token not configured. Set CALENDLY_API_TOKEN in environment variables.' }, { status: 400 })
    }

    // Fetch events from Calendly API
    // First, get the user's URI
    const userResponse = await fetch('https://api.calendly.com/users/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!userResponse.ok) {
      const errorText = await userResponse.text()
      console.error('Calendly user fetch error:', userResponse.status, errorText)
      return NextResponse.json(
        { error: `Failed to fetch Calendly user: ${userResponse.status} ${errorText}` },
        { status: userResponse.status }
      )
    }

    const userData = await userResponse.json()
    const userUri = userData.resource?.uri

    if (!userUri) {
      console.error('No user URI found in Calendly response:', userData)
      return NextResponse.json({ error: 'Invalid Calendly user data' }, { status: 500 })
    }

    // Fetch scheduled events
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
      const errorText = await eventsResponse.text()
      console.error('Calendly events fetch error:', eventsResponse.status, errorText)
      return NextResponse.json(
        { error: `Failed to fetch Calendly events: ${eventsResponse.status} ${errorText}` },
        { status: eventsResponse.status }
      )
    }

    const eventsData = await eventsResponse.json()

    // Fetch event details and invitees for each event
    const eventsWithDetails = await Promise.allSettled(
      (eventsData.collection || []).map(async (event: { uri: string }) => {
        try {
          // event.uri is already a full URL from Calendly API
          const eventUrl = event.uri.startsWith('http') ? event.uri : `https://api.calendly.com${event.uri}`
          
          // Fetch event details
          const eventDetailResponse = await fetch(eventUrl, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          })
          
          if (!eventDetailResponse.ok) {
            console.error(`Failed to fetch event details for ${event.uri}:`, eventDetailResponse.status)
            return null
          }
          
          const eventDetail = await eventDetailResponse.json()
          const eventResource = eventDetail.resource

          if (!eventResource) {
            console.error(`No resource found in event detail for ${event.uri}`)
            return null
          }

          // Fetch invitees for this event
          let inviteeNames: string[] = []
          try {
            const inviteesUrl = event.uri.startsWith('http') 
              ? `${event.uri}/invitees`
              : `https://api.calendly.com${event.uri}/invitees`
            
            const inviteesResponse = await fetch(inviteesUrl, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            })

            if (inviteesResponse.ok) {
              const inviteesData = await inviteesResponse.json()
              inviteeNames = (inviteesData.collection || []).map((invitee: any) => 
                invitee.name || invitee.email || 'Unknown'
              )
            }
          } catch (inviteeErr) {
            console.error(`Failed to fetch invitees for ${event.uri}:`, inviteeErr)
            // Continue without invitees
          }

          return {
            id: event.uri.split('/').pop(),
            uri: event.uri,
            name: eventResource.name || 'Scheduled Event',
            start_time: eventResource.start_time,
            end_time: eventResource.end_time,
            location: eventResource.location || null,
            invitees: inviteeNames,
            invitee_count: inviteeNames.length,
            status: eventResource.status || 'active',
            event_type: eventResource.event_type || null,
          }
        } catch (err) {
          console.error(`Error processing event ${event.uri}:`, err)
          return null
        }
      })
    )

    const validEvents = eventsWithDetails
      .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
      .map((result) => result.value)
      .filter(Boolean)

    return NextResponse.json({ events: validEvents })
  } catch (err) {
    console.error('Calendly API error:', err)
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
  }
}
