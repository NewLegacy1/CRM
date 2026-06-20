'use client'

import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog'
import { Copy, ExternalLink, FileText, Loader2, Plus, Send } from 'lucide-react'

type LineItem = { description: string; quantity: number; unit_amount: number }

type Submission = {
  id: string
  signer_name: string
  submitted_at: string
  logo_urls: string[]
  image_urls: string[]
  payload: Record<string, string | undefined>
  invoice_id: string | null
}

type OnboardingLink = {
  id: string
  token: string
  business_name: string
  contact_name: string | null
  email: string
  currency: string
  line_items: LineItem[]
  status: string
  created_at: string
  submission: Submission | Submission[] | null
}

function getSubmission(link: OnboardingLink): Submission | null {
  if (!link.submission) return null
  return Array.isArray(link.submission) ? link.submission[0] ?? null : link.submission
}

function formatCad(lineItems: LineItem[], currency: string) {
  const total = lineItems.reduce((s, r) => s + r.quantity * r.unit_amount, 0)
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(total)
}

export function OnboardingAdmin() {
  const [links, setLinks] = useState<OnboardingLink[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [sendingId, setSendingId] = useState<string | null>(null)
  const [copiedToken, setCopiedToken] = useState<string | null>(null)
  const [createForm, setCreateForm] = useState({
    businessName: '',
    contactName: '',
    email: '',
    websiteAmount: '1200',
    gmbAmount: '500',
  })
  const [creating, setCreating] = useState(false)

  const loadLinks = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/onboarding/links')
      const data = (await res.json()) as { links?: OnboardingLink[]; error?: string }
      if (!res.ok) throw new Error(data.error ?? 'Failed to load')
      setLinks(data.links ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load onboarding links')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadLinks()
  }, [loadLinks])

  async function copyLink(token: string) {
    const url = `${window.location.origin}/start/${token}`
    await navigator.clipboard.writeText(url)
    setCopiedToken(token)
    setTimeout(() => setCopiedToken(null), 2000)
  }

  async function sendInvoice(submissionId: string) {
    if (!confirm('Send Stripe invoice to this client now?')) return
    setSendingId(submissionId)
    setError(null)
    try {
      const res = await fetch(`/api/onboarding/submissions/${submissionId}/send-invoice`, {
        method: 'POST',
      })
      const data = (await res.json()) as { error?: string; message?: string }
      if (!res.ok) throw new Error(data.error ?? 'Failed to send invoice')
      await loadLinks()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to send invoice')
    } finally {
      setSendingId(null)
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    setError(null)
    try {
      const res = await fetch('/api/onboarding/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: createForm.businessName.trim(),
          contactName: createForm.contactName.trim() || undefined,
          email: createForm.email.trim(),
          currency: 'cad',
          lineItems: [
            {
              description: 'Custom landing page website',
              quantity: 1,
              unit_amount: Number(createForm.websiteAmount) || 0,
            },
            {
              description: 'Google Business Profile setup',
              quantity: 1,
              unit_amount: Number(createForm.gmbAmount) || 0,
            },
          ],
        }),
      })
      const data = (await res.json()) as { error?: string; path?: string; link?: { token: string } }
      if (!res.ok) throw new Error(data.error ?? 'Failed to create link')
      setCreateOpen(false)
      setCreateForm({
        businessName: '',
        contactName: '',
        email: '',
        websiteAmount: '1200',
        gmbAmount: '500',
      })
      await loadLinks()
      if (data.link?.token) await copyLink(data.link.token)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create link')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Client onboarding</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Unique links for contract acceptance, assets, and invoice follow-up.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New onboarding link
        </Button>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="flex items-center gap-2 text-zinc-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading…
        </div>
      ) : links.length === 0 ? (
        <p className="text-zinc-500">No onboarding links yet.</p>
      ) : (
        <div className="space-y-4">
          {links.map((link) => {
            const sub = getSubmission(link)
            const path = `/start/${link.token}`
            return (
              <div
                key={link.id}
                className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-zinc-100">{link.business_name}</h2>
                    <p className="text-sm text-zinc-500">{link.email}</p>
                    <p className="mt-1 text-sm text-violet-400">
                      {formatCad(link.line_items, link.currency)} ·{' '}
                      <span className="capitalize text-zinc-400">{link.status}</span>
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => void copyLink(link.token)}>
                      <Copy className="mr-2 h-4 w-4" />
                      {copiedToken === link.token ? 'Copied!' : 'Copy link'}
                    </Button>
                    <a
                      href={path}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-8 items-center justify-center rounded-lg border border-zinc-700 bg-transparent px-3 text-sm text-zinc-100 hover:bg-zinc-800"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Preview
                    </a>
                  </div>
                </div>

                {sub ? (
                  <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-4 text-sm space-y-3">
                    <p className="font-medium text-zinc-200">
                      Submitted {new Date(sub.submitted_at).toLocaleString()} · Signed:{' '}
                      {sub.signer_name}
                    </p>
                    <div className="grid gap-2 text-zinc-400 sm:grid-cols-2">
                      {sub.payload.pagesAndSections ? (
                        <Detail label="Pages/sections" value={sub.payload.pagesAndSections} />
                      ) : null}
                      {sub.payload.copyNotes ? (
                        <Detail label="Copy notes" value={sub.payload.copyNotes} />
                      ) : null}
                      {sub.payload.brandColors ? (
                        <Detail label="Brand colors" value={sub.payload.brandColors} />
                      ) : null}
                      {sub.payload.domainHosting ? (
                        <Detail label="Domain/hosting" value={sub.payload.domainHosting} />
                      ) : null}
                      {sub.payload.socialLinks ? (
                        <Detail label="Social links" value={sub.payload.socialLinks} />
                      ) : null}
                    </div>
                    <p className="text-zinc-500">
                      {sub.logo_urls.length} logo(s) · {sub.image_urls.length} image(s)
                    </p>
                    {(sub.logo_urls.length > 0 || sub.image_urls.length > 0) && (
                      <div className="flex flex-wrap gap-2">
                        {[...sub.logo_urls, ...sub.image_urls].map((url) => (
                          <a
                            key={url}
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-violet-400 hover:text-violet-300 underline"
                          >
                            {url.split('/').pop()}
                          </a>
                        ))}
                      </div>
                    )}
                    {sub.invoice_id ? (
                      <p className="flex items-center gap-2 text-green-400">
                        <FileText className="h-4 w-4" />
                        Invoice sent
                      </p>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => void sendInvoice(sub.id)}
                        disabled={sendingId === sub.id}
                      >
                        {sendingId === sub.id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="mr-2 h-4 w-4" />
                        )}
                        Send Stripe invoice
                      </Button>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-zinc-500">
                    Waiting for client to complete onboarding at{' '}
                    <code className="text-violet-400">{path}</code>
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogClose onClick={() => setCreateOpen(false)} />
          <DialogHeader>
            <DialogTitle>New onboarding link</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => void handleCreate(e)} className="space-y-4">
            <div>
              <Label htmlFor="ob-biz">Business name</Label>
              <Input
                id="ob-biz"
                required
                value={createForm.businessName}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, businessName: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="ob-contact">Contact name (optional)</Label>
              <Input
                id="ob-contact"
                value={createForm.contactName}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, contactName: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="ob-email">Invoice email</Label>
              <Input
                id="ob-email"
                type="email"
                required
                value={createForm.email}
                onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="ob-web">Website (CAD)</Label>
                <Input
                  id="ob-web"
                  type="number"
                  min={0}
                  value={createForm.websiteAmount}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, websiteAmount: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="ob-gmb">GMB setup (CAD)</Label>
                <Input
                  id="ob-gmb"
                  type="number"
                  min={0}
                  value={createForm.gmbAmount}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, gmbAmount: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={creating}>
                {creating ? 'Creating…' : 'Create & copy link'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-zinc-500">{label}: </span>
      <span className="text-zinc-300">{value}</span>
    </div>
  )
}
