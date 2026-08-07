'use client'

import { useEffect, useState } from 'react'

type Kind = 'book' | 'music' | 'photo'
type Item = {
  id: string
  kind: Kind
  title: string
  creator: string
  year: number | null
  description: string
  url: string | null
  imagePublicId: string | null
  status: 'draft' | 'published'
  sortOrder: number
}

type FormState = {
  title: string
  creator: string
  year: string
  description: string
  url: string
  imagePublicId: string
  status: Item['status']
  sortOrder: string
}

const emptyForm: FormState = {
  title: '',
  creator: '',
  year: '',
  description: '',
  url: '',
  imagePublicId: '',
  status: 'draft',
  sortOrder: '0',
}

const copy: Record<Kind, { title: string; creator: string; note: string }> = {
  book: { title: 'Books', creator: 'Author', note: 'Add books you actually want to publish.' },
  music: { title: 'Music', creator: 'Artist', note: 'Add records, albums, or tracks you actually want to publish.' },
  photo: { title: 'Photos', creator: 'Credit or location', note: 'Upload the image to Cloudinary first, then paste its public ID.' },
}

export function CollectionEditor({ kind }: { kind: Kind }) {
  const section = copy[kind]
  const [items, setItems] = useState<Item[]>([])
  const [form, setForm] = useState<FormState>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  async function refresh() {
    const response = await fetch(`/api/admin/collections?kind=${kind}`, { cache: 'no-store' })
    if (!response.ok) throw new Error('Could not load collection items')
    setItems((await response.json()) as Item[])
  }

  useEffect(() => {
    void refresh().catch((error) => setMessage(error instanceof Error ? error.message : 'Could not load collection items'))
  }, [kind])

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setMessage('')
    const payload = {
      kind,
      title: form.title,
      creator: form.creator,
      year: form.year ? Number(form.year) : null,
      description: form.description,
      url: form.url || null,
      imagePublicId: form.imagePublicId || null,
      status: form.status,
      sortOrder: Number(form.sortOrder || 0),
    }
    try {
      const response = await fetch(editingId ? `/api/admin/collections/${editingId}` : '/api/admin/collections', {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!response.ok) throw new Error('Collection item could not be saved')
      setMessage('Saved.')
      setEditingId(null)
      setForm(emptyForm)
      await refresh()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Collection item could not be saved')
    } finally {
      setBusy(false)
    }
  }

  async function remove(id: string) {
    if (!window.confirm('Delete this item?')) return
    const response = await fetch(`/api/admin/collections/${id}`, { method: 'DELETE' })
    if (!response.ok) {
      setMessage('Item could not be deleted')
      return
    }
    setMessage('Deleted.')
    if (editingId === id) {
      setEditingId(null)
      setForm(emptyForm)
    }
    await refresh()
  }

  return (
    <div className="pb-10">
      <h1 className="page-eyebrow">{section.title}</h1>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        {section.note} Drafts stay private until you choose Published.
      </p>

      <form onSubmit={save} className="mt-8 space-y-3">
        <input value={form.title} onChange={(event) => setField('title', event.target.value)} placeholder="Title" required className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm" />
        <input value={form.creator} onChange={(event) => setField('creator', event.target.value)} placeholder={section.creator} className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm" />
        <div className="grid grid-cols-2 gap-3">
          <input value={form.year} onChange={(event) => setField('year', event.target.value)} type="number" min="0" max="3000" placeholder="Year" className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm" />
          <input value={form.sortOrder} onChange={(event) => setField('sortOrder', event.target.value)} type="number" placeholder="Order" className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm" />
        </div>
        <input value={form.imagePublicId} onChange={(event) => setField('imagePublicId', event.target.value)} placeholder="Cloudinary public ID (optional)" className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm" />
        <input value={form.url} onChange={(event) => setField('url', event.target.value)} type="url" placeholder="External URL (optional)" className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm" />
        <textarea value={form.description} onChange={(event) => setField('description', event.target.value)} placeholder="Short description (optional)" rows={4} className="w-full rounded-md border border-border bg-background p-3 text-sm" />
        <div className="flex flex-wrap items-center gap-3">
          <select value={form.status} onChange={(event) => setField('status', event.target.value as Item['status'])} className="h-9 rounded-md border border-border bg-background px-3 text-sm">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
          <button type="submit" disabled={busy} className="h-9 rounded-md bg-foreground px-3 text-sm text-background">
            {busy ? 'Saving…' : editingId ? 'Update item' : 'Save item'}
          </button>
          {editingId ? (
            <button type="button" onClick={() => { setEditingId(null); setForm(emptyForm) }} className="h-9 rounded-md border border-border px-3 text-sm">
              New item
            </button>
          ) : null}
        </div>
      </form>

      {message ? <p className="mt-3 text-sm text-muted-foreground">{message}</p> : null}
      <ul className="mt-8 border-t border-border">
        {items.map((item) => (
          <li key={item.id} className="flex items-center gap-3 border-b border-border py-3 text-sm">
            <button type="button" className="min-w-0 flex-1 text-left hover:text-foreground" onClick={() => {
              setEditingId(item.id)
              setForm({
                title: item.title,
                creator: item.creator,
                year: item.year?.toString() ?? '',
                description: item.description,
                url: item.url ?? '',
                imagePublicId: item.imagePublicId ?? '',
                status: item.status,
                sortOrder: item.sortOrder.toString(),
              })
            }}>
              <span className="block truncate">{item.title}</span>
              <span className="block truncate text-xs text-muted-foreground">{item.creator || 'No creator'} · {item.status}</span>
            </button>
            <button type="button" onClick={() => void remove(item.id)} className="text-xs text-muted-foreground hover:text-destructive">Delete</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
