'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Loader2, Play } from 'lucide-react'

const SEARCH_TERMS = [
  'restaurants',
  'HVAC',
  'plumber',
  'electrician',
  'dentist',
  'physiotherapy',
  'contractor',
  'medical clinic',
  'chiropractor',
  'roofing',
]

const CITIES = [
  'Hamilton',
  'Burlington',
  'Niagara Falls',
  'St Catharines',
  'Oakville',
  'Mississauga',
  'Toronto',
  'Cambridge',
  'Kitchener',
  'Waterloo',
]

const NICHES = ['Restaurant', 'HVAC/Contractor', 'Medical/Dental']

export interface ScraperLead {
  businessName: string
  website: string
  phone: string
  email: string
  address: string
  city: string
  niche: string | null
  rating: number | null
  googleMapsUrl: string
  status: string
}

export function LeadScraper() {
  const [leadLists, setLeadLists] = useState<{ id: string; name: string }[]>([])
  const [listId, setListId] = useState('')
  const [showNewList, setShowNewList] = useState(false)
  const [newListName, setNewListName] = useState('')
  const [newListNiche, setNewListNiche] = useState('')
  const [listLoading, setListLoading] = useState(false)

  const [searchTerm, setSearchTerm] = useState('restaurants')
  const [city, setCity] = useState('Hamilton')
  const [maxResults, setMaxResults] = useState(100)
  const [niche, setNiche] = useState('Restaurant')

  const [status, setStatus] = useState<'idle' | 'running' | 'done' | 'error'>(
    'idle'
  )
  const [results, setResults] = useState<ScraperLead[]>([])
  const [stats, setStats] = useState<{
    total: number
    withWebsite: number
    withEmail: number
  } | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [addLoading, setAddLoading] = useState(false)
  const [addSuccess, setAddSuccess] = useState<number | null>(null)

  async function fetchLeadLists() {
    const supabase = createClient()
    const { data } = await supabase
      .from('lead_lists')
      .select('id, name')
      .order('name')
    if (data) setLeadLists(data)
  }

  useEffect(() => {
    fetchLeadLists()
  }, [])

  useEffect(() => {
    function handleRefresh() {
      fetchLeadLists()
    }
    window.addEventListener('lead-lists-refresh', handleRefresh)
    return () => window.removeEventListener('lead-lists-refresh', handleRefresh)
  }, [])

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
    setListLoading(false)
    if (error || !data) return
    setLeadLists((prev) => [...prev, data])
    setListId(data.id)
    setNewListName('')
    setNewListNiche('')
    setShowNewList(false)
    window.dispatchEvent(new CustomEvent('lead-lists-refresh'))
  }

  async function runScraper() {
    if (!listId) return
    setStatus('running')
    setResults([])
    setStats(null)
    setSelected(new Set())
    try {
      const res = await fetch('/api/scraper/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          searchTerm,
          city,
          maxResults,
          niche,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setStatus('error')
        return
      }
      setResults(data.leads ?? [])
      setStats({
        total: data.total ?? 0,
        withWebsite: data.withWebsite ?? 0,
        withEmail: data.withEmail ?? 0,
      })
      setStatus('done')
    } catch {
      setStatus('error')
    }
  }

  function toggleSelect(name: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  function selectAll() {
    if (selected.size === results.length) setSelected(new Set())
    else setSelected(new Set(results.map((r) => r.businessName)))
  }

  async function addToLeads() {
    if (!listId || selected.size === 0) return
    const toAdd = results.filter((r) => selected.has(r.businessName))
    const leads = toAdd
      .filter((r) => r.businessName && r.phone)
      .map((r) => ({
        name: r.businessName,
        phone: r.phone,
        email: r.email || null,
        city: r.city || null,
        website: r.website || null,
        niche: r.niche || null,
      }))
    if (leads.length === 0) return
    setAddLoading(true)
    try {
      const res = await fetch('/api/leads/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listId, leads }),
      })
      const data = await res.json()
      if (res.ok) {
        setAddSuccess(leads.length)
        setTimeout(() => setAddSuccess(null), 4000)
        window.dispatchEvent(new CustomEvent('leads-refresh'))
        window.dispatchEvent(new CustomEvent('lead-lists-refresh'))
        setSelected(new Set())
      } else {
        console.error('Bulk add error:', data)
      }
    } finally {
      setAddLoading(false)
    }
  }

  const selectAllChecked =
    results.length > 0 && selected.size === results.length
  const someSelected = selected.size > 0

  return (
    <div className="space-y-6">
      {/* List selection */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
        <Label className="mb-2 block">Lead list (required)</Label>
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[200px]">
            <select
              value={showNewList ? '__new__' : listId}
              onChange={(e) => {
                const v = e.target.value
                if (v === '__new__') {
                  setShowNewList(true)
                  setListId('')
                } else {
                  setShowNewList(false)
                  setListId(v)
                }
              }}
              className="flex h-10 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100"
            >
              <option value="">Select a list...</option>
              {leadLists.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
              <option value="__new__">+ New list...</option>
            </select>
          </div>
          {showNewList && (
            <form
              onSubmit={handleCreateList}
              className="flex flex-wrap items-end gap-2"
            >
              <div>
                <Label htmlFor="new-list-name" className="sr-only">
                  List name
                </Label>
                <Input
                  id="new-list-name"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="List name"
                  className="w-40"
                />
              </div>
              <div>
                <Label htmlFor="new-list-niche" className="sr-only">
                  Niche (optional)
                </Label>
                <Input
                  id="new-list-niche"
                  value={newListNiche}
                  onChange={(e) => setNewListNiche(e.target.value)}
                  placeholder="Niche (optional)"
                  className="w-36"
                />
              </div>
              <Button type="submit" disabled={listLoading || !newListName.trim()}>
                {listLoading ? 'Creating...' : 'Create'}
              </Button>
            </form>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <Label htmlFor="search-term">Search term</Label>
          <select
            id="search-term"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mt-1 flex h-10 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100"
          >
            {SEARCH_TERMS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="city">City</Label>
          <select
            id="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="mt-1 flex h-10 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100"
          >
            {CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="niche">Niche</Label>
          <select
            id="niche"
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            className="mt-1 flex h-10 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100"
          >
            {NICHES.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="max-results">Max results</Label>
          <Input
            id="max-results"
            type="number"
            min={10}
            max={200}
            value={maxResults}
            onChange={(e) => setMaxResults(Number(e.target.value) || 100)}
            className="mt-1"
          />
        </div>
      </div>

      <Button
        onClick={runScraper}
        disabled={status === 'running' || !listId}
        className="bg-amber-600 text-white hover:bg-amber-500"
      >
        {status === 'running' ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Scraping...
          </>
        ) : (
          <>
            <Play className="mr-2 h-4 w-4" />
            Run Scraper
          </>
        )}
      </Button>

      {status === 'running' && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          Running Apify scraper for &quot;{searchTerm} {city}&quot;… This takes
          2–5 minutes. Do not close this tab.
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3">
            <span className="text-zinc-400">Total found</span>
            <p className="text-lg font-medium text-zinc-100">{stats.total}</p>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3">
            <span className="text-zinc-400">Have website</span>
            <p className="text-lg font-medium text-zinc-100">
              {stats.withWebsite}
            </p>
          </div>
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3">
            <span className="text-amber-200/80">Have email</span>
            <p className="text-lg font-medium text-amber-200">{stats.withEmail}</p>
          </div>
        </div>
      )}

      {results.length > 0 && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={selectAll}
            >
              {selectAllChecked ? 'Deselect all' : 'Select all'} ({results.length}
              )
            </Button>
            <Button
              onClick={addToLeads}
              disabled={!someSelected || addLoading}
              className="bg-amber-600 text-white hover:bg-amber-500"
            >
              {addLoading ? 'Adding...' : `Add ${selected.size} to leads`}
            </Button>
          </div>

          <div className="rounded-xl border border-zinc-800 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Business</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Website</TableHead>
                  <TableHead>Rating</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((lead) => (
                  <TableRow
                    key={lead.businessName + lead.phone}
                    className={lead.email ? 'bg-amber-500/5' : ''}
                  >
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selected.has(lead.businessName)}
                        onChange={() => toggleSelect(lead.businessName)}
                        className="h-4 w-4 rounded border-zinc-600 bg-zinc-800"
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {lead.businessName}
                    </TableCell>
                    <TableCell>{lead.phone || '—'}</TableCell>
                    <TableCell
                      className={lead.email ? 'text-amber-400' : 'text-zinc-500'}
                    >
                      {lead.email || '—'}
                    </TableCell>
                    <TableCell>
                      {lead.website ? (
                        <a
                          href={lead.website}
                          target="_blank"
                          rel="noreferrer"
                          className="text-amber-400 hover:underline"
                        >
                          Visit
                        </a>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell>{lead.rating ?? '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      {addSuccess !== null && (
        <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">
          {addSuccess} lead{addSuccess !== 1 ? 's' : ''} added to list.
        </div>
      )}

      {status === 'error' && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          Scraper failed. Check the console and ensure APIFY_TOKEN is set.
        </div>
      )}
    </div>
  )
}
