'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog'
import { Plus, Trash2, Calendar, ChevronRight } from 'lucide-react'

interface LineItem {
  description: string
  quantity: number
  unit_amount: number
  amount: number
  isMonthly?: boolean
}

interface Client {
  id: string
  name: string
  email: string | null
}

interface SendInvoiceFromCallProps {
  lead: { id: string; name: string; phone: string; email: string | null; niche: string | null }
  onSuccess: () => void
  onCancel: () => void
}

export function SendInvoiceFromCall({ lead, onSuccess, onCancel }: SendInvoiceFromCallProps) {
  const [step, setStep] = useState<'client' | 'invoice'>('client')
  const [clients, setClients] = useState<Client[]>([])
  const [clientId, setClientId] = useState('')
  const [newClient, setNewClient] = useState({
    name: lead.name,
    email: lead.email || '',
    phone: lead.phone,
    company: '',
    notes: '',
  })
  const [creatingClient, setCreatingClient] = useState(false)
  const [currency, setCurrency] = useState('usd')
  const [dueDate, setDueDate] = useState('')
  const [memo, setMemo] = useState('')
  const [footer, setFooter] = useState('')
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: '', quantity: 1, unit_amount: 0, amount: 0, isMonthly: false },
  ])
  const [sendingInvoice, setSendingInvoice] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadClients() {
      const supabase = createClient()
      const { data } = await supabase.from('clients').select('id, name, email').order('name')
      if (data) {
        setClients(data)
      }
    }
    loadClients()
  }, [])

  function updateLineItem(index: number, field: keyof LineItem, value: string | number) {
    const next = lineItems.map((item, i) => {
      if (i !== index) return item
      const updated = { ...item, [field]: value }
      if (field === 'quantity' || field === 'unit_amount') {
        updated.amount = Number(updated.quantity) * Number(updated.unit_amount)
      }
      return updated
    })
    setLineItems(next)
  }

  function addLine() {
    setLineItems((prev) => [...prev, { description: '', quantity: 1, unit_amount: 0, amount: 0, isMonthly: false }])
  }

  function removeLine(index: number) {
    setLineItems((prev) => prev.filter((_, i) => i !== index))
  }

  const total = lineItems.reduce((sum, item) => sum + (item.quantity * item.unit_amount), 0)

  async function handleCreateClient(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!newClient.name.trim()) {
      setError('Client name is required')
      return
    }
    setCreatingClient(true)
    const supabase = createClient()
    const { data, error: clientError } = await supabase
      .from('clients')
      .insert([{
        name: newClient.name.trim(),
        email: newClient.email.trim() || null,
        phone: newClient.phone.trim() || null,
        company: newClient.company.trim() || null,
        notes: newClient.notes.trim() || null,
      }])
      .select('id, name, email')
      .single()

    if (clientError || !data) {
      setError(clientError?.message || 'Failed to create client')
      setCreatingClient(false)
      return
    }

    // Link lead to client
    await supabase.from('leads').update({ client_id: data.id }).eq('id', lead.id)

    setClientId(data.id)
    setClients((prev) => [data, ...prev])
    setStep('invoice')
    setCreatingClient(false)
  }

  async function handleSendInvoice(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!clientId) {
      setError('Select or create a client')
      return
    }
    const items = lineItems.filter((row) => row.description.trim() && row.unit_amount >= 0)
    if (items.length === 0) {
      setError('Add at least one line item with description and amount')
      return
    }
    setSendingInvoice(true)
    const payload = {
      clientId,
      currency,
      dueDate: dueDate || null,
      memo: memo.trim() || null,
      footer: footer.trim() || null,
      lineItems: items.map((row) => ({
        description: row.description.trim(),
        quantity: row.quantity,
        unit_amount: row.unit_amount,
        amount: row.quantity * row.unit_amount,
        isMonthly: row.isMonthly || false,
      })),
    }
    try {
      const res = await fetch('/api/invoices/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to send invoice')
        setSendingInvoice(false)
        return
      }

      // Update lead status to booked and link to client
      const supabase = createClient()
      await supabase.from('leads').update({ 
        status: 'booked',
        client_id: clientId 
      }).eq('id', lead.id)

      // Create call log
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('call_logs').insert({
          lead_id: lead.id,
          cold_caller_id: user.id,
          outcome: 'booked',
        })
      }

      onSuccess()
    } catch {
      setError('Network error')
      setSendingInvoice(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogClose onClick={onCancel} />
        <DialogHeader>
          <DialogTitle>
            {step === 'client' ? 'Create Client & Send Invoice' : 'Send Invoice'}
          </DialogTitle>
        </DialogHeader>

        {step === 'client' ? (
          <form onSubmit={handleCreateClient} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</div>
            )}

            <div>
              <Label>Select Existing Client or Create New</Label>
              <select
                value={clientId}
                onChange={async (e) => {
                  const selectedId = e.target.value
                  setClientId(selectedId)
                  if (selectedId) {
                    // Link lead to selected client
                    const supabase = createClient()
                    await supabase.from('leads').update({ client_id: selectedId }).eq('id', lead.id)
                    setStep('invoice')
                  }
                }}
                className="mt-1 flex h-10 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100"
              >
                <option value="">Create new client</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} {c.email ? `(${c.email})` : ''}</option>
                ))}
              </select>
            </div>

            {!clientId && (
              <>
                <div className="pt-2 border-t border-zinc-800">
                  <Label className="text-sm text-zinc-400">New Client Details</Label>
                </div>
                <div>
                  <Label htmlFor="client_name">Client Name *</Label>
                  <Input
                    id="client_name"
                    value={newClient.name}
                    onChange={(e) => setNewClient((prev) => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
              </>
            )}
                {!clientId && (
                  <>
                    <div>
                      <Label htmlFor="client_email">Email</Label>
                      <Input
                        id="client_email"
                        type="email"
                        value={newClient.email}
                        onChange={(e) => setNewClient((prev) => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="client_phone">Phone</Label>
                      <Input
                        id="client_phone"
                        value={newClient.phone}
                        onChange={(e) => setNewClient((prev) => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="client_company">Company</Label>
                      <Input
                        id="client_company"
                        value={newClient.company}
                        onChange={(e) => setNewClient((prev) => ({ ...prev, company: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="client_notes">Notes</Label>
                      <Textarea
                        id="client_notes"
                        value={newClient.notes}
                        onChange={(e) => setNewClient((prev) => ({ ...prev, notes: e.target.value }))}
                        placeholder="Any notes about this client..."
                      />
                    </div>
                  </>
                )}
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              {!clientId && (
                <Button type="submit" disabled={creatingClient}>
                  {creatingClient ? 'Creating...' : 'Continue to Invoice'}
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              )}
              {clientId && (
                <Button type="button" onClick={() => setStep('invoice')}>
                  Continue to Invoice
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </form>
        ) : (
          <form onSubmit={handleSendInvoice} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</div>
            )}

            <div>
              <Label>Client</Label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="mt-1 flex h-10 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100"
                required
              >
                <option value="">Select client</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} {c.email ? `(${c.email})` : ''}</option>
                ))}
              </select>
            </div>

            <div>
              <Label>Line items *</Label>
              <div className="mt-2 space-y-2">
                {lineItems.map((row, i) => (
                  <div key={i} className="flex flex-wrap items-center gap-2 rounded-lg border border-zinc-700 p-2">
                    <Input
                      placeholder="Description"
                      value={row.description}
                      onChange={(e) => updateLineItem(i, 'description', e.target.value)}
                      className="flex-1 min-w-[120px]"
                    />
                    <Input
                      type="number"
                      min={1}
                      placeholder="Qty"
                      value={row.quantity || ''}
                      onChange={(e) => updateLineItem(i, 'quantity', parseInt(e.target.value, 10) || 0)}
                      className="w-16"
                    />
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      placeholder="Unit $"
                      value={row.unit_amount || ''}
                      onChange={(e) => updateLineItem(i, 'unit_amount', parseFloat(e.target.value) || 0)}
                      className="w-24"
                    />
                    <span className="text-zinc-400 text-sm w-14">= {(row.quantity * row.unit_amount).toFixed(2)}</span>
                    <Button
                      type="button"
                      variant={row.isMonthly ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateLineItem(i, 'isMonthly', !row.isMonthly)}
                      className={row.isMonthly ? "bg-green-600 hover:bg-green-700" : ""}
                      title={row.isMonthly ? "Monthly recurring - click to remove" : "Click to make monthly recurring"}
                    >
                      <Calendar className="h-4 w-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeLine(i)}>
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addLine}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add line
                </Button>
              </div>
            </div>

            <div className="flex justify-between text-sm font-medium text-zinc-300">
              <span>Total</span>
              <span>{currency.toUpperCase()} {total.toFixed(2)}</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="currency">Currency</Label>
                <select
                  id="currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="mt-1 flex h-10 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100"
                >
                  <option value="usd">USD</option>
                  <option value="cad">CAD</option>
                  <option value="eur">EUR</option>
                  <option value="gbp">GBP</option>
                </select>
              </div>
              <div>
                <Label htmlFor="dueDate">Due date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="memo">Memo (customer-facing)</Label>
              <Textarea
                id="memo"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="e.g. Payment terms: Net 30"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="footer">Footer (optional)</Label>
              <Input
                id="footer"
                value={footer}
                onChange={(e) => setFooter(e.target.value)}
                placeholder="e.g. Thank you for your business"
                className="mt-1"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setStep('client')}>
                Back
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={sendingInvoice}>
                {sendingInvoice ? 'Sending...' : 'Send invoice'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
