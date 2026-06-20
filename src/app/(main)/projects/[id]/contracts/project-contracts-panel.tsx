'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  formatOnboardingTotal,
  isPendingContractReview,
  type ProjectOnboardingLink,
} from '@/lib/onboarding/project-onboarding'
import { Copy, ExternalLink, FileText, Loader2, Send } from 'lucide-react'

type Props = {
  projectId: string
  initialLinks: ProjectOnboardingLink[]
}

export function ProjectContractsPanel({ projectId, initialLinks }: Props) {
  const [links, setLinks] = useState(initialLinks)
  const [sendingId, setSendingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copiedToken, setCopiedToken] = useState<string | null>(null)

  const pending = links.filter(isPendingContractReview)

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
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to send invoice')
    } finally {
      setSendingId(null)
    }
  }

  return (
    <div className="space-y-6">
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
          <p className="mt-2 text-sm">
            Create one from{' '}
            <Link href="/onboarding" className="text-violet-400 hover:text-violet-300">
              Client onboarding
            </Link>{' '}
            and attach this project.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {links.map((link) => {
            const sub = link.submission
            const needsInvoice = isPendingContractReview(link)
            const path = `/start/${link.token}`

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
                      href={path}
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
