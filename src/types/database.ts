export type UserRole = 'pending' | 'owner' | 'account_manager' | 'closer' | 'media_buyer' | 'cold_caller' | 'demo'

export interface Profile {
  id: string
  role: UserRole
  display_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Client {
  id: string
  name: string
  email: string | null
  phone: string | null
  company: string | null
  notes: string | null
  created_by: string
  created_at: string
}

export interface Project {
  id: string
  client_id: string
  name: string
  status: string
  milestones: Record<string, unknown> | null
  owner_id: string | null
  created_at: string
}

export interface Lead {
  id: string
  client_id: string | null
  name: string
  email: string | null
  phone: string
  niche: string | null
  city: string | null
  website: string | null
  list_id: string | null
  status: 'new' | 'called' | 'no_answer' | 'didnt_book' | 'booked' | 'called_no_answer' | 'answered_declined_demo' | 'answered_accepted_demo'
  cold_caller_id: string | null
  source: string | null
  created_at: string
}

export interface LeadList {
  id: string
  name: string
  niche: string | null
  total_count: number
  assigned_cold_callers: string[]
  created_at: string
}

export interface Deal {
  id: string
  client_id: string
  lead_id: string | null
  name: string
  value: number
  stage: string
  closer_id: string | null
  created_at: string
  updated_at: string
}

export interface Meeting {
  id: string
  lead_id: string | null
  client_id: string | null
  scheduled_at: string
  booked_by: string
  closer_id: string | null
  source: string
  notes: string | null
  created_at: string
}

export interface InvoiceLineItem {
  description: string
  quantity: number
  unit_amount: number
  amount: number
}

export interface Invoice {
  id: string
  client_id: string
  created_by: string
  stripe_invoice_id: string | null
  stripe_customer_id: string | null
  status: 'draft' | 'pending' | 'sent' | 'paid' | 'void'
  currency: string
  amount_total: number
  amount_due: number | null
  due_date: string | null
  line_items: InvoiceLineItem[]
  memo: string | null
  footer: string | null
  sent_at: string | null
  paid_at: string | null
  created_at: string
  updated_at: string
}
