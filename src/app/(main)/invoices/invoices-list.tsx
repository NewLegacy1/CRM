'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { SendInvoiceForm } from './send-invoice-form'
import { FileText, Download, ExternalLink, Loader2 } from 'lucide-react'

interface Invoice {
  id: string
  client_id: string
  status: string
  currency: string
  amount_total: number
  due_date: string | null
  created_at: string
  stripe_invoice_id: string | null
  client?: { id: string; name: string; email: string | null }
}

interface InvoicesListProps {
  initialInvoices: Invoice[]
  clients: { id: string; name: string; email: string | null }[]
}

interface StripeInvoice {
  id: string
  number: string | null
  customerId: string
  customerName: string
  customerEmail: string | null
  amount: number
  currency: string
  status: string
  paid: boolean
  hosted_invoice_url: string | null
  invoice_pdf: string | null
  created: number
  dueDate: number | null
  paidAt: number | null
  description: string | null
  lineItems: Array<{
    description: string
    quantity: number
    amount: number
    currency: string
  }>
}

export function InvoicesList({ initialInvoices, clients }: InvoicesListProps) {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices)
  const [stripeInvoices, setStripeInvoices] = useState<StripeInvoice[]>([])
  const [showStripe, setShowStripe] = useState(false)
  const [loadingStripe, setLoadingStripe] = useState(false)
  const [stripeError, setStripeError] = useState<string | null>(null)
  const [sendOpen, setSendOpen] = useState(false)

  function onInvoiceSent(newInvoice: Invoice) {
    setInvoices((prev) => [newInvoice, ...prev])
    setSendOpen(false)
  }

  async function fetchStripeInvoices() {
    setLoadingStripe(true)
    setStripeError(null)
    try {
      const response = await fetch('/api/invoices/stripe')
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch Stripe invoices')
      }
      const data = await response.json()
      setStripeInvoices(data.invoices)
      setShowStripe(true)
    } catch (error: any) {
      setStripeError(error.message || 'Failed to load Stripe invoices')
      console.error('Error fetching Stripe invoices:', error)
    } finally {
      setLoadingStripe(false)
    }
  }

  function formatCurrency(amount: number, currency: string) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toLowerCase(),
      minimumFractionDigits: 2,
    }).format(amount / 100) // Stripe amounts are in cents
  }

  function getStatusColor(status: string, paid: boolean) {
    if (paid) return 'bg-green-500/10 text-green-500'
    if (status === 'open') return 'bg-blue-500/10 text-blue-500'
    if (status === 'draft') return 'bg-zinc-500/10 text-zinc-500'
    if (status === 'void') return 'bg-red-500/10 text-red-500'
    return 'bg-amber-500/10 text-amber-500'
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <Button
            variant={showStripe ? 'outline' : 'default'}
            onClick={() => setShowStripe(false)}
          >
            Local Invoices
          </Button>
          <Button
            variant={showStripe ? 'default' : 'outline'}
            onClick={fetchStripeInvoices}
            disabled={loadingStripe}
          >
            {loadingStripe ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <ExternalLink className="mr-2 h-4 w-4" />
                View Stripe Invoices
              </>
            )}
          </Button>
        </div>
        {!showStripe && (
          <Button onClick={() => setSendOpen(true)}>
            <FileText className="mr-2 h-4 w-4" />
            Send invoice
          </Button>
        )}
      </div>

      {stripeError && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 mb-4">
          <p className="text-sm text-red-400">{stripeError}</p>
        </div>
      )}

      {showStripe ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stripeInvoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-zinc-500 py-8">
                    {loadingStripe ? 'Loading invoices...' : 'No Stripe invoices found.'}
                  </TableCell>
                </TableRow>
              ) : (
                stripeInvoices.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-mono text-sm">
                      {inv.number || inv.id.slice(-8)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-zinc-100">{inv.customerName}</div>
                        {inv.customerEmail && (
                          <div className="text-xs text-zinc-500">{inv.customerEmail}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(inv.amount, inv.currency)}
                    </TableCell>
                    <TableCell>
                      {inv.dueDate
                        ? new Date(inv.dueDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : '—'}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium capitalize ${getStatusColor(inv.status, inv.paid)}`}>
                        {inv.paid ? 'Paid' : inv.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {inv.hosted_invoice_url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(inv.hosted_invoice_url!, '_blank')}
                            title="View invoice"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                        {inv.invoice_pdf && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(inv.invoice_pdf!, '_blank')}
                            title="Download PDF"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Due date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Stripe</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-zinc-500">
                    No invoices yet. Send one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                invoices.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-medium">{inv.client?.name ?? '—'}</TableCell>
                    <TableCell>
                      {inv.currency.toUpperCase()} {Number(inv.amount_total).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      {inv.due_date
                        ? new Date(inv.due_date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'numeric',
                            day: 'numeric',
                          })
                        : '—'}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-amber-500/10 text-amber-500 capitalize">
                        {inv.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-zinc-500 text-sm">
                      {inv.stripe_invoice_id ? 'Sent' : '—'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={sendOpen} onOpenChange={setSendOpen}>
        <DialogContent className="max-w-lg">
          <DialogClose onClick={() => setSendOpen(false)} />
          <DialogHeader>
            <DialogTitle>Send invoice</DialogTitle>
          </DialogHeader>
          <SendInvoiceForm clients={clients} onSuccess={onInvoiceSent} onCancel={() => setSendOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  )
}
