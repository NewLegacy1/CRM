'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import Link from 'next/link'
import { Plus, Pencil, Trash2, ArrowRight } from 'lucide-react'

interface Project {
  id: string
  client_id: string
  name: string
  status: string
  type?: string
  progress?: number
  updates?: unknown[]
  created_at: string
  client?: { id: string; name: string }
}

const PROJECT_TYPES = ['website', 'funnel', 'ads', 'landing_page', 'other']

interface ProjectsTableProps {
  initialProjects: Project[]
  clients: { id: string; name: string }[]
}

export function ProjectsTable({ initialProjects, clients }: ProjectsTableProps) {
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    client_id: '',
    status: 'active',
    type: 'website',
    progress: 0,
    updateText: '',
  })
  const [loading, setLoading] = useState(false)

  function openCreateDialog() {
    setEditingProject(null)
    setFormData({ name: '', client_id: '', status: 'active', type: 'website', progress: 0, updateText: '' })
    setIsDialogOpen(true)
  }

  function openEditDialog(project: Project) {
    setEditingProject(project)
    setFormData({
      name: project.name,
      client_id: project.client_id,
      status: project.status,
      type: project.type ?? 'website',
      progress: project.progress ?? 0,
      updateText: '',
    })
    setIsDialogOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()

    if (editingProject) {
      // Prepare update payload - exclude updateText and handle updates separately
      const { updateText, ...updatePayload } = formData
      
      // If there's an update text, append it to the updates array
      if (updateText && updateText.trim()) {
        const currentUpdates = (editingProject.updates as { text: string; at: string }[]) ?? []
        updatePayload.updates = [
          ...currentUpdates,
          {
            text: updateText.trim(),
            at: new Date().toISOString(),
          },
        ]
      }

      const { data, error } = await supabase
        .from('projects')
        .update(updatePayload)
        .eq('id', editingProject.id)
        .select('*, client:clients(id, name)')
        .single()

      if (!error && data) {
        setProjects((prev) =>
          prev.map((p) => (p.id === data.id ? data : p))
        )
        setIsDialogOpen(false)
      } else {
        console.error('Error updating project:', error)
      }
    } else {
      // For new projects, exclude updateText
      const { updateText, ...insertPayload } = formData
      const { data, error } = await supabase
        .from('projects')
        .insert([insertPayload])
        .select('*, client:clients(id, name)')
        .single()

      if (!error && data) {
        setProjects((prev) => [data, ...prev])
        setIsDialogOpen(false)
      } else {
        console.error('Error creating project:', error)
      }
    }
    setLoading(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this project?')) return
    const supabase = createClient()
    const { error } = await supabase.from('projects').delete().eq('id', id)
    if (!error) {
      setProjects((prev) => prev.filter((p) => p.id !== id))
    }
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add Project
        </Button>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-zinc-500">
                  No projects yet.
                </TableCell>
              </TableRow>
            ) : (
              projects.map((project) => {
                const progress = project.progress ?? 0
                return (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">{project.name}</TableCell>
                    <TableCell>{project.client?.name || '—'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="relative w-10 h-10">
                          <svg className="w-10 h-10 transform -rotate-90" viewBox="0 0 36 36">
                            <circle
                              cx="18"
                              cy="18"
                              r="15"
                              fill="none"
                              stroke="rgb(39 39 42)"
                              strokeWidth="3"
                            />
                            <circle
                              cx="18"
                              cy="18"
                              r="15"
                              fill="none"
                              stroke="rgb(34 197 94)"
                              strokeWidth="3"
                              strokeDasharray={`${94.25 * progress / 100}, 94.25`}
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs font-medium text-zinc-100">
                              {progress}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-amber-500/10 text-amber-500">
                        {project.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(project)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(project.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogClose onClick={() => setIsDialogOpen(false)} />
          <DialogHeader>
            <DialogTitle>
              {editingProject ? 'Edit Project' : 'Add Project'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Project Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="client_id">Client *</Label>
              <select
                id="client_id"
                value={formData.client_id}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, client_id: e.target.value }))
                }
                required
                className="flex h-10 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="">Select a client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="type">Project Type</Label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, type: e.target.value }))
                }
                className="flex h-10 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                {PROJECT_TYPES.map((t) => (
                  <option key={t} value={t}>{t.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="progress">Progress (%)</Label>
              <Input
                id="progress"
                type="number"
                min={0}
                max={100}
                value={formData.progress}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, progress: parseInt(e.target.value, 10) || 0 }))
                }
              />
            </div>
            {editingProject && (
              <div>
                <Label htmlFor="updateText">Add Update</Label>
                <Input
                  id="updateText"
                  value={formData.updateText}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, updateText: e.target.value }))
                  }
                  placeholder="Brief progress update..."
                />
              </div>
            )}
            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, status: e.target.value }))
                }
                className="flex h-10 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="active">Active</option>
                <option value="on_hold">On Hold</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
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
                {loading ? 'Saving...' : editingProject ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
