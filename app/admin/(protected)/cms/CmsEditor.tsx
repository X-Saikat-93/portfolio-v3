'use client'

import { useEffect, useState } from 'react'

import { CloudinaryAssetPicker } from '~/components/admin-cloudinary-asset-picker'

type Entry = {
  id: string
  slug: string
  title: string
  description: string
  seoKeywords: string[]
  body: string
  category: string
  readingMinutes: number
  coverImagePublicId: string | null
  coverImageAlt: string
  status: 'draft' | 'published'
  updatedAt: string
}

type FormState = Omit<Entry, 'id' | 'updatedAt'>

const emptyForm: FormState = {
  slug: '',
  title: '',
  description: '',
  seoKeywords: [],
  body: '',
  category: 'Notes',
  readingMinutes: 5,
  coverImagePublicId: null,
  coverImageAlt: '',
  status: 'draft',
}

export function CmsEditor() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [form, setForm] = useState<FormState>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  async function refresh() {
    const response = await fetch('/api/admin/cms', { cache: 'no-store' })
    if (!response.ok) return
    setEntries((await response.json()) as Entry[])
  }

  useEffect(() => {
    void refresh()
  }, [])

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setMessage('')
    try {
      const response = await fetch(editingId ? `/api/admin/cms/${editingId}` : '/api/admin/cms', {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!response.ok) throw new Error('CMS save failed')
      setMessage('Saved.')
      setEditingId(null)
      setForm(emptyForm)
      await refresh()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'CMS save failed')
    } finally {
      setBusy(false)
    }
  }

  async function remove(id: string) {
    if (!window.confirm('Delete this entry?')) return
    const response = await fetch(`/api/admin/cms/${id}`, { method: 'DELETE' })
    if (response.ok) {
      setMessage('Deleted.')
      if (editingId === id) {
        setEditingId(null)
        setForm(emptyForm)
      }
      await refresh()
    }
  }

  return (
    <div className="pb-10">
      <div className="flex items-center justify-between gap-4">
        <h1 className="page-eyebrow">CMS / MDX</h1>
        <span className="text-xs text-muted-foreground">Neon</span>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        Drafts are stored as Markdown/MDX in Neon. Nothing is public until its status is Published.
      </p>

      <form onSubmit={save} className="mt-8 space-y-3">
        <input
          value={form.slug}
          onChange={(event) => setField('slug', event.target.value)}
          placeholder="slug"
          required
          className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
        />
        <input
          value={form.title}
          onChange={(event) => setField('title', event.target.value)}
          placeholder="Title"
          required
          className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
        />
        <input
          value={form.description}
          onChange={(event) => setField('description', event.target.value)}
          placeholder="Description"
          className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
        />
        <input
          value={form.seoKeywords.join(', ')}
          onChange={(event) =>
            setField(
              'seoKeywords',
              event.target.value
                .split(',')
                .map((keyword) => keyword.trim())
                .filter(Boolean),
            )
          }
          placeholder="SEO keywords, separated by commas"
          className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
        />
        <div className="grid gap-3 sm:grid-cols-[1fr_10rem]">
          <input
            value={form.category}
            onChange={(event) => setField('category', event.target.value)}
            placeholder="Category"
            required
            className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
          />
          <input
            type="number"
            min={1}
            max={120}
            value={form.readingMinutes}
            onChange={(event) => setField('readingMinutes', Number(event.target.value))}
            aria-label="Reading time in minutes"
            className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
          />
        </div>
        <CloudinaryAssetPicker
          value={form.coverImagePublicId}
          onChange={(value) => setField('coverImagePublicId', value)}
          label="Cover artwork"
          help="Upload or select the cover directly here."
        />
        <input
          value={form.coverImageAlt}
          onChange={(event) => setField('coverImageAlt', event.target.value)}
          placeholder="Cover image alt text"
          className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
        />
        <textarea
          value={form.body}
          onChange={(event) => setField('body', event.target.value)}
          placeholder="Write MDX here…"
          rows={14}
          className="w-full rounded-md border border-border bg-background p-3 font-mono text-sm"
        />
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={form.status}
            onChange={(event) => setField('status', event.target.value as FormState['status'])}
            className="h-9 rounded-md border border-border bg-background px-3 text-sm"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
          <button type="submit" disabled={busy} className="h-9 rounded-md bg-foreground px-3 text-sm text-background">
            {busy ? 'Saving…' : editingId ? 'Update entry' : 'Save entry'}
          </button>
          {editingId ? (
            <button
              type="button"
              onClick={() => {
                setEditingId(null)
                setForm(emptyForm)
              }}
              className="h-9 rounded-md border border-border px-3 text-sm"
            >
              New entry
            </button>
          ) : null}
        </div>
      </form>

      {message ? <p className="mt-3 text-sm text-muted-foreground">{message}</p> : null}
      <ul className="mt-8 hairline-top">
        {entries.map((entry) => (
          <li key={entry.id} className="flex items-center gap-3 border-b border-border py-3 text-sm">
            <button
              type="button"
              className="min-w-0 flex-1 text-left hover:text-foreground"
              onClick={() => {
                setEditingId(entry.id)
                setForm({
                  slug: entry.slug,
                  title: entry.title,
                  description: entry.description,
                  seoKeywords: entry.seoKeywords,
                  body: entry.body,
                  category: entry.category,
                  readingMinutes: entry.readingMinutes,
                  coverImagePublicId: entry.coverImagePublicId,
                  coverImageAlt: entry.coverImageAlt,
                  status: entry.status,
                })
              }}
            >
              <span className="block truncate">{entry.title}</span>
              <span className="block truncate text-xs text-muted-foreground">/{entry.slug} · {entry.status}</span>
            </button>
            <button type="button" onClick={() => void remove(entry.id)} className="text-xs text-muted-foreground hover:text-destructive">
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
