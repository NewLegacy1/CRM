'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog'
import { Phone, X, Calendar, PhoneCall, ChevronRight, Receipt, ExternalLink } from 'lucide-react'
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
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false)
  const [clients, setClients] = useState<{ id: string; name: string; email: string | null }[]>([])
  const [viewedLeadIds, setViewedLeadIds] = useState<string[]>([])
  const [bookingData, setBookingData] = useState({
    date: '',
    time: '',
    notes: '',
  })

  async function loadNextLead() {
    if (!selectedList) return
    setLoading(true)
    const supabase = createClient()
    
    let query = supabase
      .from('leads')
      .select('*')
      .eq('list_id', selectedList)
      .in('status', ['new', 'no_answer'])
      .order('created_at')
    
    // Skip all leads that have been viewed in this session
    if (viewedLeadIds.length > 0) {
      query = query.not('id', 'in', `(${viewedLeadIds.join(',')})`)
    }
    
    const { data } = await query.limit(1).single()

    if (data) {
      setCurrentLead(data)
      setViewedLeadIds(prev => [...prev, data.id])
    } else {
      setCurrentLead(null)
    }
    setLoading(false)
  }

  function handleStartCalling() {
    setCallingStarted(true)
    loadNextLead()
    loadClients()
  }

  async function loadClients() {
    const supabase = createClient()
    const { data } = await supabase.from('clients').select('id, name, email').order('name')
    if (data) {
      setClients(data)
    }
  }

  async function handleOutcome(outcome: 'no_answer' | 'didnt_book' | 'booked') {
    if (!currentLead) return
    const supabase = createClient()

    await supabase.from('call_logs').insert({
      lead_id: currentLead.id,
      cold_caller_id: userId,
      outcome,
    })

    if (outcome === 'no_answer') {
      await supabase.from('leads').update({ status: 'no_answer' }).eq('id', currentLead.id)
      
      // Send follow-up email - don't await, let it happen in background
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
      
      // Immediately load next lead
      loadNextLead()
    } else if (outcome === 'didnt_book') {
      await supabase.from('leads').update({ status: 'didnt_book' }).eq('id', currentLead.id)
      
      // Immediately load next lead
      loadNextLead()
    } else if (outcome === 'booked') {
      setIsBookingOpen(true)
    }
  }

  async function handleBookMeeting(e: React.FormEvent) {
    e.preventDefault()
    if (!currentLead) return
    const supabase = createClient()

    const scheduledAt = `${bookingData.date}T${bookingData.time}:00`

    // Generate Calendly booking link (Calendly API doesn't support direct event creation)
    let calendlyBookingLink: string | null = null
    try {
      const calendlyRes = await fetch('/api/calendly/create-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inviteeName: currentLead.name,
          inviteeEmail: currentLead.email || `${currentLead.name.replace(/\s+/g, '.').toLowerCase()}@example.com`,
          startTime: scheduledAt,
          notes: bookingData.notes || `Cold call booking for ${currentLead.name}`,
        }),
      })

      const calendlyData = await calendlyRes.json()
      if (calendlyRes.ok && calendlyData.bookingLink) {
        calendlyBookingLink = calendlyData.bookingLink
        // Open the booking link in a new tab for the user to complete
        if (calendlyBookingLink) {
          window.open(calendlyBookingLink, '_blank')
        }
      }
    } catch (err) {
      console.error('Failed to generate Calendly booking link:', err)
    }

    // Also save to CRM database
    const { data: meeting, error: meetingErr } = await supabase
      .from('meetings')
      .insert({
        lead_id: currentLead.id,
        scheduled_at: scheduledAt,
        booked_by: userId,
        source: 'cold_call',
        notes: bookingData.notes,
      })
      .select('id')
      .single()

    if (meetingErr || !meeting) {
      alert('Failed to save meeting to CRM')
      return
    }

    await supabase.from('leads').update({ status: 'booked' }).eq('id', currentLead.id)

    const leadWithClient = currentLead as { client_id?: string | null }
    await supabase.from('deals').insert({
      lead_id: currentLead.id,
      client_id: leadWithClient.client_id || null,
      meeting_id: meeting.id,
      name: `Deal: ${currentLead.name}`,
      value: 0,
      stage: 'qualification',
      closer_id: null,
    })

    await fetch('/api/webhooks/meeting-booked', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        leadId: currentLead.id,
        meetingId: meeting.id,
        meetingTime: scheduledAt,
        coldCallerId: userId,
      }),
    })

    setIsBookingOpen(false)
    setBookingData({ date: '', time: '', notes: '' })
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
          className="mt-2 flex h-10 w-full max-w-md rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
        >
          <option value="">Choose a list...</option>
          {leadLists.map((list) => (
            <option key={list.id} value={list.id}>
              {list.name} {list.niche ? `(${list.niche})` : ''}
            </option>
          ))}
        </select>

        {selectedList && !callingStarted && (
          <Button
            className="mt-4"
            size="lg"
            onClick={handleStartCalling}
          >
            <PhoneCall className="mr-2 h-5 w-5" />
            Start calling
          </Button>
        )}
      </div>

      {callingStarted && (
        <>
          {loading ? (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-12 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
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

                <div className="flex justify-center">
                  <a
                    href={`tel:${currentLead.phone.replace(/\D/g, '')}`}
                    className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-8 py-4 text-xl font-semibold text-white hover:bg-green-500"
                  >
                    <Phone className="h-6 w-6" />
                    Call {currentLead.phone}
                  </a>
                </div>
                <p className="text-center text-xs text-zinc-500">
                  Tap to open your phone dialer and call. After the call, choose an outcome below.
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
                    onClick={() => handleOutcome('didnt_book')}
                    disabled={loading}
                  >
                    <X className="mr-2 h-5 w-5" />
                    Didn&apos;t book
                  </Button>
                  <Button
                    size="lg"
                    onClick={() => handleOutcome('booked')}
                    disabled={loading}
                  >
                    <Calendar className="mr-2 h-5 w-5" />
                    Book meeting
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => {
                      setIsInvoiceOpen(true)
                      loadClients()
                    }}
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700 text-white border-green-600"
                  >
                    <Receipt className="mr-2 h-5 w-5" />
                    Send Invoice
                  </Button>
                </div>

                <div className="flex justify-center pt-6 border-t border-zinc-800">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={loadNextLead}
                    disabled={loading}
                  >
                    Next call
                    <ChevronRight className="ml-2 h-5 w-5" />
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

      <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <DialogContent>
          <DialogClose onClick={() => setIsBookingOpen(false)} />
          <DialogHeader>
            <DialogTitle>Book meeting</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleBookMeeting} className="space-y-4">
            <div>
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={bookingData.date}
                onChange={(e) =>
                  setBookingData((prev) => ({ ...prev, date: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="time">Time *</Label>
              <Input
                id="time"
                type="time"
                value={bookingData.time}
                onChange={(e) =>
                  setBookingData((prev) => ({ ...prev, time: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={bookingData.notes}
                onChange={(e) =>
                  setBookingData((prev) => ({ ...prev, notes: e.target.value }))
                }
                placeholder="Any notes about the meeting..."
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsBookingOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Book meeting</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

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
