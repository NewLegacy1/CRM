import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const META_GRAPH = 'https://graph.facebook.com/v21.0'

export async function POST() {
  const token = process.env.META_ADS_ACCESS_TOKEN
  if (!token) {
    return NextResponse.json(
      { error: 'Meta Ads not configured. Set META_ADS_ACCESS_TOKEN in environment variables.' },
      { status: 400 }
    )
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = profile?.role
  if (role !== 'owner' && role !== 'media_buyer') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    // 1. Get ad accounts
    const accountsRes = await fetch(
      `${META_GRAPH}/me/adaccounts?fields=id,account_id,name&access_token=${encodeURIComponent(token)}`
    )
    if (!accountsRes.ok) {
      const err = await accountsRes.json().catch(() => ({}))
      return NextResponse.json(
        { error: err.error?.message || 'Failed to fetch Meta ad accounts' },
        { status: 502 }
      )
    }
    const accountsData = await accountsRes.json()
    const accounts: { id: string; name: string }[] = accountsData.data || []

    const rows: {
      platform: string
      campaign_name: string | null
      campaign_id: string | null
      spend: number
      impressions: number
      clicks: number
      conversions: number
    }[] = []

    for (const account of accounts) {
      const actId = account.id.replace('act_', '')
      // 2. Get campaigns with insights (lifetime)
      const campaignsRes = await fetch(
        `${META_GRAPH}/act_${actId}/campaigns?fields=id,name,insights.time_preset(maximum){spend,impressions,clicks}&access_token=${encodeURIComponent(token)}`
      )
      if (!campaignsRes.ok) continue
      const campaignsData = await campaignsRes.json()
      const campaigns = campaignsData.data || []

      for (const camp of campaigns) {
        const insights = camp.insights?.data?.[0] || {}
        const spend = parseFloat(insights.spend || '0') || 0
        const impressions = parseInt(insights.impressions || '0', 10) || 0
        const clicks = parseInt(insights.clicks || '0', 10) || 0
        rows.push({
          platform: 'meta',
          campaign_id: camp.id,
          campaign_name: camp.name || null,
          spend,
          impressions,
          clicks,
          conversions: 0,
          lead_count: 0,
        })
      }

      // If no campaign-level insights, add one row per account with account-level insights
      if (campaigns.length === 0) {
        const insightsRes = await fetch(
          `${META_GRAPH}/act_${actId}/insights?fields=spend,impressions,clicks&date_preset=maximum&access_token=${encodeURIComponent(token)}`
        )
        if (insightsRes.ok) {
          const insData = await insightsRes.json()
          const ins = insData.data?.[0] || {}
          rows.push({
            platform: 'meta',
            campaign_id: account.id,
            campaign_name: account.name || `Account ${actId}`,
            spend: parseFloat(ins.spend || '0') || 0,
            impressions: parseInt(ins.impressions || '0', 10) || 0,
            clicks: parseInt(ins.clicks || '0', 10) || 0,
            conversions: 0,
            lead_count: 0,
          })
        }
      }
    }

    // Replace existing Meta rows with fresh data
    await supabase.from('agency_ads').delete().eq('platform', 'meta')

    if (rows.length > 0) {
      const { error } = await supabase.from('agency_ads').insert(
        rows.map((r) => ({
          ...r,
          synced_at: new Date().toISOString(),
        }))
      )
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    }

    return NextResponse.json({
      ok: true,
      synced: rows.length,
      message: `Synced ${rows.length} Meta ad campaign(s).`,
    })
  } catch (e) {
    console.error('Meta Ads sync error:', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Sync failed' },
      { status: 500 }
    )
  }
}
