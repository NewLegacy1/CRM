'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Trash2, List } from 'lucide-react'

interface LeadList {
  id: string
  name: string
  niche: string | null
  total_count: number
  created_at: string
}

interface LeadListsTableProps {
  initialLeadLists: LeadList[]
}

export function LeadListsTable({ initialLeadLists }: LeadListsTableProps) {
  const [leadLists, setLeadLists] = useState<LeadList[]>(initialLeadLists)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Refresh when lists are updated
  useEffect(() => {
    async function fetchLeadLists() {
      const supabase = createClient()
      const { data } = await supabase
        .from('lead_lists')
        .select('id, name, niche, total_count, created_at')
        .order('name')
      if (data) {
        setLeadLists(data)
      }
    }

    function handleRefresh() {
      fetchLeadLists()
    }
    window.addEventListener('lead-lists-refresh', handleRefresh)
    fetchLeadLists()
    return () => window.removeEventListener('lead-lists-refresh', handleRefresh)
  }, [])

  async function handleDelete(id: string) {
    if (!confirm('Delete this lead list? This will also remove all leads in this list.')) return
    setDeletingId(id)
    const supabase = createClient()
    const { error } = await supabase.from('lead_lists').delete().eq('id', id)
    if (!error) {
      setLeadLists((prev) => prev.filter((l) => l.id !== id))
      window.dispatchEvent(new CustomEvent('lead-lists-refresh'))
      setIsDialogOpen(false)
    }
    setDeletingId(null)
  }

  return (
    <>
      <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
        <List className="mr-2 h-4 w-4" />
        View Lists
      </Button>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogClose onClick={() => setIsDialogOpen(false)} />
          <DialogHeader>
            <DialogTitle>Lead Lists</DialogTitle>
          </DialogHeader>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Niche</TableHead>
                  <TableHead>Total Leads</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leadLists.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-zinc-500">
                      No lead lists yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  leadLists.map((list) => (
                    <TableRow key={list.id}>
                      <TableCell className="font-medium">{list.name}</TableCell>
                      <TableCell>{list.niche || '—'}</TableCell>
                      <TableCell>{list.total_count}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(list.id)}
                          disabled={deletingId === list.id}
                        >
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
