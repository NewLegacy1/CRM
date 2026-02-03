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
  name: string
  conversion_rate: number | null
}

interface FunnelsListProps {
  projectId: string
  clientId: string
  initialFunnels: Funnel[]
}

export function FunnelsList({ projectId, clientId, initialFunnels }: FunnelsListProps) {
  const [funnels, setFunnels] = useState<Funnel[]>(initialFunnels)
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [conversionRate, setConversionRate] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    if (!clientId) return setLoading(false)
    const { data, error } = await supabase
      .from('funnels')
      .insert([{ name, conversion_rate: conversionRate ? parseFloat(conversionRate) : null, client_id: clientId, project_id: projectId }])
      .select()
      .single()
    if (!error && data) {
      setFunnels((prev) => [data, ...prev])
      setOpen(false)
      setName('')
      setConversionRate('')
    }
    setLoading(false)
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Funnel
        </Button>
      </div>
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Conversion Rate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(funnels.length === 0) ? (
              <TableRow>
                <TableCell colSpan={2} className="text-center text-zinc-500">
                  No funnels. Add one for this project.
                </TableCell>
              </TableRow>
            ) : (
              funnels.map((f) => (
                <TableRow key={f.id}>
                  <TableCell className="font-medium">{f.name}</TableCell>
                  <TableCell>{f.conversion_rate ? `${f.conversion_rate}%` : '—'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogClose onClick={() => setOpen(false)} />
          <DialogHeader>
            <DialogTitle>Add Funnel</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="cr">Conversion Rate (%)</Label>
              <Input id="cr" type="number" step="0.01" value={conversionRate} onChange={(e) => setConversionRate(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Create'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
