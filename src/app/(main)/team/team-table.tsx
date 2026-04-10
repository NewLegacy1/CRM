'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Pencil } from 'lucide-react'
import type { Profile } from '@/types/database'

interface TeamTableProps {
  initialProfiles: Profile[]
}

const ROLES = [
  { value: 'owner', label: 'Owner' },
  { value: 'account_manager', label: 'Account Manager' },
  { value: 'closer', label: 'Closer' },
  { value: 'media_buyer', label: 'Media Buyer' },
  { value: 'cold_caller', label: 'Cold Caller' },
]

export function TeamTable({ initialProfiles }: TeamTableProps) {
  const [profiles, setProfiles] = useState<Profile[]>(initialProfiles)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null)
  const [selectedRole, setSelectedRole] = useState('')
  const [loading, setLoading] = useState(false)

  function openEditDialog(profile: Profile) {
    setEditingProfile(profile)
    setSelectedRole(profile.role)
    setIsDialogOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!editingProfile) return
    setLoading(true)
    const supabase = createClient()

    const { data, error } = await supabase
      .from('profiles')
      .update({ role: selectedRole })
      .eq('id', editingProfile.id)
      .select()
      .single()

    if (!error && data) {
      setProfiles((prev) =>
        prev.map((p) => (p.id === data.id ? data : p))
      )
      setIsDialogOpen(false)
    }
    setLoading(false)
  }

  return (
    <>
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {profiles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-zinc-500">
                  No team members yet.
                </TableCell>
              </TableRow>
            ) : (
              profiles.map((profile) => (
                <TableRow key={profile.id}>
                  <TableCell className="font-medium">
                    {profile.display_name || 'Unnamed User'}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-amber-500/10 text-amber-500">
                      {profile.role.replace('_', ' ')}
                    </span>
                  </TableCell>
                  <TableCell>
                    {new Date(profile.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'numeric',
                      day: 'numeric',
                    })}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(profile)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogClose onClick={() => setIsDialogOpen(false)} />
          <DialogHeader>
            <DialogTitle>Edit User Role</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <p className="text-sm text-zinc-400 mb-4">
                User: <span className="font-medium text-zinc-100">{editingProfile?.display_name || 'Unnamed'}</span>
              </p>
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="mt-2 flex h-10 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                {ROLES.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Update Role'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
