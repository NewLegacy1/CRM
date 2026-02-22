import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

interface BulkLeadInput {
  name: string
  phone: string
  email?: string | null
  city?: string | null
  website?: string | null
  niche?: string | null
}

export async function POST(request: NextRequest) {
  if (!supabaseServiceKey) {
    return NextResponse.json({ error: 'Server not configured' }, { status: 500 })
  }

  try {
    const body = await request.json()
    const { listId, leads: rawLeads } = body as {
      listId?: string
      leads?: BulkLeadInput[]
    }

    if (!listId || typeof listId !== 'string' || !listId.trim()) {
      return NextResponse.json(
        { error: 'listId is required' },
        { status: 400 }
      )
    }

    if (!Array.isArray(rawLeads) || rawLeads.length === 0) {
      return NextResponse.json(
        { error: 'leads array is required and must not be empty' },
        { status: 400 }
      )
    }

    const leads = rawLeads
      .map((l) => ({
        name: typeof l.name === 'string' ? l.name.trim() : '',
        phone: typeof l.phone === 'string' ? l.phone.trim() : '',
        email: l.email != null && l.email !== '' ? String(l.email).trim() : null,
        city: l.city != null && l.city !== '' ? String(l.city).trim() : null,
        website: l.website != null && l.website !== '' ? String(l.website).trim() : null,
        niche: l.niche != null && l.niche !== '' ? String(l.niche).trim() : null,
      }))
      .filter((l) => l.name && l.phone)

    if (leads.length === 0) {
      return NextResponse.json(
        { error: 'No valid leads (each must have name and phone)' },
        { status: 400 }
      )
    }

    const rows = leads.map((l) => ({
      list_id: listId.trim(),
      name: l.name,
      phone: l.phone,
      email: l.email,
      city: l.city,
      website: l.website,
      niche: l.niche,
      status: 'new',
      source: 'scraper',
    }))

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { data, error } = await supabase.from('leads').insert(rows).select('id')

    if (error) {
      console.error('Bulk leads insert error:', error)
      return NextResponse.json(
        { error: error.message || 'Database error' },
        { status: 500 }
      )
    }

    const insertedCount = data?.length ?? rows.length
    const { data: list } = await supabase
      .from('lead_lists')
      .select('total_count')
      .eq('id', listId)
      .single()
    const prevCount = (list?.total_count as number) ?? 0
    await supabase
      .from('lead_lists')
      .update({ total_count: prevCount + insertedCount })
      .eq('id', listId)

    return NextResponse.json({ ok: true, count: insertedCount })
  } catch (err) {
    console.error('leads/bulk error:', err)
    const message = err instanceof Error ? err.message : 'Bulk insert failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
