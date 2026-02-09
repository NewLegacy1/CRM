'use client'

import { useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Pencil, Trash2 } from 'lucide-react'

interface Creative {
  id: string
  project_id: string
  platform: string
  name: string
  primary_text: string | null
  headline: string | null
  cta: string | null
  image_urls: string[]
  video_urls: string[]
  created_at: string
}

interface AdCreativesListProps {
  projectId: string
  initialCreatives: Creative[]
  isDemo?: boolean
}

export function AdCreativesList({ projectId, initialCreatives, isDemo = false }: AdCreativesListProps) {
  const [creatives, setCreatives] = useState<Creative[]>(initialCreatives)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    name: '',
    platform: 'meta',
    primary_text: '',
    headline: '',
    cta: '',
  })
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const acceptTypes = useMemo(() => 'image/*,video/*', [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('ad_creatives')
      .insert([
        {
          project_id: projectId,
          ...form,
          image_urls: [],
          video_urls: [],
          is_demo: isDemo,
        },
      ])
      .select()
      .single()
    if (!error && data) {
      let imageUrls: string[] = []
      let videoUrls: string[] = []

      if (files.length > 0) {
        const folder = isDemo ? 'demo' : 'prod'
        for (const file of files) {
          const cleanName = file.name.replace(/\s+/g, '-')
          const filePath = `${folder}/${projectId}/${data.id}/${Date.now()}-${cleanName}`
          const { error: uploadError } = await supabase.storage
            .from('ad-creatives')
            .upload(filePath, file, { contentType: file.type })

          if (uploadError) {
            console.error('Upload failed:', uploadError)
            continue
          }

          const { data: publicUrl } = supabase.storage
            .from('ad-creatives')
            .getPublicUrl(filePath)

          if (file.type.startsWith('image/')) {
            imageUrls.push(publicUrl.publicUrl)
          } else if (file.type.startsWith('video/')) {
            videoUrls.push(publicUrl.publicUrl)
          }
        }
      }

      let updatedCreative = data
      if (imageUrls.length > 0 || videoUrls.length > 0) {
        const { data: updated, error: updateError } = await supabase
          .from('ad_creatives')
          .update({
            image_urls: imageUrls,
            video_urls: videoUrls,
          })
          .eq('id', data.id)
          .select()
          .single()

        if (!updateError && updated) {
          updatedCreative = updated
        }
      }

      setCreatives((prev) => [updatedCreative, ...prev])
      setOpen(false)
      setForm({ name: '', platform: 'meta', primary_text: '', headline: '', cta: '' })
      setFiles([])
    }
    setLoading(false)
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Creative
        </Button>
      </div>
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead>Primary Text</TableHead>
              <TableHead>Headline</TableHead>
              <TableHead>CTA</TableHead>
              <TableHead>Media</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {creatives.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-zinc-500">
                  No creatives. Add one for copy/designer uploads.
                </TableCell>
              </TableRow>
            ) : (
              creatives.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="capitalize">{c.platform}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{c.primary_text || '—'}</TableCell>
                  <TableCell className="max-w-[120px] truncate">{c.headline || '—'}</TableCell>
                  <TableCell>{c.cta || '—'}</TableCell>
                  <TableCell>
                    <div className="text-xs text-zinc-400">
                      {c.image_urls?.length ?? 0} images • {c.video_urls?.length ?? 0} videos
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogClose onClick={() => setOpen(false)} />
          <DialogHeader>
            <DialogTitle>Add Creative</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
            </div>
            <div>
              <Label htmlFor="platform">Platform</Label>
              <select
                id="platform"
                value={form.platform}
                onChange={(e) => setForm((p) => ({ ...p, platform: e.target.value }))}
                className="flex h-10 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100"
              >
                <option value="meta">Meta</option>
                <option value="google">Google</option>
              </select>
            </div>
            <div>
              <Label htmlFor="primary_text">Primary Text</Label>
              <Textarea id="primary_text" value={form.primary_text} onChange={(e) => setForm((p) => ({ ...p, primary_text: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="headline">Headline</Label>
              <Input id="headline" value={form.headline} onChange={(e) => setForm((p) => ({ ...p, headline: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="cta">CTA</Label>
              <Input id="cta" value={form.cta} onChange={(e) => setForm((p) => ({ ...p, cta: e.target.value }))} placeholder="Learn More, Sign Up, etc." />
            </div>
            <div>
              <Label htmlFor="media">Upload photos/videos</Label>
              <Input
                id="media"
                type="file"
                accept={acceptTypes}
                multiple
                onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
              />
              <p className="mt-1 text-xs text-zinc-500">PNG, JPG, MP4, MOV supported.</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Create'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
