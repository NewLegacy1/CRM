import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const VERIFY_TOKEN = process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN
const ACCESS_TOKEN = process.env.FACEBOOK_GRAPH_ACCESS_TOKEN
const GRAPH_API_VERSION = 'v21.0'

// GET handler - Facebook webhook verification
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  console.log('Facebook webhook verification request:', { mode, token: token?.substring(0, 10) + '...' })

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('Webhook verified successfully')
    return new NextResponse(challenge, { status: 200 })
  }

  console.error('Webhook verification failed')
  return NextResponse.json({ error: 'Verification failed' }, { status: 403 })
}

// POST handler - Receive lead notifications
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Facebook leadgen webhook received:', JSON.stringify(body, null, 2))

    if (!ACCESS_TOKEN) {
      console.error('FACEBOOK_GRAPH_ACCESS_TOKEN not configured')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    // Use service role client to bypass RLS for webhook inserts
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
    const processedLeads = []
    const errors = []

    // Process each entry
    for (const entry of body.entry || []) {
      const pageId = entry.id

      // Process each change in the entry
      for (const change of entry.changes || []) {
        if (change.field !== 'leadgen') continue

        const value = change.value
        const leadgenId = value.leadgen_id
        const adId = value.ad_id
        const formId = value.form_id
        const createdTime = value.created_time

        console.log(`Processing lead: ${leadgenId}`)

        try {
          // Fetch lead data from Graph API
          const leadUrl = `https://graph.facebook.com/${GRAPH_API_VERSION}/${leadgenId}?access_token=${ACCESS_TOKEN}`
          const leadRes = await fetch(leadUrl)

          if (!leadRes.ok) {
            const errorText = await leadRes.text()
            console.error(`Failed to fetch lead ${leadgenId}:`, errorText)
            errors.push({ leadgenId, error: errorText })
            continue
          }

          const leadData = await leadRes.json()
          console.log(`Lead data for ${leadgenId}:`, JSON.stringify(leadData, null, 2))

          // Extract field data
          const fieldData = leadData.field_data || []
          const fields: Record<string, string> = {}
          
          for (const field of fieldData) {
            fields[field.name] = field.values?.[0] || ''
          }

          // Map common fields
          const name = fields.full_name || fields.first_name || fields.name || null
          const email = fields.email || null
          const phone = fields.phone_number || fields.phone || null

          // Store custom fields (excluding the standard ones)
          const customFields: Record<string, string> = {}
          for (const [key, value] of Object.entries(fields)) {
            if (!['full_name', 'first_name', 'name', 'email', 'phone_number', 'phone'].includes(key)) {
              customFields[key] = value
            }
          }

          // Upsert into database
          const { data, error } = await supabase
            .from('facebook_lead_ads')
            .upsert(
              {
                leadgen_id: leadgenId,
                page_id: pageId,
                ad_id: adId,
                form_id: formId,
                name,
                email,
                phone,
                custom_fields: Object.keys(customFields).length > 0 ? customFields : null,
                raw_data: leadData,
                synced_at: new Date().toISOString(),
              },
              { onConflict: 'leadgen_id', ignoreDuplicates: false }
            )
            .select()
            .single()

          if (error) {
            console.error(`DB error for lead ${leadgenId}:`, error)
            errors.push({ leadgenId, error: error.message })
          } else {
            console.log(`Successfully stored lead ${leadgenId}`)
            processedLeads.push(data)
          }
        } catch (error) {
          console.error(`Error processing lead ${leadgenId}:`, error)
          errors.push({ leadgenId, error: String(error) })
        }
      }
    }

    console.log(`Webhook processing complete: ${processedLeads.length} leads processed, ${errors.length} errors`)

    // Always return 200 to Facebook (they require quick response)
    return NextResponse.json({
      success: true,
      processed: processedLeads.length,
      errors: errors.length,
      details: { processedLeads, errors }
    })
  } catch (error) {
    console.error('Facebook leadgen webhook error:', error)
    // Still return 200 to prevent Facebook from retrying
    return NextResponse.json({ error: 'Internal error', details: String(error) }, { status: 200 })
  }
}
