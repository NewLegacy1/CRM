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
  const [ads, setAds] = useState(initialAds)
  const [syncing, setSyncing] = useState(false)
  const router = useRouter()

  async function handleSync() {
    setSyncing(true)
    try {
      const res = await fetch('/api/meta/sync-ads', {
        method: 'POST',
      })
      
      const data = await res.json()
      
      console.log('Sync response:', data)
      
      if (res.ok) {
        // Show detailed sync results
        let message = `Synced ${data.synced} of ${data.total} campaigns`
        
        if (data.skipped > 0) {
          message += `\n${data.skipped} campaigns skipped (no insights data)`
        }
        
        if (data.errors > 0) {
          message += `\n${data.errors} errors occurred`
          if (data.details?.errors?.length > 0) {
            message += '\nErrors:\n' + data.details.errors.map((e: any) => 
              `- ${e.campaign}: ${e.error}`
            ).join('\n')
          }
        }
        
        if (data.synced > 0) {
          alert(message)
          // Refresh the page to get updated data from DB
          router.refresh()
        } else {
          alert(message + '\n\nNo campaigns were synced. Check that:\n1. You have active campaigns with data\n2. Database migration is applied\n3. Token has correct permissions')
        }
      } else {
        alert(`Sync failed: ${data.error || 'Unknown error'}\n${data.details || ''}`)
      }
    } catch (error) {
      console.error('Sync error:', error)
      alert('Failed to sync ads. Check console for details.\nError: ' + String(error))
    } finally {
      setSyncing(false)
    }
  }

  function formatCurrency(n: number) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
  }

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-zinc-100 mb-1">Our ad performance</h2>
          <p className="text-sm text-zinc-500">
            Meta ads from the last 30 days. Click sync to refresh.
          </p>
        </div>
        <Button onClick={handleSync} disabled={syncing}>
          <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Syncing...' : 'Sync from Meta'}
        </Button>
      </div>
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
