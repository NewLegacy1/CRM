'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface Creative {
  id: string
  platform: string
  name: string
  primary_text: string | null
  headline: string | null
  cta: string | null
  project?: { id: string; name: string }
}

interface CreativesLibraryProps {
  initialCreatives: Creative[]
}

export function CreativesLibrary({ initialCreatives }: CreativesLibraryProps) {
  const creatives = initialCreatives

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <h2 className="text-lg font-semibold text-zinc-100 mb-2">Creatives library</h2>
      <p className="text-sm text-zinc-500 mb-4">
        Copy and assets from projects (primary text, headline, CTA). Use these when launching campaigns.
      </p>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead>Primary text</TableHead>
              <TableHead>Headline</TableHead>
              <TableHead>CTA</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {creatives.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-zinc-500">
                  No creatives yet. Add them under Projects → Client Ads.
                </TableCell>
              </TableRow>
            ) : (
              creatives.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>{c.project?.name ?? '—'}</TableCell>
                  <TableCell className="capitalize">{c.platform}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{c.primary_text || '—'}</TableCell>
                  <TableCell className="max-w-[120px] truncate">{c.headline || '—'}</TableCell>
                  <TableCell>{c.cta || '—'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  )
}
