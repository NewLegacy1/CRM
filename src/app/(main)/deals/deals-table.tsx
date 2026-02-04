'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Pencil, Trash2 } from 'lucide-react'

interface Deal {
  id: string
  client_id: string
  name: string
  value: number
  stage: string
  created_at: string
  client?: { id: string; name: string }
}

interface DealsTableProps {
  initialDeals: Deal[]
  clients: { id: string; name: string }[]
}

const DEAL_STAGES = [
  'qualification',
  'proposal',
  'negotiation',
  'closed_won',
  'closed_lost',
]

export function DealsTable({ initialDeals, clients }: DealsTableProps) {
  const [deals, setDeals] = useState<Deal[]>(initialDeals)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    client_id: '',
    value: '',
    stage: 'qualification',
  })
  const [loading, setLoading] = useState(false)

  function openCreateDialog() {
    setEditingDeal(null)
    setFormData({ name: '', client_id: '', value: '', stage: 'qualification' })
    setIsDialogOpen(true)
  }

  function openEditDialog(deal: Deal) {
    setEditingDeal(deal)
    setFormData({
      name: deal.name,
      client_id: deal.client_id,
      value: deal.value.toString(),
      stage: deal.stage,
    })
    setIsDialogOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()

    const payload = {
      ...formData,
      value: parseFloat(formData.value) || 0,
    }

    if (editingDeal) {
      const { data, error } = await supabase
        .from('deals')
        .update(payload)
        .eq('id', editingDeal.id)
        .select('*, client:clients(id, name)')
        .single()

      if (!error && data) {
        setDeals((prev) =>
          prev.map((d) => (d.id === data.id ? data : d))
        )
        setIsDialogOpen(false)
      }
    } else {
      const { data, error } = await supabase
        .from('deals')
        .insert([payload])
        .select('*, client:clients(id, name)')
        .single()

      if (!error && data) {
        setDeals((prev) => [data, ...prev])
        setIsDialogOpen(false)
      }
    }
    setLoading(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this deal?')) return
    const supabase = createClient()
    const { error } = await supabase.from('deals').delete().eq('id', id)
    if (!error) {
      setDeals((prev) => prev.filter((d) => d.id !== id))
    }
  }

  async function handleStageChange(dealId: string, newStage: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('deals')
      .update({ stage: newStage })
      .eq('id', dealId)
      .select('*, client:clients(id, name)')
      .single()

    if (error) {
      console.error('Error updating deal stage:', error)
      alert(`Failed to update deal stage: ${error.message}`)
      return
    }

    if (data) {
      setDeals((prev) =>
        prev.map((d) => (d.id === data.id ? data : d))
      )
    }
  }

  function formatCurrency(value: number) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value)
  }

  function getStageColor(stage: string) {
    const colors: Record<string, string> = {
      qualification: 'bg-blue-500/10 text-blue-500',
      proposal: 'bg-purple-500/10 text-purple-500',
      negotiation: 'bg-amber-500/10 text-amber-500',
      closed_won: 'bg-green-500/10 text-green-500',
      closed_lost: 'bg-red-500/10 text-red-500',
    }
    return colors[stage] || 'bg-zinc-500/10 text-zinc-500'
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add Deal
        </Button>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deals.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-zinc-500">
                  No deals yet.
                </TableCell>
              </TableRow>
            ) : (
              deals.map((deal) => (
                <TableRow key={deal.id}>
                  <TableCell className="font-medium">{deal.name}</TableCell>
                  <TableCell>{deal.client?.name || '—'}</TableCell>
                  <TableCell>{formatCurrency(deal.value)}</TableCell>
                  <TableCell>
                    <select
                      value={deal.stage}
                      onChange={(e) => handleStageChange(deal.id, e.target.value)}
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium border-0 cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-500 ${getStageColor(
                        deal.stage
                      )}`}
                      style={{ 
                        appearance: 'none',
                        WebkitAppearance: 'none',
                        MozAppearance: 'none',
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 0.25rem center',
                        backgroundSize: '0.75em',
                        paddingRight: '1.5rem',
                      }}
                    >
                      {DEAL_STAGES.map((stage) => (
                        <option key={stage} value={stage} className="bg-zinc-800 text-zinc-100">
                          {stage.replace('_', ' ')}
                        </option>
                      ))}
                    </select>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(deal)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(deal.id)}
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
            <DialogTitle>
              {editingDeal ? 'Edit Deal' : 'Add Deal'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Deal Name *</Label>
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
              <Label htmlFor="value">Value ($) *</Label>
              <Input
                id="value"
                type="number"
                step="0.01"
                value={formData.value}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, value: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="stage">Stage</Label>
              <select
                id="stage"
                value={formData.stage}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, stage: e.target.value }))
                }
                className="flex h-10 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                {DEAL_STAGES.map((stage) => (
                  <option key={stage} value={stage}>
                    {stage.replace('_', ' ')}
                  </option>
                ))}
              </select>
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
                {loading ? 'Saving...' : editingDeal ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
