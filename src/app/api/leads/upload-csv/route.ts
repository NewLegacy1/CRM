import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  if (!supabaseServiceKey) {
    return NextResponse.json({ error: 'Server not configured' }, { status: 500 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const listId = formData.get('listId') as string | null

    if (!file || !listId) {
      return NextResponse.json(
        { error: 'file and listId are required' },
        { status: 400 }
      )
    }

    const text = await file.text()
    const lines = text.split(/\r?\n/).filter((line) => line.trim())
    if (lines.length < 2) {
      return NextResponse.json(
        { error: 'CSV must have a header row and at least one data row' },
        { status: 400 }
      )
    }

    // Parse CSV header - handle quoted values properly
    const parseCSVLine = (line: string): string[] => {
      const values: string[] = []
      let current = ''
      let inQuotes = false
      for (let i = 0; i < line.length; i++) {
        const c = line[i]
        if (c === '"') {
          inQuotes = !inQuotes
        } else if (c === ',' && !inQuotes) {
          values.push(current.trim())
          current = ''
        } else {
          current += c
        }
      }
      values.push(current.trim())
      return values
    }

    const headerRow = parseCSVLine(lines[0])
    const header = headerRow.map((h) => h.toLowerCase().replace(/^"|"$/g, '').trim())
    const rows = lines.slice(1).map(parseCSVLine)

    console.log('CSV Header detected:', header)
    console.log('Number of rows:', rows.length)

    // Auto-detect columns: title (business name), city, phone, emails/0 (email), website
    const titleIdx = header.findIndex((h) => h === 'title' || h === 'name' || h === 'business_name' || /^name|business/.test(h))
    const cityIdx = header.findIndex((h) => h === 'city' || h === 'location' || /^city$|^location$/.test(h))
    const phoneIdx = header.findIndex((h) => h === 'phone' || /^phone$|mobile|tel/.test(h))
    const emailIdx = header.findIndex((h) => h === 'emails/0' || h === 'email' || h.startsWith('emails/') || /^email/.test(h))
    // Website detection: prefer exact match 'website', ignore 'url' (Google Maps link) and 'imageurl'
    const websiteIdx = header.findIndex((h) => h === 'website')
    // Note: We intentionally ignore 'url' column as it contains Google Maps links, not company websites

    console.log('Column indices:', { titleIdx, cityIdx, phoneIdx, emailIdx, websiteIdx })

    const columnMap = {
      name: titleIdx >= 0 ? header[titleIdx] : (header[0] ?? 'name'),
      city: cityIdx >= 0 ? header[cityIdx] : null,
      phone: phoneIdx >= 0 ? header[phoneIdx] : (header[1] ?? 'phone'),
      email: emailIdx >= 0 ? header[emailIdx] : null,
      website: websiteIdx >= 0 ? header[websiteIdx] : null,
    }

    const leads = rows.map((values) => {
      const get = (key: string | null) => {
        if (!key) return null
        const i = header.indexOf(key)
        if (i >= 0 && values[i] !== undefined) {
          const value = values[i].replace(/^"|"$/g, '').trim()
          return value || null
        }
        return null
      }
      
      const name = get(columnMap.name) || 'Unknown'
      const phone = get(columnMap.phone) || ''
      if (!phone) return null
      
      // Get email - prefer emails/0, fallback to first email column found
      let email = get(columnMap.email)
      if (!email && columnMap.email?.startsWith('emails/')) {
        // Try emails/1 if emails/0 is empty
        const email1Idx = header.findIndex((h) => h === 'emails/1')
        if (email1Idx >= 0 && values[email1Idx]) {
          email = values[email1Idx].replace(/^"|"$/g, '').trim() || null
        }
      }
      
      return {
        list_id: listId,
        name,
        phone,
        email: email || null,
        city: get(columnMap.city) || null,
        website: get(columnMap.website) || null,
        status: 'new',
      }
    }).filter(Boolean) as { list_id: string; name: string; phone: string; email: string | null; city: string | null; website: string | null; status: string }[]

    console.log('Parsed leads count:', leads.length)
    if (leads.length === 0) {
      return NextResponse.json({ 
        error: 'No valid leads found. Make sure CSV has phone numbers.',
        details: 'CSV must contain at least one row with a phone number.'
      }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { data, error } = await supabase.from('leads').insert(leads).select('id')

    if (error) {
      console.error('CSV upload error:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      return NextResponse.json({ 
        error: error.message || 'Database error',
        details: error.details || error.hint || 'Check server logs for details'
      }, { status: 500 })
    }

    const { data: list } = await supabase.from('lead_lists').select('total_count').eq('id', listId).single()
    const prevCount = (list?.total_count as number) ?? 0
    await supabase
      .from('lead_lists')
      .update({ total_count: prevCount + leads.length, csv_column_map: columnMap })
      .eq('id', listId)

    return NextResponse.json({
      ok: true,
      count: data?.length ?? leads.length,
      columnMap,
    })
  } catch (err) {
    console.error('upload-csv error:', err)
    const errorMessage = err instanceof Error ? err.message : 'Failed to parse CSV'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
