'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Phone, X, PhoneCall, ChevronRight, Receipt, ExternalLink, ChevronLeft, Trash2, MessageCircle, PhoneForwarded, CircleDollarSign, UserX, CalendarCheck } from 'lucide-react'
import { SendInvoiceFromCall } from './send-invoice-from-call'

interface Lead {
  id: string
  name: string
  phone: string
  email: string | null
  niche: string | null
  website: string | null
  status: string
}

interface CallingScreenProps {
  leadLists: { id: string; name: string; niche: string | null }[]
  userId: string
}

export function CallingScreen({ leadLists, userId }: CallingScreenProps) {
  const [selectedList, setSelectedList] = useState<string>('')
  const [callingStarted, setCallingStarted] = useState(false)
  const [currentLead, setCurrentLead] = useState<Lead | null>(null)
  const [loading, setLoading] = useState(false)
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false)
  const [viewedLeadIds, setViewedLeadIds] = useState<string[]>([])
  const [leadHistory, setLeadHistory] = useState<Lead[]>([])

  async function loadNextLead() {
    if (!selectedList) return
    setLoading(true)
    const supabase = createClient()
    
    let query = supabase
      .from('leads')
      .select('*')
      .eq('list_id', selectedList)
      .in('status', ['new', 'no_answer', 'call_back'])
      .order('created_at')
    
    // Skip all leads that have been viewed in this session
    if (viewedLeadIds.length > 0) {
      query = query.not('id', 'in', `(${viewedLeadIds.join(',')})`)
    }
    
    const { data } = await query.limit(1).single()

    if (data) {
      if (currentLead) {
        setLeadHistory(prev => [...prev, currentLead])
      }
      setCurrentLead(data)
      setViewedLeadIds(prev => [...prev, data.id])
    } else {
      setCurrentLead(null)
    }
    setLoading(false)
  }

  function goToPreviousLead() {
    if (leadHistory.length === 0) return
    const previousLead = leadHistory[leadHistory.length - 1]
    setLeadHistory(prev => prev.slice(0, -1))
    if (currentLead) {
      setViewedLeadIds(prev => prev.filter(id => id !== currentLead.id))
    }
    setCurrentLead(previousLead)
  }

  async function deleteLead() {
    if (!currentLead) return
    if (!confirm('Are you sure you want to delete this lead?')) return
    
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('leads').delete().eq('id', currentLead.id)
    
    if (!error) {
      loadNextLead()
    } else {
      alert('Failed to delete lead')
      setLoading(false)
    }
  }

  function handleStartCalling() {
    setCallingStarted(true)
    setLeadHistory([])
    loadNextLead()
  }

  type CallOutcome = 'no_answer' | 'call_back' | 'no_price' | 'no_dont_want' | 'booked'

  async function handleOutcome(outcome: CallOutcome) {
    if (!currentLead) return
    const supabase = createClient()

    await supabase.from('call_logs').insert({
      lead_id: currentLead.id,
      cold_caller_id: userId,
      outcome,
    })

    const statusByOutcome: Record<CallOutcome, string> = {
      no_answer: 'no_answer',
      call_back: 'call_back',
      no_price: 'no_price',
      no_dont_want: 'no_dont_want',
      booked: 'booked',
    }

    await supabase.from('leads').update({ status: statusByOutcome[outcome] }).eq('id', currentLead.id)

    if (outcome === 'no_answer') {
      fetch('/api/webhooks/no-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: currentLead.id,
          phone: currentLead.phone,
          coldCallerId: userId,
          listId: selectedList,
        }),
      }).catch(err => console.error('Failed to send follow-up email:', err))
    }

    loadNextLead()
  }

  const listName = leadLists.find((l) => l.id === selectedList)?.name ?? ''

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/[0.06] bg-zinc-900/40 backdrop-blur-xl p-6">
        <Label htmlFor="list">Select Lead List</Label>
        <select
          id="list"
          value={selectedList}
          onChange={(e) => {
            setSelectedList(e.target.value)
            setCallingStarted(false)
            setCurrentLead(null)
            setViewedLeadIds([])
          }}
          className="mt-2 flex h-10 w-full max-w-md rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
        >
          <option value="">Choose a list...</option>
          {leadLists.map((list) => (
            <option key={list.id} value={list.id}>
              {list.name} {list.niche ? `(${list.niche})` : ''}
            </option>
          ))}
        </select>

        <div className="flex gap-3 mt-4">
          {selectedList && !callingStarted && (
            <Button
              size="lg"
              onClick={handleStartCalling}
            >
              <PhoneCall className="mr-2 h-5 w-5" />
              Start calling
            </Button>
          )}
        </div>
      </div>

      {callingStarted && (
        <>
          {loading ? (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-12 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
              <p className="mt-4 text-zinc-400">Loading next lead...</p>
            </div>
          ) : currentLead ? (
            <div className="rounded-2xl border border-white/[0.06] bg-zinc-900/40 backdrop-blur-xl p-8">
              <p className="text-sm text-zinc-500 mb-4">List: {listName}</p>
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-zinc-100">{currentLead.name}</h2>
                  {currentLead.niche && (
                    <p className="mt-1 text-sm text-zinc-500">Niche: {currentLead.niche}</p>
                  )}
                  {currentLead.email && (
                    <p className="mt-1 text-sm text-zinc-400">{currentLead.email}</p>
                  )}
                  {currentLead.website ? (
                    <a
                      href={currentLead.website.startsWith('http') ? currentLead.website : `https://${currentLead.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View Site
                    </a>
                  ) : (
                    <p className="mt-2 text-sm text-zinc-600">No site</p>
                  )}
                </div>

                <div className="flex flex-wrap justify-center gap-3">
                  <a
                    href={`tel:${currentLead.phone.replace(/\D/g, '')}`}
                    className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-8 py-4 text-xl font-semibold text-white hover:bg-green-500"
                  >
                    <Phone className="h-6 w-6" />
                    Call {currentLead.phone}
                  </a>
                  <a
                    href={`sms:${currentLead.phone.replace(/\D/g, '')}`}
                    className="inline-flex items-center gap-2 rounded-xl border border-zinc-600 bg-zinc-800 px-8 py-4 text-xl font-semibold text-zinc-100 hover:bg-zinc-700"
                  >
                    <MessageCircle className="h-6 w-6" />
                    Send text
                  </a>
                </div>
                <p className="text-center text-xs text-zinc-500">
                  Tap Call to open your dialer, or Send text to open messages. After the call, choose an outcome below.
                </p>

                <div className="flex flex-wrap justify-center gap-3 pt-4">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => handleOutcome('no_answer')}
                    disabled={loading}
                  >
                    <X className="mr-2 h-5 w-5" />
                    No answer
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => handleOutcome('call_back')}
                    disabled={loading}
                  >
                    <PhoneForwarded className="mr-2 h-5 w-5" />
                    Call back
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => handleOutcome('no_price')}
                    disabled={loading}
                  >
                    <CircleDollarSign className="mr-2 h-5 w-5" />
                    No (price)
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => handleOutcome('no_dont_want')}
                    disabled={loading}
                  >
                    <UserX className="mr-2 h-5 w-5" />
                    No (dont want)
                  </Button>
                  <Button
                    variant="default"
                    size="lg"
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => handleOutcome('booked')}
                    disabled={loading}
                  >
                    <CalendarCheck className="mr-2 h-5 w-5" />
                    Booked
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setIsInvoiceOpen(true)}
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700 text-white border-green-600"
                  >
                    <Receipt className="mr-2 h-5 w-5" />
                    Send Invoice
                  </Button>
                </div>

                <div className="flex justify-center gap-3 pt-6 border-t border-zinc-800">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToPreviousLead}
                    disabled={loading || leadHistory.length === 0}
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={loadNextLead}
                    disabled={loading}
                  >
                    Next call
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={deleteLead}
                    disabled={loading}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-white/[0.06] bg-zinc-900/40 backdrop-blur-xl p-8 text-center">
              <p className="text-zinc-400">No more leads in this list.</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setCallingStarted(false)}
              >
                Back to list
              </Button>
            </div>
          )}
        </>
      )}

      {isInvoiceOpen && currentLead && (
        <SendInvoiceFromCall
          lead={currentLead}
          onSuccess={() => {
            setIsInvoiceOpen(false)
            loadNextLead()
          }}
          onCancel={() => setIsInvoiceOpen(false)}
        />
      )}
    </div>
  )
}
