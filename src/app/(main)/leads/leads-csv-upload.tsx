'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog'
import { Upload } from 'lucide-react'

interface LeadsCsvUploadProps {
  leadLists: { id: string; name: string }[]
}

export function LeadsCsvUpload({ leadLists: initialLeadLists }: LeadsCsvUploadProps) {
  const [open, setOpen] = useState(false)
  const [listId, setListId] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ count: number; columnMap?: Record<string, string | null>; error?: string; details?: string } | null>(null)
  const [leadLists, setLeadLists] = useState<{ id: string; name: string }[]>(initialLeadLists)
  const inputRef = useRef<HTMLInputElement>(null)

  // Refresh lead lists when dialog opens
  useEffect(() => {
    if (open) {
      async function fetchLeadLists() {
        const supabase = createClient()
        const { data } = await supabase.from('lead_lists').select('id, name').order('name')
        if (data) {
          setLeadLists(data)
        }
      }
      fetchLeadLists()
    }
  }, [open])

  // Listen for refresh events
  useEffect(() => {
    function handleRefresh() {
      async function fetchLeadLists() {
        const supabase = createClient()
        const { data } = await supabase.from('lead_lists').select('id, name').order('name')
        if (data) {
          setLeadLists(data)
        }
      }
      fetchLeadLists()
    }
    window.addEventListener('lead-lists-refresh', handleRefresh)
    return () => window.removeEventListener('lead-lists-refresh', handleRefresh)
  }, [])

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!file || !listId) return
    setLoading(true)
    setResult(null)
    const form = new FormData()
    form.append('file', file)
    form.append('listId', listId)
    try {
      const res = await fetch('/api/leads/upload-csv', {
        method: 'POST',
        body: form,
      })
      const data = await res.json()
      if (res.ok) {
        setResult({ count: data.count, columnMap: data.columnMap })
        setFile(null)
        setListId('')
        if (inputRef.current) inputRef.current.value = ''
        window.dispatchEvent(new CustomEvent('leads-refresh'))
      } else {
        console.error('Upload error response:', data)
        setResult({ 
          count: 0, 
          error: data.error || 'Upload failed',
          details: data.details || ''
        })
      }
    } catch {
      setResult({ count: 0 })
    }
    setLoading(false)
  }

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Upload className="mr-2 h-4 w-4" />
        Upload CSV
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogClose onClick={() => setOpen(false)} />
          <DialogHeader>
            <DialogTitle>Upload Leads CSV</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <Label htmlFor="listId">Lead List *</Label>
              <select
                id="listId"
                value={listId}
                onChange={(e) => setListId(e.target.value)}
                required
                className="mt-1 flex h-10 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100"
              >
                <option value="">Select a list...</option>
                {leadLists.map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="file">CSV File *</Label>
              <input
                ref={inputRef}
                id="file"
                type="file"
                accept=".csv"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="mt-1 block w-full text-sm text-zinc-400 file:mr-4 file:rounded-lg file:border-0 file:bg-amber-600 file:px-4 file:py-2 file:text-white"
              />
              <p className="mt-1 text-xs text-zinc-500">
                Headers like name, phone, email, niche are auto-detected. First row = headers.
              </p>
            </div>
            {result && (
              <div className={`rounded-lg p-3 text-sm ${result.count > 0 ? 'bg-zinc-800 text-zinc-300' : 'bg-red-500/10 text-red-400'}`}>
                {result.count > 0 ? (
                  <>
                    <p className="font-medium text-amber-500">Imported {result.count} leads.</p>
                    {result.columnMap && (
                      <p className="mt-1 text-zinc-500">
                        Mapped: name, phone{result.columnMap.email ? ', email' : ''}{result.columnMap.city ? ', city' : ''}{result.columnMap.website ? ', website' : ''}
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <p className="font-medium">Upload failed: {result.error || 'Unknown error'}</p>
                    {result.details && (
                      <p className="mt-1 text-sm text-red-300">{result.details}</p>
                    )}
                    <p className="mt-2 text-xs text-red-300">Check the browser console and server logs for more details.</p>
                  </>
                )}
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Close</Button>
              <Button type="submit" disabled={loading || !file || !listId}>
                {loading ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
