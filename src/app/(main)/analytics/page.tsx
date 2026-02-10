import { createClient } from '@/lib/supabase/server'

export default async function AnalyticsPage() {
  const supabase = await createClient()

  const [
    { data: ads },
    { data: wonDeals },
  ] = await Promise.all([
    supabase.from('ads').select('spend, revenue'),
    supabase.from('deals').select('value').eq('stage', 'closed_won'),
  ])

  const totalSpend = ads?.reduce((sum, ad) => sum + (ad.spend || 0), 0) || 0
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
            <p className="text-2xl font-bold text-amber-500 mt-2">{stat.value}</p>
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
    </div>
  )
}
