'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Pencil, Trash2 } from 'lucide-react'

interface Funnel {
  id: string
  client_id: string
  name: string
  conversion_rate: number | null
  client?: { id: string; name: string }
}

interface FunnelsTableProps {
  initialFunnels: Funnel[]
  clients: { id: string; name: string }[]
}

export function FunnelsTable({ initialFunnels, clients }: FunnelsTableProps) {
  const [funnels, setFunnels] = useState<Funnel[]>(initialFunnels)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingFunnel, setEditingFunnel] = useState<Funnel | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    client_id: '',
    conversion_rate: '',
  })
  const [loading, setLoading] = useState(false)

  function openCreateDialog() {
    setEditingFunnel(null)
    setFormData({ name: '', client_id: '', conversion_rate: '' })
    setIsDialogOpen(true)
  }

  function openEditDialog(funnel: Funnel) {
    setEditingFunnel(funnel)
    setFormData({
      name: funnel.name,
      client_id: funnel.client_id,
      conversion_rate: funnel.conversion_rate?.toString() ?? '',
    })
    setIsDialogOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()

    const payload = {
      ...formData,
      conversion_rate: formData.conversion_rate ? parseFloat(formData.conversion_rate) : null,
    }

    if (editingFunnel) {
      const { data, error } = await supabase
        .from('funnels')
        .update(payload)
        .eq('id', editingFunnel.id)
        .select('*, client:clients(id, name)')
        .single()

      if (!error && data) {
        setFunnels((prev) => prev.map((f) => (f.id === data.id ? data : f)))
        setIsDialogOpen(false)
      }
    } else {
      const { data, error } = await supabase
        .from('funnels')
        .insert([payload])
        .select('*, client:clients(id, name)')
        .single()

      if (!error && data) {
        setFunnels((prev) => [data, ...prev])
        setIsDialogOpen(false)
      }
    }
    setLoading(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this funnel?')) return
    const supabase = createClient()
    const { error } = await supabase.from('funnels').delete().eq('id', id)
    if (!error) {
      setFunnels((prev) => prev.filter((f) => f.id !== id))
    }
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add Funnel
        </Button>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Conversion Rate</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {funnels.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-zinc-500">
                  No funnels yet.
                </TableCell>
              </TableRow>
            ) : (
              funnels.map((funnel) => (
                <TableRow key={funnel.id}>
                  <TableCell className="font-medium">{funnel.name}</TableCell>
                  <TableCell>{funnel.client?.name || '—'}</TableCell>
                  <TableCell>
                    {funnel.conversion_rate ? `${funnel.conversion_rate}%` : '—'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(funnel)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(funnel.id)}
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
            <DialogTitle>{editingFunnel ? 'Edit Funnel' : 'Add Funnel'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Funnel Name *</Label>
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
              <Label htmlFor="conversion_rate">Conversion Rate (%)</Label>
              <Input
                id="conversion_rate"
                type="number"
                step="0.01"
                value={formData.conversion_rate}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, conversion_rate: e.target.value }))
                }
              />
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
                {loading ? 'Saving...' : editingFunnel ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
