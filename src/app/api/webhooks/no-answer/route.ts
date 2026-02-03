import { NextRequest, NextResponse } from 'next/server'

const N8N_WEBHOOK_URL = process.env.N8N_NO_ANSWER_WEBHOOK_URL

export async function POST(request: NextRequest) {
  if (!N8N_WEBHOOK_URL) {
    return NextResponse.json(
      { error: 'N8N_NO_ANSWER_WEBHOOK_URL not configured' },
      { status: 500 }
    )
  }

  try {
    const body = await request.json()
    const { leadId, phone, coldCallerId, listId } = body

    if (!leadId || !phone) {
      return NextResponse.json(
        { error: 'leadId and phone are required' },
        { status: 400 }
      )
    }

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        leadId,
        phone,
        coldCallerId: coldCallerId ?? null,
        listId: listId ?? null,
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
    console.error('no-answer webhook error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
