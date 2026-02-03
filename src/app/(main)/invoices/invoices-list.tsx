'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { SendInvoiceForm } from './send-invoice-form'
import { FileText } from 'lucide-react'

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

export function InvoicesList({ initialInvoices, clients }: InvoicesListProps) {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices)
  const [sendOpen, setSendOpen] = useState(false)

  function onInvoiceSent(newInvoice: Invoice) {
    setInvoices((prev) => [newInvoice, ...prev])
    setSendOpen(false)
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setSendOpen(true)}>
          <FileText className="mr-2 h-4 w-4" />
          Send invoice
        </Button>
      </div>

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
