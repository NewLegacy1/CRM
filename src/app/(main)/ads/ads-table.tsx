'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Pencil, Trash2 } from 'lucide-react'

interface Ad {
  id: string
  client_id: string
  name: string
  platform: string | null
  spend: number
  revenue: number
  status: string | null
  client?: { id: string; name: string }
}

interface AdsTableProps {
  initialAds: Ad[]
  clients: { id: string; name: string }[]
}

export function AdsTable({ initialAds, clients }: AdsTableProps) {
  const [ads, setAds] = useState<Ad[]>(initialAds)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAd, setEditingAd] = useState<Ad | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    client_id: '',
    platform: '',
    spend: '',
    revenue: '',
    status: 'active',
  })
  const [loading, setLoading] = useState(false)

  function openCreateDialog() {
    setEditingAd(null)
    setFormData({ name: '', client_id: '', platform: '', spend: '', revenue: '', status: 'active' })
    setIsDialogOpen(true)
  }

  function openEditDialog(ad: Ad) {
    setEditingAd(ad)
    setFormData({
      name: ad.name,
      client_id: ad.client_id,
      platform: ad.platform ?? '',
      spend: ad.spend.toString(),
      revenue: ad.revenue.toString(),
      status: ad.status ?? 'active',
    })
    setIsDialogOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()

    const payload = {
      ...formData,
      spend: parseFloat(formData.spend) || 0,
      revenue: parseFloat(formData.revenue) || 0,
    }

    if (editingAd) {
      const { data, error } = await supabase
        .from('ads')
        .update(payload)
        .eq('id', editingAd.id)
        .select('*, client:clients(id, name)')
        .single()

      if (!error && data) {
        setAds((prev) => prev.map((a) => (a.id === data.id ? data : a)))
        setIsDialogOpen(false)
      }
    } else {
      const { data, error } = await supabase
        .from('ads')
        .insert([payload])
        .select('*, client:clients(id, name)')
        .single()

      if (!error && data) {
        setAds((prev) => [data, ...prev])
        setIsDialogOpen(false)
      }
    }
    setLoading(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this ad?')) return
    const supabase = createClient()
    const { error } = await supabase.from('ads').delete().eq('id', id)
    if (!error) {
      setAds((prev) => prev.filter((a) => a.id !== id))
    }
  }

  function formatCurrency(value: number) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value)
  }

  function calculateROAS(revenue: number, spend: number) {
    if (spend === 0) return '—'
    return (revenue / spend).toFixed(2) + 'x'
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add Ad
        </Button>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead>Spend</TableHead>
              <TableHead>Revenue</TableHead>
              <TableHead>ROAS</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-zinc-500">
                  No ads yet.
                </TableCell>
              </TableRow>
            ) : (
              ads.map((ad) => (
                <TableRow key={ad.id}>
                  <TableCell className="font-medium">{ad.name}</TableCell>
                  <TableCell>{ad.client?.name || '—'}</TableCell>
                  <TableCell>{ad.platform || '—'}</TableCell>
                  <TableCell>{formatCurrency(ad.spend)}</TableCell>
                  <TableCell>{formatCurrency(ad.revenue)}</TableCell>
                  <TableCell className="font-semibold text-amber-500">
                    {calculateROAS(ad.revenue, ad.spend)}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-green-500/10 text-green-500">
                      {ad.status || 'active'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(ad)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(ad.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogClose onClick={() => setIsDialogOpen(false)} />
          <DialogHeader>
            <DialogTitle>{editingAd ? 'Edit Ad' : 'Add Ad'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Ad Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="client_id">Client *</Label>
              <select
                id="client_id"
                value={formData.client_id}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, client_id: e.target.value }))
                }
                required
                className="flex h-10 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="">Select a client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="platform">Platform</Label>
              <Input
                id="platform"
                value={formData.platform}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, platform: e.target.value }))
                }
                placeholder="Facebook, Google, etc."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="spend">Spend ($)</Label>
                <Input
                  id="spend"
                  type="number"
                  step="0.01"
                  value={formData.spend}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, spend: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="revenue">Revenue ($)</Label>
                <Input
                  id="revenue"
                  type="number"
                  step="0.01"
                  value={formData.revenue}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, revenue: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : editingAd ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
