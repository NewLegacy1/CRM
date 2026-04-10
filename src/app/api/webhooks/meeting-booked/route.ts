import { NextRequest, NextResponse } from 'next/server'

const N8N_WEBHOOK_URL = process.env.N8N_MEETING_BOOKED_WEBHOOK_URL

export async function POST(request: NextRequest) {
  if (!N8N_WEBHOOK_URL) {
    return NextResponse.json(
      { error: 'N8N_MEETING_BOOKED_WEBHOOK_URL not configured' },
      { status: 500 }
    )
  }

  try {
    const body = await request.json()
    const { leadId, meetingTime, closerId, coldCallerId } = body

    if (!leadId || !meetingTime) {
      return NextResponse.json(
        { error: 'leadId and meetingTime are required' },
        { status: 400 }
      )
    }

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        leadId,
        meetingTime,
        closerId: closerId ?? null,
        coldCallerId: coldCallerId ?? null,
      }),
    })

    if (!response.ok) {
      const text = await response.text()
      console.error('n8n webhook failed:', response.status, text)
      return NextResponse.json(
        { error: 'Failed to trigger n8n workflow' },
        { status: 502 }
      )
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('meeting-booked webhook error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
