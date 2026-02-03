'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface AgencyAd {
  id: string
  platform: string
  campaign_name: string | null
  campaign_id: string | null
  spend: number
  impressions: number
  clicks: number
  conversions: number
  synced_at: string | null
}

interface OurAdsSectionProps {
  initialAds: AgencyAd[]
}

export function OurAdsSection({ initialAds }: OurAdsSectionProps) {
  const ads = initialAds

  function formatCurrency(n: number) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
  }

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <h2 className="text-lg font-semibold text-zinc-100 mb-2">Our ad performance</h2>
      <p className="text-sm text-zinc-500 mb-4">
        Connect Meta Ads and Google Ads API in Settings. Data reloads every midnight.
      </p>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Platform</TableHead>
              <TableHead>Campaign</TableHead>
              <TableHead>Spend</TableHead>
              <TableHead>Impressions</TableHead>
              <TableHead>Clicks</TableHead>
              <TableHead>Conversions</TableHead>
              <TableHead>Last synced</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-zinc-500">
                  No ad data yet. Add API credentials and run sync (or wait for midnight refresh).
                </TableCell>
              </TableRow>
            ) : (
              ads.map((ad) => (
                <TableRow key={ad.id}>
                  <TableCell className="capitalize font-medium">{ad.platform}</TableCell>
                  <TableCell>{ad.campaign_name || ad.campaign_id || '—'}</TableCell>
                  <TableCell>{formatCurrency(ad.spend)}</TableCell>
                  <TableCell>{ad.impressions?.toLocaleString() ?? '—'}</TableCell>
                  <TableCell>{ad.clicks?.toLocaleString() ?? '—'}</TableCell>
                  <TableCell>{ad.conversions ?? '—'}</TableCell>
                  <TableCell className="text-zinc-500">
                    {ad.synced_at ? new Date(ad.synced_at).toLocaleString() : '—'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  )
}
