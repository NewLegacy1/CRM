'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  lead_count: number
  synced_at: string | null
}

interface OurAdsSectionProps {
  initialAds: AgencyAd[]
}

export function OurAdsSection({ initialAds }: OurAdsSectionProps) {
  const router = useRouter()
  const [syncing, setSyncing] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [ads, setAds] = useState<AgencyAd[]>(initialAds)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  async function updateLeadCount(id: string, lead_count: number) {
    setUpdatingId(id)
    const supabase = createClient()
    await supabase.from('agency_ads').update({ lead_count }).eq('id', id)
    setAds((prev) => prev.map((a) => (a.id === id ? { ...a, lead_count } : a)))
    setUpdatingId(null)
  }

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
              <TableHead>Leads</TableHead>
              <TableHead>Last synced</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-zinc-500">
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
                  <TableCell className="w-24">
                    <Input
                      type="number"
                      min={0}
                      value={ad.lead_count ?? 0}
                      onChange={(e) => {
                        const v = parseInt(e.target.value, 10)
                        if (!Number.isNaN(v) && v >= 0) {
                          setAds((prev) => prev.map((a) => (a.id === ad.id ? { ...a, lead_count: v } : a)))
                        }
                      }}
                      onBlur={(e) => {
                        const v = parseInt(e.target.value, 10)
                        if (!Number.isNaN(v) && v >= 0 && v !== (ad.lead_count ?? 0)) {
                          updateLeadCount(ad.id, v)
                        }
                      }}
                      disabled={updatingId === ad.id}
                      className="h-8 w-20 bg-zinc-800 border-zinc-700 text-zinc-100"
                    />
                  </TableCell>
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
