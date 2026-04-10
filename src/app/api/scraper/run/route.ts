import { NextRequest, NextResponse } from 'next/server'

const APIFY_TOKEN = process.env.APIFY_TOKEN
const APIFY_BASE = 'https://api.apify.com/v2'

interface ApifyPlace {
  title?: string
  phone?: string
  email?: string
  emails?: string[]
  website?: string
  address?: string
  totalScore?: number
  url?: string
}

export async function POST(request: NextRequest) {
  if (!APIFY_TOKEN) {
    return NextResponse.json({ error: 'APIFY_TOKEN not configured' }, { status: 500 })
  }

  try {
    const body = await request.json()
    const { searchTerm, city, maxResults, niche } = body as {
      searchTerm?: string
      city?: string
      maxResults?: number
      niche?: string
    }

    const search = searchTerm?.trim() || 'restaurants'
    const location = city?.trim() || 'Hamilton'
    const max = Math.min(Math.max(Number(maxResults) || 100, 10), 200)

    // Start Apify run
    const runRes = await fetch(
      `${APIFY_BASE}/acts/lukaskrivka~google-maps-with-contact-details/runs?token=${APIFY_TOKEN}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          searchStringsArray: [`${search} ${location}`],
          locationQuery: `${location}, Ontario, Canada`,
          maxCrawledPlacesPerSearch: max,
          language: 'en',
          skipClosedPlaces: true,
        }),
      }
    )

    if (!runRes.ok) {
      const errText = await runRes.text()
      console.error('Apify start run error:', runRes.status, errText)
      return NextResponse.json(
        { error: 'Failed to start Apify run', details: errText },
        { status: 502 }
      )
    }

    const runData = (await runRes.json()) as { data?: { id?: string } }
    const runId = runData.data?.id
    if (!runId) {
      return NextResponse.json({ error: 'No run ID from Apify' }, { status: 502 })
    }

    // Poll until finished
    let status = 'RUNNING'
    while (status === 'RUNNING' || status === 'READY') {
      await new Promise((r) => setTimeout(r, 8000))
      const statusRes = await fetch(
        `${APIFY_BASE}/actor-runs/${runId}?token=${APIFY_TOKEN}`
      )
      if (!statusRes.ok) {
        return NextResponse.json(
          { error: 'Failed to check run status' },
          { status: 502 }
        )
      }
      const statusData = (await statusRes.json()) as { data?: { status?: string } }
      status = statusData.data?.status ?? 'UNKNOWN'
    }

    if (status !== 'SUCCEEDED') {
      return NextResponse.json(
        { error: 'Apify run failed', status },
        { status: 500 }
      )
    }

    // Fetch dataset items
    const itemsRes = await fetch(
      `${APIFY_BASE}/actor-runs/${runId}/dataset/items?token=${APIFY_TOKEN}&format=json`
    )
    if (!itemsRes.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch run results' },
        { status: 502 }
      )
    }
    const items = (await itemsRes.json()) as ApifyPlace[]

    const allLeads = items.map((place) => {
      const email =
        (Array.isArray(place.emails) && place.emails.length > 0
          ? place.emails[0]
          : place.email) ?? ''
      return {
      businessName: place.title ?? '',
      website: place.website ?? '',
      phone: place.phone ?? '',
      email,
      address: place.address ?? '',
      city: location,
      niche: niche ?? null,
      rating: place.totalScore ?? null,
      googleMapsUrl: place.url ?? '',
      status: 'New' as const,
    }
    })

    const withWebsite = allLeads.filter((l) => l.website)
    const withEmail = allLeads.filter((l) => l.email)

    return NextResponse.json({
      total: allLeads.length,
      withWebsite: withWebsite.length,
      withEmail: withEmail.length,
      leads: withWebsite,
    })
  } catch (err) {
    console.error('scraper/run error:', err)
    const message = err instanceof Error ? err.message : 'Scraper failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
