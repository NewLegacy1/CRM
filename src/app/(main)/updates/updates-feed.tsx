'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  Users, 
  FolderKanban, 
  HandCoins, 
  UserPlus, 
  FileText, 
  Calendar,
  Megaphone,
  GitBranch,
  Globe,
  CheckCircle2,
  XCircle,
  PhoneOff,
  Phone,
  Clock
} from 'lucide-react'

interface Activity {
  id: string
  entity_type: string
  entity_id: string
  action: string
  user_id: string | null
  user_name: string | null
  details: Record<string, unknown>
  created_at: string
}

interface UpdatesFeedProps {
  initialActivities: Activity[]
}

const ENTITY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  client: Users,
  project: FolderKanban,
  deal: HandCoins,
  lead: UserPlus,
  invoice: FileText,
  meeting: Calendar,
  ad: Megaphone,
  funnel: GitBranch,
  site: Globe,
}

const ACTION_COLORS: Record<string, string> = {
  created: 'bg-green-500/10 text-green-500 border-green-500/20',
  updated: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  deleted: 'bg-red-500/10 text-red-500 border-red-500/20',
  status_changed: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
}

function getActionLabel(action: string, details: Record<string, unknown>): string {
  if (action === 'status_changed') {
    if ('old_stage' in details) {
      const oldStage = String(details.old_stage || '')
      const newStage = String(details.new_stage || '')
      return `Stage changed: ${oldStage.replace('_', ' ')} → ${newStage.replace('_', ' ')}`
    }
    if ('old_status' in details && 'new_status' in details) {
      const oldStatus = String(details.old_status || '')
      const newStatus = String(details.new_status || '')
      return `Status changed: ${oldStatus.replace('_', ' ')} → ${newStatus.replace('_', ' ')}`
    }
    return 'Status changed'
  }
  return action.charAt(0).toUpperCase() + action.slice(1)
}

function getEntityLabel(entityType: string, details: Record<string, unknown>): string {
  const name = String(details.name || '')
  if (name) return name
  
  switch (entityType) {
    case 'client':
      return String(details.email || 'Client')
    case 'lead':
      return String(details.phone || 'Lead')
    case 'invoice':
      const amount = details.amount ? Number(details.amount) : null
      return `Invoice (${amount ? `$${amount.toLocaleString()}` : 'N/A'})`
    case 'meeting':
      return 'Meeting'
    default:
      return entityType.charAt(0).toUpperCase() + entityType.slice(1)
  }
}

function getStatusIcon(action: string, details: Record<string, unknown>): React.ComponentType<{ className?: string }> {
  if (action === 'status_changed') {
    const newStatus = String(details.new_status || details.new_stage || '')
    if (newStatus === 'booked' || newStatus === 'closed_won') {
      return CheckCircle2
    }
    if (newStatus === 'no_answer' || newStatus === 'closed_lost') {
      return XCircle
    }
    if (newStatus === 'didnt_book') {
      return PhoneOff
    }
  }
  if (action === 'created') {
    return CheckCircle2
  }
  return Clock
}

export function UpdatesFeed({ initialActivities }: UpdatesFeedProps) {
  const [activities, setActivities] = useState<Activity[]>(initialActivities)

  useEffect(() => {
    async function refreshActivities() {
      const supabase = createClient()
      const { data } = await supabase
        .from('activity_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500)
      
      if (data) {
        setActivities(data)
      }
    }

    function handleRefresh() {
      refreshActivities()
    }
    
    // Refresh every 30 seconds
    const interval = setInterval(refreshActivities, 30000)
    
    // Listen for custom refresh events
    window.addEventListener('activity-refresh', handleRefresh)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('activity-refresh', handleRefresh)
    }
  }, [])

  function formatTimeAgo(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined })
  }

  function getEntityLink(entityType: string, entityId: string): string | null {
    const routes: Record<string, string> = {
      client: '/clients',
      project: '/projects',
      deal: '/deals',
      lead: '/leads',
      invoice: '/invoices',
      meeting: '/meetings',
      ad: '/ads',
      funnel: '/funnels',
      site: '/sites',
    }
    return routes[entityType] || null
  }

  return (
    <div className="space-y-4">
      {activities.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 text-center">
          <p className="text-zinc-500">No activity yet. Activities will appear here as your team makes changes.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => {
            const EntityIcon = ENTITY_ICONS[activity.entity_type] || Clock
            const StatusIcon = getStatusIcon(activity.action, activity.details)
            const actionColor = ACTION_COLORS[activity.action] || 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'
            const entityLabel = getEntityLabel(activity.entity_type, activity.details)
            const actionLabel = getActionLabel(activity.action, activity.details)
            const link = getEntityLink(activity.entity_type, activity.entity_id)

            return (
              <div
                key={activity.id}
                className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 hover:bg-zinc-900/70 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className={`rounded-lg p-2 ${actionColor}`}>
                    <EntityIcon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-zinc-100">
                            {activity.user_name || 'Unknown user'}
                          </span>
                          <span className="text-zinc-500">•</span>
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border ${actionColor}`}>
                            {actionLabel}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-zinc-300">{entityLabel}</span>
                          {activity.entity_type ? (
                            <span className="text-xs text-zinc-500 capitalize">
                              ({activity.entity_type})
                            </span>
                          ) : null}
                        </div>
                        {activity.action === 'status_changed' && activity.details.outcome ? (
                          <div className="mt-2 flex items-center gap-2 text-sm text-zinc-400">
                            <StatusIcon className="h-4 w-4" />
                            <span>Outcome: {String(activity.details.outcome || '').replace('_', ' ')}</span>
                          </div>
                        ) : null}
                        {activity.details.value != null ? (
                          <div className="mt-1 text-sm text-zinc-400">
                            Value: ${Number(activity.details.value || 0).toLocaleString()}
                          </div>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-zinc-500">
                        <span>{formatTimeAgo(activity.created_at)}</span>
                        {link ? (
                          <a
                            href={link}
                            className="text-amber-500 hover:text-amber-400 underline"
                          >
                            View
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
