import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const N8N_WEBHOOK_URL = process.env.N8N_NO_ANSWER_WEBHOOK_URL
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { leadId, phone, coldCallerId, listId } = body

    if (!leadId || !phone) {
      return NextResponse.json(
        { error: 'leadId and phone are required' },
        { status: 400 }
      )
    }

    // Get lead details from database
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('name, email')
      .eq('id', leadId)
      .single()

    if (leadError || !lead) {
      console.error('Failed to fetch lead:', leadError)
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      )
    }

    // Send follow-up email if lead has an email
    if (lead.email) {
      try {
        const emailResponse = await supabase.functions.invoke('resend-email', {
          body: {
            to: lead.email,
            from: 'contact@contact.newlegacyai.ca',
            subject: 'Made you a brand new website',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <p style="font-size: 16px; line-height: 1.6; color: #333;">
                  Hi ${lead.name}, it's Nathan with New Legacy.
                </p>
                <p style="font-size: 16px; line-height: 1.6; color: #333;">
                  I tried calling you earlier at ${phone} but wasn't able to connect.
                </p>
                <p style="font-size: 16px; line-height: 1.6; color: #333;">
                  I actually made you a brand new website and was wondering if you'd have any time to chat about it!
                </p>
                <p style="font-size: 16px; line-height: 1.6; color: #333;">
                  Thanks!
                </p>
                <p style="font-size: 16px; line-height: 1.6; color: #333; margin-top: 30px;">
                  <strong>Nathan</strong><br/>
                  New Legacy
                </p>
              </div>
            `,
            text: `Hi ${lead.name}, it's Nathan with New Legacy.\n\nI tried calling you earlier at ${phone} but wasn't able to connect.\n\nI actually made you a brand new website and was wondering if you'd have any time to chat about it!\n\nThanks!\n\nNathan\nNew Legacy`
          }
        })

        if (emailResponse.error) {
          console.error('Failed to send email:', emailResponse.error)
        } else {
          console.log('Follow-up email sent to:', lead.email)
        }
      } catch (emailError) {
        console.error('Email sending error:', emailError)
        // Don't fail the whole request if email fails
      }
    }

    // Optional: Call N8N webhook if configured
    if (N8N_WEBHOOK_URL) {
      try {
        await fetch(N8N_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            leadId,
            phone,
            coldCallerId: coldCallerId ?? null,
            listId: listId ?? null,
          }),
        })
      } catch (n8nError) {
        console.error('N8N webhook failed:', n8nError)
        // Don't fail if N8N webhook fails
      }
    }

    return NextResponse.json({ ok: true, emailSent: !!lead.email })
  } catch (err) {
    console.error('no-answer webhook error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
