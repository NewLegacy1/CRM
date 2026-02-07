import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const GRAPH_API_VERSION = 'v21.0'
const GRAPH_API_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`

interface MetaCampaign {
  id: string
  name: string
  status: string
}

interface MetaInsights {
  spend: string
  impressions: string
  clicks: string
  actions?: Array<{
    action_type: string
    value: string
  }>
}

interface CampaignWithInsights extends MetaCampaign {
  insights?: {
    data: MetaInsights[]
  }
}

export async function POST() {
  try {
    const token = process.env.FACEBOOK_GRAPH_ACCESS_TOKEN
    const accountId = process.env.META_ADS_ACCOUNT_ID

    if (!token) {
      return NextResponse.json(
        { error: 'FACEBOOK_GRAPH_ACCESS_TOKEN not configured' },
        { status: 500 }
      )
    }

    if (!accountId) {
      return NextResponse.json(
        { error: 'META_ADS_ACCOUNT_ID not configured' },
        { status: 500 }
      )
    }

    // Fetch campaigns with insights (last 30 days)
    const campaignsUrl = `${GRAPH_API_BASE}/act_${accountId}/campaigns?fields=id,name,status,insights.date_preset(last_30d){spend,impressions,clicks,actions}&access_token=${token}`
    
    const campaignsRes = await fetch(campaignsUrl)
    
    if (!campaignsRes.ok) {
      const error = await campaignsRes.text()
      console.error('Meta API error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch from Meta API', details: error },
        { status: campaignsRes.status }
      )
    }

    const campaignsData = await campaignsRes.json()
    const campaigns: CampaignWithInsights[] = campaignsData.data || []

    console.log(`Meta API returned ${campaigns.length} campaigns`)

    // Sync to database
    const supabase = await createClient()
    const syncedAds = []
    const errors = []
    const skippedCampaigns = []

    for (const campaign of campaigns) {
      const insights = campaign.insights?.data?.[0]
      if (!insights) {
        skippedCampaigns.push({
          id: campaign.id,
          name: campaign.name,
          reason: 'No insights data available'
        })
        console.log(`Skipping campaign ${campaign.name} (${campaign.id}): no insights`)
        continue
      }

      // Extract conversions from actions array
      let conversions = 0
      if (insights.actions) {
        const conversionAction = insights.actions.find(
          (a) => a.action_type === 'purchase' || a.action_type === 'offsite_conversion.fb_pixel_purchase'
        )
        if (conversionAction) {
          conversions = parseFloat(conversionAction.value) || 0
        }
      }

      const adData = {
        platform: 'meta',
        campaign_name: campaign.name,
        campaign_id: campaign.id,
        spend: parseFloat(insights.spend) || 0,
        impressions: parseInt(insights.impressions) || 0,
        clicks: parseInt(insights.clicks) || 0,
        conversions,
        synced_at: new Date().toISOString(),
      }

      // Upsert: update if campaign_id exists, insert otherwise
      const { data, error } = await supabase
        .from('agency_ads')
        .upsert(
          adData,
          { onConflict: 'campaign_id', ignoreDuplicates: false }
        )
        .select()
        .single()

      if (error) {
        console.error('DB upsert error for campaign', campaign.name, ':', error)
        errors.push({
          campaign: campaign.name,
          error: error.message
        })
      } else if (data) {
        syncedAds.push(data)
      }
    }

    const response = {
      success: errors.length === 0,
      synced: syncedAds.length,
      total: campaigns.length,
      skipped: skippedCampaigns.length,
      errors: errors.length,
      details: {
        syncedCampaigns: syncedAds.map(ad => ad.campaign_name),
        skippedCampaigns,
        errors
      }
    }

    console.log('Sync complete:', response)

    return NextResponse.json(response)
  } catch (error) {
    console.error('Meta sync error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    )
  }
}
