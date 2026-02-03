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
} from 'lucide-react'

export interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  roles: UserRole[]
}

export const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['pending', 'owner', 'closer', 'media_buyer', 'cold_caller'] },
  { label: 'Clients', href: '/clients', icon: Users, roles: ['owner', 'closer', 'media_buyer'] },
  { label: 'Projects', href: '/projects', icon: FolderKanban, roles: ['owner', 'closer', 'media_buyer'] },
  { label: 'Deals', href: '/deals', icon: HandCoins, roles: ['owner', 'closer'] },
  { label: 'Invoices', href: '/invoices', icon: FileText, roles: ['owner', 'account_manager'] },
  { label: 'Leads', href: '/leads', icon: UserPlus, roles: ['owner', 'closer', 'cold_caller'] },
  { label: 'Ads', href: '/ads', icon: Megaphone, roles: ['owner', 'media_buyer'] },
  { label: 'Cold Calling', href: '/calling', icon: Phone, roles: ['owner', 'cold_caller'] },
  { label: 'Meetings', href: '/meetings', icon: Calendar, roles: ['owner', 'closer', 'cold_caller'] },
  { label: 'Analytics', href: '/analytics', icon: BarChart3, roles: ['owner', 'media_buyer'] },
  { label: 'AI Insights', href: '/insights', icon: Sparkles, roles: ['owner'] },
  { label: 'Team', href: '/team', icon: UserCog, roles: ['owner'] },
  { label: 'Settings', href: '/settings', icon: Settings, roles: ['owner'] },
]

export function getNavItemsForRole(role: UserRole): NavItem[] {
  return navItems.filter((item) => item.roles.includes(role))
}
