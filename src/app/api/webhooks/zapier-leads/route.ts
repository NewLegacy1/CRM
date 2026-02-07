import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Simple webhook endpoint for Zapier to send Facebook Lead Ads data
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Zapier lead received:', JSON.stringify(body, null, 2))

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

    // Extract any custom fields (fields not in the standard set)
    const standardFields = ['id', 'leadgen_id', 'page_id', 'ad_id', 'form_id', 'full_name', 'name', 'email', 'phone_number', 'phone']
    const customFields: Record<string, string> = {}
    
    for (const [key, value] of Object.entries(body)) {
      if (!standardFields.includes(key) && typeof value === 'string') {
        customFields[key] = value
      }
    }

    const leadData = {
      leadgen_id: body.id || body.leadgen_id || `zapier_${Date.now()}`,
      page_id: body.page_id || null,
      ad_id: body.ad_id || null,
      form_id: body.form_id || null,
      name: body.full_name || body.name || null,
      email: body.email || null,
      phone: body.phone_number || body.phone || null,
      custom_fields: Object.keys(customFields).length > 0 ? customFields : null,
      raw_data: body,
      synced_at: new Date().toISOString(),
    }

    console.log('Storing lead data:', leadData)

    // Insert into database
    const { data, error } = await supabase
      .from('facebook_lead_ads')
      .insert([leadData])
      .select()
      .single()

    if (error) {
      console.error('DB error:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    console.log('Lead stored successfully:', data.id)

    return NextResponse.json({
      success: true,
      message: 'Lead received and stored',
      lead_id: data.id
    })
  } catch (error) {
    console.error('Zapier webhook error:', error)
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}

// Optional: GET endpoint for testing
export async function GET() {
  return NextResponse.json({
    message: 'Zapier webhook endpoint is ready',
    instructions: 'Send POST requests with lead data'
  })
}
