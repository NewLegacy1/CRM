import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendClientInvoice } from '@/lib/stripe/send-client-invoice'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      clientId,
      currency = 'usd',
      dueDate,
      memo,
      footer,
      lineItems,
      taxEnabled = false,
      taxRegion = 'ON',
    } = body

    if (!clientId || !Array.isArray(lineItems) || lineItems.length === 0) {
      return NextResponse.json(
        { error: 'clientId and at least one lineItem are required' },
        { status: 400 }
      )
    }

    const { data: client } = await supabase
      .from('clients')
      .select('id, name, email')
      .eq('id', clientId)
      .single()

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    const result = await sendClientInvoice({
      supabase,
      userId: user.id,
      clientId,
      currency,
      dueDate: dueDate || null,
      memo: memo || null,
      footer: footer || null,
      daysUntilDue: 30,
      tax: {
        enabled: Boolean(taxEnabled),
        regionCode: typeof taxRegion === 'string' ? taxRegion : 'ON',
      },
      lineItems: lineItems.map((row: {
        description: string
        quantity: number
        unit_amount: number
        isMonthly?: boolean
      }) => ({
        description: row.description,
        quantity: row.quantity,
        unit_amount: row.unit_amount,
        isMonthly: row.isMonthly || false,
      })),
    })

    if (!result.ok || !result.invoice) {
      return NextResponse.json(
        { error: result.error ?? 'Failed to send invoice' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ok: true,
      invoice: {
        ...result.invoice,
        client: { id: client.id, name: client.name, email: client.email },
      },
      message: result.message ?? (stripeSecretKey
        ? 'Invoice sent via Stripe.'
        : 'Stripe key not set — invoice saved as draft. Add STRIPE_SECRET_KEY to send via Stripe.'),
    })
  } catch (err) {
    console.error('invoices/send error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
