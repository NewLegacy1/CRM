import type { UserRole } from '@/types/database'
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  HandCoins,
  UserPlus,
  Megaphone,
  GitBranch,
  Globe,
  Phone,
  Calendar,
  BarChart3,
  Sparkles,
  Settings,
  UserCog,
  FileText,
  Activity,
} from 'lucide-react'

export interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  roles: UserRole[]
}

export const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['pending', 'owner', 'closer', 'media_buyer', 'cold_caller', 'demo'] },
  { label: 'Clients', href: '/clients', icon: Users, roles: ['owner', 'closer', 'media_buyer', 'demo'] },
  { label: 'Projects', href: '/projects', icon: FolderKanban, roles: ['owner', 'closer', 'media_buyer', 'demo'] },
  { label: 'Deals', href: '/deals', icon: HandCoins, roles: ['owner', 'closer', 'demo'] },
  { label: 'Invoices', href: '/invoices', icon: FileText, roles: ['owner', 'account_manager', 'demo'] },
  { label: 'Leads', href: '/leads', icon: UserPlus, roles: ['owner', 'closer', 'cold_caller', 'demo'] },
  { label: 'Ads', href: '/ads', icon: Megaphone, roles: ['owner', 'media_buyer', 'demo'] },
  { label: 'Cold Calling', href: '/calling', icon: Phone, roles: ['owner', 'cold_caller', 'demo'] },
  { label: 'Meetings', href: '/meetings', icon: Calendar, roles: ['owner', 'closer', 'cold_caller', 'demo'] },
  { label: 'Analytics', href: '/analytics', icon: BarChart3, roles: ['owner', 'media_buyer', 'demo'] },
  { label: 'AI Insights', href: '/insights', icon: Sparkles, roles: ['owner', 'demo'] },
  { label: 'Activity Updates', href: '/updates', icon: Activity, roles: ['owner', 'demo'] },
  { label: 'Team', href: '/team', icon: UserCog, roles: ['owner', 'demo'] },
  { label: 'Settings', href: '/settings', icon: Settings, roles: ['owner', 'demo'] },
]

export function getNavItemsForRole(role: UserRole): NavItem[] {
  return navItems.filter((item) => item.roles.includes(role))
}
