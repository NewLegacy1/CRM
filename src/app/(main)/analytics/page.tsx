import Link from 'next/link'
import { ArrowRight, Gauge } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import type { UserRole } from '@/types/database'

export default async function AnalyticsPage() {
  const supabase = await createClient()

  const [
    { data: ads },
    { data: agencyAds },
    { data: wonDeals },
    { data: { user } },
  ] = await Promise.all([
    supabase.from('ads').select('spend, revenue'),
    supabase.from('agency_ads').select('spend'),
    supabase.from('deals').select('value').eq('stage', 'closed_won'),
    supabase.auth.getUser(),
  ])

  let role: UserRole = 'pending'
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    role = (profile?.role as UserRole) ?? 'pending'
  }

  const adsTableSpend = ads?.reduce((sum, ad) => sum + (ad.spend || 0), 0) || 0
  const agencyAdsSpend = agencyAds?.reduce((sum, ad) => sum + Number(ad.spend || 0), 0) || 0
  const totalSpend = adsTableSpend + agencyAdsSpend
  const adsRevenue = ads?.reduce((sum, ad) => sum + (ad.revenue || 0), 0) || 0
  const wonDealsRevenue = wonDeals?.reduce((sum, d) => sum + Number(d.value || 0), 0) || 0
  const totalRevenue = adsRevenue + wonDealsRevenue
  const roas = totalSpend > 0 ? (totalRevenue / totalSpend).toFixed(2) : '0.00'

  const orderCount = wonDeals?.length ?? 0
  const aov = orderCount > 0 ? (totalRevenue / orderCount).toFixed(2) : '0.00'

  const stats = [
    { label: 'Total Ad Spend', value: `$${totalSpend.toLocaleString()}` },
    { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}` },
    { label: 'ROAS', value: `${roas}x` },
    { label: 'AOV', value: `$${aov}` },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-100">Analytics</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6"
          >
            <p className="text-sm text-zinc-400">{stat.label}</p>
            <p className="text-2xl font-bold text-violet-400 mt-2">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h2 className="text-lg font-semibold text-zinc-100 mb-4">Performance Overview</h2>
        <p className="text-sm text-zinc-400">
          Total Revenue = Ad revenue + sum of all closed-won deal values. ROAS (Return on Ad Spend) = Revenue / Ad Spend. AOV (Average Order Value) = Total Revenue / Closed Won Deals.
        </p>
        <p className="text-sm text-zinc-400 mt-2">
          Charts and historical trends will be added in a future update.
        </p>
      </div>

      {role === 'owner' && (
        <Link
          href="/analytics/showroom"
          className="group flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 transition hover:border-violet-400/30 hover:bg-zinc-900/70"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/15 ring-1 ring-violet-400/20">
              <Gauge className="h-5 w-5 text-violet-300" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-100">
                Showroom AutoCare Funnel
              </h2>
              <p className="mt-0.5 text-sm text-zinc-400">
                Conversion tracking from site visit through confirmed booking.
              </p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-zinc-500 transition group-hover:translate-x-0.5 group-hover:text-violet-300" />
        </Link>
      )}
    </div>
  )
}
