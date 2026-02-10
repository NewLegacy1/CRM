'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'

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
  const router = useRouter()
  const [syncing, setSyncing] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const ads = initialAds

  async function handleRefresh() {
    setSyncing(true)
    setMessage(null)
    try {
      const res = await fetch('/api/ads/sync', { method: 'POST' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setMessage({ type: 'error', text: data.error || 'Sync failed' })
        return
      }
      setMessage({ type: 'success', text: data.message || `Synced ${data.synced ?? 0} campaign(s).` })
      router.refresh()
    } catch {
      setMessage({ type: 'error', text: 'Network error' })
    } finally {
      setSyncing(false)
    }
  }

  function formatCurrency(n: number) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
  }

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div>
          <h2 className="text-lg font-semibold text-zinc-100">Our ad performance</h2>
          <p className="text-sm text-zinc-500 mt-0.5">
            Meta Ads data from your connected account. Add <code className="text-amber-500">META_ADS_ACCESS_TOKEN</code> in Settings, then refresh below.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={syncing}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Syncing…' : 'Refresh'}
        </Button>
      </div>
      {message && (
        <p
          className={`text-sm mb-4 ${
            message.type === 'success' ? 'text-green-500' : 'text-red-400'
          }`}
        >
          {message.text}
        </p>
      )}
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
