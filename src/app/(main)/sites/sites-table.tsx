'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Pencil, Trash2, ExternalLink } from 'lucide-react'

interface Site {
  id: string
  client_id: string
  name: string | null
  url: string
  client?: { id: string; name: string }
}

interface SitesTableProps {
  initialSites: Site[]
  clients: { id: string; name: string }[]
}

export function SitesTable({ initialSites, clients }: SitesTableProps) {
  const [sites, setSites] = useState<Site[]>(initialSites)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSite, setEditingSite] = useState<Site | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    client_id: '',
    url: '',
  })
  const [loading, setLoading] = useState(false)

  function openCreateDialog() {
    setEditingSite(null)
    setFormData({ name: '', client_id: '', url: '' })
    setIsDialogOpen(true)
  }

  function openEditDialog(site: Site) {
    setEditingSite(site)
    setFormData({
      name: site.name ?? '',
      client_id: site.client_id,
      url: site.url,
    })
    setIsDialogOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()

    if (editingSite) {
      const { data, error } = await supabase
        .from('sites')
        .update(formData)
        .eq('id', editingSite.id)
        .select('*, client:clients(id, name)')
        .single()

      if (!error && data) {
        setSites((prev) => prev.map((s) => (s.id === data.id ? data : s)))
        setIsDialogOpen(false)
      }
    } else {
      const { data, error } = await supabase
        .from('sites')
        .insert([formData])
        .select('*, client:clients(id, name)')
        .single()

      if (!error && data) {
        setSites((prev) => [data, ...prev])
        setIsDialogOpen(false)
      }
    }
    setLoading(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this site?')) return
    const supabase = createClient()
    const { error } = await supabase.from('sites').delete().eq('id', id)
    if (!error) {
      setSites((prev) => prev.filter((s) => s.id !== id))
    }
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add Site
        </Button>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>URL</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sites.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-zinc-500">
                  No sites yet.
                </TableCell>
              </TableRow>
            ) : (
              sites.map((site) => (
                <TableRow key={site.id}>
                  <TableCell className="font-medium">{site.name || '—'}</TableCell>
                  <TableCell>{site.client?.name || '—'}</TableCell>
                  <TableCell>
                    <a
                      href={site.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-amber-500 hover:text-amber-400"
                    >
                      {site.url}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(site)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(site.id)}
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
            <DialogTitle>{editingSite ? 'Edit Site' : 'Add Site'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Site Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
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
              <Label htmlFor="url">URL *</Label>
              <Input
                id="url"
                type="url"
                value={formData.url}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, url: e.target.value }))
                }
                required
                placeholder="https://example.com"
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
                {loading ? 'Saving...' : editingSite ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
