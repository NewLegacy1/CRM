'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog'
import { Plus, Pencil, Trash2, ExternalLink, Github } from 'lucide-react'

interface ProjectOverviewClientProps {
  project: any
  teamMembers: { id: string; display_name: string | null; role: string }[]
  allInvoices: { id: string; amount_total: number; status: string; created_at: string }[]
}

export function ProjectOverviewClient({ project: initialProject, teamMembers, allInvoices }: ProjectOverviewClientProps) {
  const [project, setProject] = useState(initialProject)
  const [isUrlDialogOpen, setIsUrlDialogOpen] = useState(false)
  const [isRepoDialogOpen, setIsRepoDialogOpen] = useState(false)
  const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false)
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false)
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [loading, setLoading] = useState(false)

  const urls = (project.urls as string[]) ?? []
  const repos = (project.repos as string[]) ?? []
  const selectedTeam = (project.team_members as string[]) ?? []
  const linkedInvoices = (project.invoices as string[]) ?? []
  const notes = (project.notes as { text: string; by: string; by_name: string; at: string }[]) ?? []
  const updates = (project.updates as { text: string; at: string }[]) ?? []

  async function addUrl(url: string) {
    if (!url.trim()) return
    setLoading(true)
    const supabase = createClient()
    const newUrls = [...urls, url.trim()]
    const { data, error } = await supabase
      .from('projects')
      .update({ urls: newUrls })
      .eq('id', project.id)
      .select()
      .single()
    
    if (!error && data) {
      setProject(data)
      setIsUrlDialogOpen(false)
    }
    setLoading(false)
  }

  async function removeUrl(url: string) {
    setLoading(true)
    const supabase = createClient()
    const newUrls = urls.filter((u: string) => u !== url)
    const { data, error } = await supabase
      .from('projects')
      .update({ urls: newUrls })
      .eq('id', project.id)
      .select()
      .single()
    
    if (!error && data) {
      setProject(data)
    }
    setLoading(false)
  }

  async function addRepo(repo: string) {
    if (!repo.trim()) return
    setLoading(true)
    const supabase = createClient()
    const newRepos = [...repos, repo.trim()]
    const { data, error } = await supabase
      .from('projects')
      .update({ repos: newRepos })
      .eq('id', project.id)
      .select()
      .single()
    
    if (!error && data) {
      setProject(data)
      setIsRepoDialogOpen(false)
    }
    setLoading(false)
  }

  async function removeRepo(repo: string) {
    setLoading(true)
    const supabase = createClient()
    const newRepos = repos.filter((r: string) => r !== repo)
    const { data, error } = await supabase
      .from('projects')
      .update({ repos: newRepos })
      .eq('id', project.id)
      .select()
      .single()
    
    if (!error && data) {
      setProject(data)
    }
    setLoading(false)
  }

  async function toggleTeamMember(memberId: string) {
    setLoading(true)
    const supabase = createClient()
    const newTeam = selectedTeam.includes(memberId)
      ? selectedTeam.filter((id: string) => id !== memberId)
      : [...selectedTeam, memberId]
    
    const { data, error } = await supabase
      .from('projects')
      .update({ team_members: newTeam })
      .eq('id', project.id)
      .select()
      .single()
    
    if (!error && data) {
      setProject(data)
    }
    setLoading(false)
  }

  async function toggleInvoice(invoiceId: string) {
    setLoading(true)
    const supabase = createClient()
    const newInvoices = linkedInvoices.includes(invoiceId)
      ? linkedInvoices.filter((id: string) => id !== invoiceId)
      : [...linkedInvoices, invoiceId]
    
    const { data, error } = await supabase
      .from('projects')
      .update({ invoices: newInvoices })
      .eq('id', project.id)
      .select()
      .single()
    
    if (!error && data) {
      setProject(data)
    }
    setLoading(false)
  }

  async function addNote() {
    if (!noteText.trim()) return
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', user?.id ?? '')
      .single()
    
    const newNotes = [
      ...notes,
      {
        text: noteText.trim(),
        by: user?.id ?? '',
        by_name: profile?.display_name ?? 'Unknown',
        at: new Date().toISOString(),
      },
    ]
    
    const { data, error } = await supabase
      .from('projects')
      .update({ notes: newNotes })
      .eq('id', project.id)
      .select()
      .single()
    
    if (!error && data) {
      setProject(data)
      setNoteText('')
      setIsNoteDialogOpen(false)
    }
    setLoading(false)
  }

  function formatCurrency(value: number) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value)
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <p className="text-sm text-zinc-400">Type</p>
          <p className="text-lg font-medium text-zinc-100 capitalize mt-1">
            {project.type?.replace('_', ' ') ?? 'Website'}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <p className="text-sm text-zinc-400">Progress</p>
          <div className="mt-2 flex items-center gap-4">
            <div className="relative w-20 h-20">
              <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="15"
                  fill="none"
                  stroke="rgb(39 39 42)"
                  strokeWidth="3"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="15"
                  fill="none"
                  stroke="rgb(34 197 94)"
                  strokeWidth="3"
                  strokeDasharray={`${94.25 * (project.progress ?? 0) / 100}, 94.25`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-base font-semibold text-zinc-100">
                  {project.progress ?? 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <p className="text-sm text-zinc-400">Status</p>
          <p className="text-lg font-medium text-amber-500 mt-1 capitalize">
            {project.status}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-zinc-100">URLs</h2>
            <Button size="sm" onClick={() => setIsUrlDialogOpen(true)}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {urls.length === 0 ? (
            <p className="text-sm text-zinc-500">No URLs yet.</p>
          ) : (
            <ul className="space-y-2">
              {urls.map((url: string, i: number) => (
                <li key={i} className="flex items-center justify-between gap-2 p-2 rounded bg-zinc-800/50">
                  <a
                    href={url.startsWith('http') ? url : `https://${url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 truncate"
                  >
                    <ExternalLink className="h-4 w-4 shrink-0" />
                    <span className="truncate">{url}</span>
                  </a>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeUrl(url)}
                  >
                    <Trash2 className="h-3 w-3 text-red-400" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-zinc-100">Repositories</h2>
            <Button size="sm" onClick={() => setIsRepoDialogOpen(true)}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {repos.length === 0 ? (
            <p className="text-sm text-zinc-500">No repos yet.</p>
          ) : (
            <ul className="space-y-2">
              {repos.map((repo: string, i: number) => (
                <li key={i} className="flex items-center justify-between gap-2 p-2 rounded bg-zinc-800/50">
                  <a
                    href={repo.startsWith('http') ? repo : `https://${repo}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 truncate"
                  >
                    <Github className="h-4 w-4 shrink-0" />
                    <span className="truncate">{repo}</span>
                  </a>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeRepo(repo)}
                  >
                    <Trash2 className="h-3 w-3 text-red-400" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-zinc-100">Team Members</h2>
            <Button size="sm" onClick={() => setIsTeamDialogOpen(true)}>
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
          {selectedTeam.length === 0 ? (
            <p className="text-sm text-zinc-500">No team members assigned.</p>
          ) : (
            <ul className="space-y-2">
              {selectedTeam.map((memberId: string) => {
                const member = teamMembers.find(m => m.id === memberId)
                return (
                  <li key={memberId} className="flex items-center justify-between p-2 rounded bg-zinc-800/50">
                    <div>
                      <p className="text-sm text-zinc-100">{member?.display_name ?? 'Unknown'}</p>
                      <p className="text-xs text-zinc-500 capitalize">{member?.role.replace('_', ' ')}</p>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-zinc-100">Invoices</h2>
            <Button size="sm" onClick={() => setIsInvoiceDialogOpen(true)}>
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
          {linkedInvoices.length === 0 ? (
            <p className="text-sm text-zinc-500">No invoices linked.</p>
          ) : (
            <ul className="space-y-2">
              {linkedInvoices.map((invoiceId: string) => {
                const invoice = allInvoices.find(inv => inv.id === invoiceId)
                return invoice ? (
                  <li key={invoiceId} className="flex items-center justify-between p-2 rounded bg-zinc-800/50">
                    <div>
                      <p className="text-sm text-zinc-100">{formatCurrency(invoice.amount_total)}</p>
                      <p className="text-xs text-zinc-500 capitalize">{invoice.status}</p>
                    </div>
                  </li>
                ) : null
              })}
            </ul>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-zinc-100">Internal Communications</h2>
          <Button size="sm" onClick={() => setIsNoteDialogOpen(true)}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {notes.length === 0 ? (
          <p className="text-sm text-zinc-500">No notes yet.</p>
        ) : (
          <ul className="space-y-3">
            {notes.map((note: any, i: number) => (
              <li
                key={i}
                className="border-b border-zinc-800 pb-3 last:border-0"
              >
                <div className="flex items-start justify-between gap-4 mb-1">
                  <span className="text-xs font-medium text-amber-500">{note.by_name}</span>
                  <span className="text-xs text-zinc-500 shrink-0">
                    {new Date(note.at).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-sm text-zinc-300">{note.text}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h2 className="text-lg font-semibold text-zinc-100 mb-4">Updates</h2>
        {updates.length === 0 ? (
          <p className="text-sm text-zinc-500">No updates yet.</p>
        ) : (
          <ul className="space-y-3">
            {updates.map((u: any, i: number) => (
              <li
                key={i}
                className="flex justify-between gap-4 border-b border-zinc-800 pb-3 last:border-0"
              >
                <span className="text-zinc-300">{u.text}</span>
                <span className="text-xs text-zinc-500 shrink-0">
                  {new Date(u.at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'numeric',
                    day: 'numeric',
                  })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* URL Dialog */}
      <Dialog open={isUrlDialogOpen} onOpenChange={setIsUrlDialogOpen}>
        <DialogContent>
          <DialogClose onClick={() => setIsUrlDialogOpen(false)} />
          <DialogHeader>
            <DialogTitle>Add URL</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              addUrl(formData.get('url') as string)
            }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                name="url"
                placeholder="https://example.com"
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsUrlDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>Add</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Repo Dialog */}
      <Dialog open={isRepoDialogOpen} onOpenChange={setIsRepoDialogOpen}>
        <DialogContent>
          <DialogClose onClick={() => setIsRepoDialogOpen(false)} />
          <DialogHeader>
            <DialogTitle>Add Repository</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              addRepo(formData.get('repo') as string)
            }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="repo">Repository URL</Label>
              <Input
                id="repo"
                name="repo"
                placeholder="https://github.com/user/repo"
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsRepoDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>Add</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Team Dialog */}
      <Dialog open={isTeamDialogOpen} onOpenChange={setIsTeamDialogOpen}>
        <DialogContent>
          <DialogClose onClick={() => setIsTeamDialogOpen(false)} />
          <DialogHeader>
            <DialogTitle>Manage Team Members</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {teamMembers.map((member) => (
              <label
                key={member.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-zinc-700 bg-zinc-800 cursor-pointer hover:bg-zinc-700"
              >
                <input
                  type="checkbox"
                  checked={selectedTeam.includes(member.id)}
                  onChange={() => toggleTeamMember(member.id)}
                  className="w-4 h-4"
                />
                <div>
                  <p className="text-sm text-zinc-100">{member.display_name ?? 'Unknown'}</p>
                  <p className="text-xs text-zinc-500 capitalize">{member.role.replace('_', ' ')}</p>
                </div>
              </label>
            ))}
          </div>
          <div className="flex justify-end pt-4">
            <Button onClick={() => setIsTeamDialogOpen(false)}>Done</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Invoice Dialog */}
      <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
        <DialogContent>
          <DialogClose onClick={() => setIsInvoiceDialogOpen(false)} />
          <DialogHeader>
            <DialogTitle>Link Invoices</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {allInvoices.map((invoice) => (
              <label
                key={invoice.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-zinc-700 bg-zinc-800 cursor-pointer hover:bg-zinc-700"
              >
                <input
                  type="checkbox"
                  checked={linkedInvoices.includes(invoice.id)}
                  onChange={() => toggleInvoice(invoice.id)}
                  className="w-4 h-4"
                />
                <div className="flex-1">
                  <p className="text-sm text-zinc-100">{formatCurrency(invoice.amount_total)}</p>
                  <p className="text-xs text-zinc-500">
                    {invoice.status} • {new Date(invoice.created_at).toLocaleDateString()}
                  </p>
                </div>
              </label>
            ))}
          </div>
          <div className="flex justify-end pt-4">
            <Button onClick={() => setIsInvoiceDialogOpen(false)}>Done</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Note Dialog */}
      <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
        <DialogContent>
          <DialogClose onClick={() => setIsNoteDialogOpen(false)} />
          <DialogHeader>
            <DialogTitle>Add Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="note">Note</Label>
              <Textarea
                id="note"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Enter your note..."
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsNoteDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={addNote} disabled={loading || !noteText.trim()}>
                Add Note
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
