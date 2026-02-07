'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'

interface FacebookLeadAd {
  id: string
  leadgen_id: string
  page_id: string | null
  ad_id: string | null
  form_id: string | null
  name: string | null
  email: string | null
  phone: string | null
  custom_fields: Record<string, unknown> | null
  raw_data: Record<string, unknown> | null
  created_at: string
  synced_at: string | null
}

interface FacebookLeadsSectionProps {
  initialLeads: FacebookLeadAd[]
}

export function FacebookLeadsSection({ initialLeads }: FacebookLeadsSectionProps) {
  const [leads] = useState(initialLeads)
  const [refreshing, setRefreshing] = useState(false)
  const router = useRouter()

  async function handleRefresh() {
    setRefreshing(true)
    try {
      router.refresh()
    } finally {
      setTimeout(() => setRefreshing(false), 500)
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleString()
  }

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-zinc-100 mb-1">Facebook Lead Ads</h2>
          <p className="text-sm text-zinc-500">
            Leads submitted through Facebook Lead Ads forms. Webhook updates in real-time.
          </p>
        </div>
        <Button onClick={handleRefresh} disabled={refreshing} variant="outline">
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Ad ID</TableHead>
              <TableHead>Form ID</TableHead>
              <TableHead>Custom Fields</TableHead>
              <TableHead>Received</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-zinc-500 py-8">
                  No Facebook leads yet. Leads will appear here when someone submits your Facebook Lead Ads form.
                </TableCell>
              </TableRow>
            ) : (
              leads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">
                    {lead.name || '—'}
                  </TableCell>
                  <TableCell className="text-zinc-300">
                    {lead.email || '—'}
                  </TableCell>
                  <TableCell className="text-zinc-300">
                    {lead.phone || '—'}
                  </TableCell>
                  <TableCell className="text-xs text-zinc-500">
                    {lead.ad_id ? lead.ad_id.substring(0, 12) + '...' : '—'}
                  </TableCell>
                  <TableCell className="text-xs text-zinc-500">
                    {lead.form_id ? lead.form_id.substring(0, 12) + '...' : '—'}
                  </TableCell>
                  <TableCell className="text-xs">
                    {lead.custom_fields && Object.keys(lead.custom_fields).length > 0 ? (
                      <details className="cursor-pointer">
                        <summary className="text-amber-500 hover:text-amber-400">
                          {Object.keys(lead.custom_fields).length} field(s)
                        </summary>
                        <div className="mt-2 space-y-1 text-zinc-400">
                          {Object.entries(lead.custom_fields).map(([key, value]) => (
                            <div key={key}>
                              <span className="font-medium">{key}:</span> {String(value)}
                            </div>
                          ))}
                        </div>
                      </details>
                    ) : (
                      <span className="text-zinc-600">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-zinc-500 text-sm">
                    {formatDate(lead.created_at)}
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
