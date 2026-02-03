'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Pencil, Trash2 } from 'lucide-react'

interface Lead {
  id: string
  name: string
  email: string | null
  phone: string
  niche: string | null
  city: string | null
  website: string | null
  list_id: string | null
  status: string
  created_at: string
  list?: { id: string; name: string }
}

interface LeadsTableProps {
  initialLeads: Lead[]
  leadLists: { id: string; name: string }[]
}

const LEAD_STATUSES = ['new', 'called', 'no_answer', 'didnt_book', 'booked']

export function LeadsTable({ initialLeads, leadLists: initialLeadLists }: LeadsTableProps) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads)
  const [leadLists, setLeadLists] = useState<{ id: string; name: string }[]>(initialLeadLists)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isListDialogOpen, setIsListDialogOpen] = useState(false)
  const [newListName, setNewListName] = useState('')
  const [newListNiche, setNewListNiche] = useState('')
  const [listLoading, setListLoading] = useState(false)
  const [editingLead, setEditingLead] = useState<Lead | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    niche: '',
    city: '',
    website: '',
    list_id: '',
    status: 'new',
  })
  const [loading, setLoading] = useState(false)

  // Refresh leads when CSV upload completes
  useEffect(() => {
    async function refreshLeads() {
      const supabase = createClient()
      const { data } = await supabase
        .from('leads')
        .select('*, list:lead_lists(id, name)')
        .order('created_at', { ascending: false })
      if (data) {
        setLeads(data)
      }
    }

    function handleRefresh() {
      refreshLeads()
    }
    window.addEventListener('leads-refresh', handleRefresh)
    return () => window.removeEventListener('leads-refresh', handleRefresh)
  }, [])

  function openCreateDialog() {
    setEditingLead(null)
    setFormData({ name: '', email: '', phone: '', niche: '', city: '', website: '', list_id: '', status: 'new' })
    setIsDialogOpen(true)
  }

  function openEditDialog(lead: Lead) {
    setEditingLead(lead)
    setFormData({
      name: lead.name,
      email: lead.email ?? '',
      phone: lead.phone,
      niche: lead.niche ?? '',
      city: lead.city ?? '',
      website: lead.website ?? '',
      list_id: lead.list_id ?? '',
      status: lead.status,
    })
    setIsDialogOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()

    const payload = {
      ...formData,
      list_id: formData.list_id || null,
    }

    if (editingLead) {
      const { data, error } = await supabase
        .from('leads')
        .update(payload)
        .eq('id', editingLead.id)
        .select('*, list:lead_lists(id, name)')
        .single()

      if (!error && data) {
        setLeads((prev) =>
          prev.map((l) => (l.id === data.id ? data : l))
        )
        setIsDialogOpen(false)
      }
    } else {
      const { data, error } = await supabase
        .from('leads')
        .insert([payload])
        .select('*, list:lead_lists(id, name)')
        .single()

      if (!error && data) {
        setLeads((prev) => [data, ...prev])
        setIsDialogOpen(false)
      }
    }
    setLoading(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this lead?')) return
    const supabase = createClient()
    const { error } = await supabase.from('leads').delete().eq('id', id)
    if (!error) {
      setLeads((prev) => prev.filter((l) => l.id !== id))
    }
  }

  async function handleCreateList(e: React.FormEvent) {
    e.preventDefault()
    if (!newListName.trim()) return
    setListLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('lead_lists')
      .insert([{ name: newListName.trim(), niche: newListNiche.trim() || null }])
      .select('id, name')
      .single()
    if (!error && data) {
      setLeadLists((prev) => [...prev, data])
      setFormData((prev) => ({ ...prev, list_id: data.id }))
      setNewListName('')
      setNewListNiche('')
      setIsListDialogOpen(false)
    }
    setListLoading(false)
  }

  function getStatusColor(status: string) {
    const colors: Record<string, string> = {
      new: 'bg-blue-500/10 text-blue-500',
      called: 'bg-purple-500/10 text-purple-500',
      no_answer: 'bg-amber-500/10 text-amber-500',
      didnt_book: 'bg-red-500/10 text-red-500',
      booked: 'bg-green-500/10 text-green-500',
    }
    return colors[status] || 'bg-zinc-500/10 text-zinc-500'
  }

  return (
    <>
      <div className="flex flex-wrap justify-end gap-2 mb-4">
        <Button variant="outline" onClick={() => setIsListDialogOpen(true)}>
          Create new list
        </Button>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add Lead
        </Button>
      </div>

      <Dialog open={isListDialogOpen} onOpenChange={setIsListDialogOpen}>
        <DialogContent>
          <DialogClose onClick={() => setIsListDialogOpen(false)} />
          <DialogHeader>
            <DialogTitle>Create new lead list</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateList} className="space-y-4">
            <div>
              <Label htmlFor="list_name">List name *</Label>
              <Input
                id="list_name"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="e.g. February 2025"
                required
              />
            </div>
            <div>
              <Label htmlFor="list_niche">Niche (optional)</Label>
              <Input
                id="list_niche"
                value={newListNiche}
                onChange={(e) => setNewListNiche(e.target.value)}
                placeholder="e.g. Real estate"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsListDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={listLoading}>
                {listLoading ? 'Creating...' : 'Create list'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Website</TableHead>
              <TableHead>List</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-zinc-500">
                  No leads yet.
                </TableCell>
              </TableRow>
            ) : (
              leads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">{lead.name}</TableCell>
                  <TableCell>{lead.city || '—'}</TableCell>
                  <TableCell>{lead.phone}</TableCell>
                  <TableCell>{lead.email || '—'}</TableCell>
                  <TableCell>
                    {lead.website ? (
                      <a 
                        href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-amber-500 hover:text-amber-400 underline"
                      >
                        {lead.website.replace(/^https?:\/\//, '')}
                      </a>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell>{lead.list?.name || '—'}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                        lead.status
                      )}`}
                    >
                      {lead.status.replace('_', ' ')}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(lead)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(lead.id)}
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
              {editingLead ? 'Edit Lead' : 'Add Lead'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Name *</Label>
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
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, phone: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, city: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, website: e.target.value }))
                }
                placeholder="https://example.com"
              />
            </div>
            <div>
              <Label htmlFor="niche">Niche</Label>
              <Input
                id="niche"
                value={formData.niche}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, niche: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="list_id">Lead List</Label>
              <select
                id="list_id"
                value={formData.list_id}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, list_id: e.target.value }))
                }
                className="flex h-10 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="">No list</option>
                {leadLists.map((list) => (
                  <option key={list.id} value={list.id}>
                    {list.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, status: e.target.value }))
                }
                className="flex h-10 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                {LEAD_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status.replace('_', ' ')}
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
                {loading ? 'Saving...' : editingLead ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
