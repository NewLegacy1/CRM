'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
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
import {
  formatOnboardingTotal,
  isPendingContractReview,
  type ProjectOnboardingLink,
} from '@/lib/onboarding/project-onboarding'
import { Copy, ExternalLink, FileText, Loader2, Plus, RefreshCw, Send } from 'lucide-react'

type Props = {
  projectId: string
  projectName: string
  clientId?: string | null
  clientName?: string | null
  clientEmail?: string | null
  clientCompany?: string | null
  initialLinks: ProjectOnboardingLink[]
}

function buildDefaultCreateForm(props: Pick<Props, 'projectName' | 'clientName' | 'clientEmail' | 'clientCompany'>) {
  return {
    businessName: props.clientCompany?.trim() || props.projectName.trim(),
    contactName: props.clientName?.trim() || '',
    email: props.clientEmail?.trim() || '',
    websiteAmount: '1200',
    gmbAmount: '500',
  }
}

function linksSnapshot(links: ProjectOnboardingLink[]): string {
  return JSON.stringify(
    links.map((l) => ({
      id: l.id,
      status: l.status,
      token: l.token,
      subId: l.submission?.id ?? null,
      invoiceId: l.submission?.invoice_id ?? null,
      submittedAt: l.submission?.submitted_at ?? null,
    }))
  )
}

const POLL_MS = 5000

export function ProjectContractsPanel({
  projectId,
  projectName,
  clientId,
  clientName,
  clientEmail,
  clientCompany,
  initialLinks,
}: Props) {
  const router = useRouter()
  const [links, setLinks] = useState(initialLinks)
  const linksRef = useRef(links)
  const [sendingId, setSendingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copiedToken, setCopiedToken] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createForm, setCreateForm] = useState(() =>
    buildDefaultCreateForm({ projectName, clientName, clientEmail, clientCompany })
  )

  useEffect(() => {
    setLinks(initialLinks)
  }, [initialLinks])

  useEffect(() => {
    linksRef.current = links
  }, [links])

  const pollLinks = useCallback(async () => {
    if (document.hidden) return
    try {
      const res = await fetch(`/api/projects/${projectId}/onboarding-links`, {
        cache: 'no-store',
      })
      if (!res.ok) return
      const data = (await res.json()) as { links?: ProjectOnboardingLink[] }
      const next = data.links ?? []
      if (linksSnapshot(next) === linksSnapshot(linksRef.current)) return
      setLinks(next)
      router.refresh()
    } catch {
      /* ignore transient network errors */
    }
  }, [projectId, router])

  useEffect(() => {
    void pollLinks()
    const interval = window.setInterval(() => void pollLinks(), POLL_MS)
    const onVisible = () => {
      if (!document.hidden) void pollLinks()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [pollLinks])

  useEffect(() => {
    if (createOpen) {
      setCreateForm(buildDefaultCreateForm({ projectName, clientName, clientEmail, clientCompany }))
    }
  }, [createOpen, projectName, clientName, clientEmail, clientCompany])

  const pending = links.filter(isPendingContractReview)

  async function refreshLinks() {
    setRefreshing(true)
    setError(null)
    try {
      await pollLinks()
      router.refresh()
    } finally {
      setRefreshing(false)
    }
  }

  async function copyLink(token: string) {
    const url = `${window.location.origin}/start/${token}`
    await navigator.clipboard.writeText(url)
    setCopiedToken(token)
    setTimeout(() => setCopiedToken(null), 2000)
  }

  async function sendInvoice(submissionId: string) {
    const link = links.find((l) => l.submission?.id === submissionId)
    if (!link) return
    const total = formatOnboardingTotal(link.line_items, link.currency)
    if (
      !confirm(
        `Send Stripe invoice to ${link.email} for ${total}?\n\n` +
          link.line_items.map((r) => `• ${r.description}`).join('\n')
      )
    ) {
      return
    }

    setSendingId(submissionId)
    setError(null)
    try {
      const res = await fetch(`/api/onboarding/submissions/${submissionId}/send-invoice`, {
        method: 'POST',
      })
      const data = (await res.json()) as {
        error?: string
        invoice?: { id: string }
      }
      if (!res.ok) throw new Error(data.error ?? 'Failed to send invoice')

      setLinks((prev) =>
        prev.map((l) =>
          l.submission?.id === submissionId
            ? {
                ...l,
                status: 'invoiced',
                submission: l.submission
                  ? {
                      ...l.submission,
                      invoice_id: data.invoice?.id ?? 'sent',
                    }
                  : null,
              }
            : l
        )
      )
      router.refresh()
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
          projectId,
          clientId: clientId ?? undefined,
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
      const data = (await res.json()) as {
        error?: string
        link?: {
          id: string
          token: string
          business_name: string
          email: string
          status: string
          created_at: string
        }
      }
      if (!res.ok) throw new Error(data.error ?? 'Failed to create link')

      setCreateOpen(false)
      router.refresh()

      if (data.link?.token) {
        await copyLink(data.link.token)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create link')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm text-zinc-500">
            Links created here are tied to this project. When the client submits, it appears on the
            same card below with a &ldquo;New submission&rdquo; badge.
          </p>
          <p className="flex items-center gap-2 text-xs text-zinc-600">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
            </span>
            Auto-updating every few seconds — no need to refresh manually
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => void refreshLinks()} disabled={refreshing}>
            {refreshing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Refresh
          </Button>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New onboarding link
          </Button>
        </div>
      </div>

      {pending.length > 0 && (
        <div className="rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-4">
          <p className="font-medium text-violet-200">
            New contract submission{pending.length > 1 ? 's' : ''} — review and send invoice
          </p>
          <p className="mt-1 text-sm text-violet-300/80">
            {pending.length} submission{pending.length > 1 ? 's' : ''} waiting for invoice. Amounts
            match the signed agreement line items below.
          </p>
        </div>
      )}

      {error ? (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      ) : null}

      {links.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 text-center text-zinc-500">
          <FileText className="mx-auto mb-3 h-8 w-8 text-zinc-600" />
          <p>No onboarding links for this project yet.</p>
          <p className="mt-2 text-sm">Create one to send the client their intake form.</p>
          <Button className="mt-4" size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New onboarding link
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {links.map((link) => {
            const sub = link.submission
            const needsInvoice = isPendingContractReview(link)
            const clientPath = `/start/${link.token}`

            return (
              <div
                key={link.id}
                className={`rounded-xl border p-5 space-y-4 ${
                  needsInvoice
                    ? 'border-violet-500/40 bg-violet-500/5 ring-1 ring-violet-500/20'
                    : 'border-zinc-800 bg-zinc-900/50'
                }`}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-zinc-100">{link.business_name}</h3>
                      {needsInvoice ? (
                        <span className="inline-flex items-center rounded-full bg-violet-500/20 px-2 py-0.5 text-xs font-medium text-violet-300">
                          New submission
                        </span>
                      ) : null}
                      <span className="inline-flex items-center rounded-full bg-zinc-800 px-2 py-0.5 text-xs capitalize text-zinc-400">
                        {link.status}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-500">{link.email}</p>
                    <p className="mt-1 text-sm font-medium text-violet-400">
                      Contract total: {formatOnboardingTotal(link.line_items, link.currency)}
                    </p>
                    <ul className="mt-2 space-y-1 text-xs text-zinc-500">
                      {link.line_items.map((item) => (
                        <li key={item.description}>
                          • {item.description} —{' '}
                          {formatOnboardingTotal([item], link.currency)}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => void copyLink(link.token)}>
                      <Copy className="mr-2 h-4 w-4" />
                      {copiedToken === link.token ? 'Copied!' : 'Copy link'}
                    </Button>
                    <a
                      href={`/start/${link.token}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-8 items-center justify-center rounded-lg border border-zinc-700 bg-transparent px-3 text-sm text-zinc-100 hover:bg-zinc-800"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Open form
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

                    {needsInvoice ? (
                      <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-3">
                        <p className="text-sm text-amber-200">
                          Ready to invoice — send{' '}
                          {formatOnboardingTotal(link.line_items, link.currency)} to {link.email}
                        </p>
                        <Button
                          className="mt-3"
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
                      </div>
                    ) : sub.invoice_id ? (
                      <p className="flex items-center gap-2 text-green-400">
                        <FileText className="h-4 w-4" />
                        Invoice sent
                      </p>
                    ) : null}
                  </div>
                ) : (
                  <div className="rounded-lg border border-zinc-800 bg-zinc-950/40 px-4 py-3 text-sm text-zinc-500">
                    <p>
                      Waiting for client to complete onboarding. Their answers will show up here on
                      this same card once submitted.
                    </p>
                    <p className="mt-2 break-all">
                      Client link:{' '}
                      <code className="text-violet-400">{clientPath}</code>
                      <span className="text-zinc-600"> (use Copy link for full URL)</span>
                    </p>
                  </div>
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
            <DialogTitle>New onboarding link for {projectName}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-zinc-500">
            This link will appear on this project&apos;s Contracts tab automatically.
          </p>
          <form onSubmit={(e) => void handleCreate(e)} className="space-y-4">
            <div>
              <Label htmlFor="pc-biz">Business name</Label>
              <Input
                id="pc-biz"
                required
                value={createForm.businessName}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, businessName: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="pc-contact">Contact name (optional)</Label>
              <Input
                id="pc-contact"
                value={createForm.contactName}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, contactName: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="pc-email">Invoice email</Label>
              <Input
                id="pc-email"
                type="email"
                required
                value={createForm.email}
                onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="pc-web">Website (CAD)</Label>
                <Input
                  id="pc-web"
                  type="number"
                  min={0}
                  value={createForm.websiteAmount}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, websiteAmount: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="pc-gmb">GMB setup (CAD)</Label>
                <Input
                  id="pc-gmb"
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
