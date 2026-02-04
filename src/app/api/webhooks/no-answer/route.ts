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
            subject: 'We tried to reach you',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Hi ${lead.name},</h2>
                <p>We tried calling you earlier at ${phone} but weren't able to connect.</p>
                <p>We'd love to chat with you about how we can help your business grow.</p>
                <p>Feel free to:</p>
                <ul>
                  <li>Call us back at your convenience</li>
                  <li>Reply to this email</li>
                  <li>Book a call at a time that works for you</li>
                </ul>
                <p>We look forward to speaking with you soon!</p>
                <p>Best regards,<br/>The Team</p>
              </div>
            `,
            text: `Hi ${lead.name},\n\nWe tried calling you earlier at ${phone} but weren't able to connect.\n\nWe'd love to chat with you about how we can help your business grow.\n\nFeel free to call us back, reply to this email, or book a call at your convenience.\n\nWe look forward to speaking with you soon!\n\nBest regards,\nThe Team`
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
