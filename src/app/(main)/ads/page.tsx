import { createClient } from '@/lib/supabase/server'
import { OurAdsSection } from './our-ads-section'
import { CreativesLibrary } from './creatives-library'
import { FacebookLeadsSection } from './facebook-leads-section'

export default async function AdsPage() {
  const supabase = await createClient()
  
  const [{ data: agencyAds }, { data: creatives }, { data: facebookLeads }] = await Promise.all([
    supabase
      .from('agency_ads')
      .select('*')
      .order('synced_at', { ascending: false }),
    supabase
      .from('ad_creatives')
      .select('*, project:projects(id, name)')
      .order('created_at', { ascending: false }),
    supabase
      .from('facebook_lead_ads')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100),
  ])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Ads</h1>
        <p className="text-zinc-400 mt-1">
          Our agency&apos;s ad performance (Meta / Google), creatives, and lead generation.
        </p>
      </div>

      <OurAdsSection initialAds={agencyAds ?? []} />
      <FacebookLeadsSection initialLeads={facebookLeads ?? []} />
      <CreativesLibrary initialCreatives={creatives ?? []} />
    </div>
  )
}
