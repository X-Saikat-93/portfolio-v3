'use client'

import { useEffect, useState } from 'react'

import { CloudinaryImage } from '~/components/cloudinary-image'

type Asset = {
  id: string
  publicId: string
  resourceType: 'image' | 'raw'
  secureUrl: string
  originalName: string | null
  bytes: number | null
}

type UploadKind = 'avatar' | 'resume' | 'image'

async function optimizeImage(file: File) {
  if (!file.type.startsWith('image/')) return file

  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(bitmap.width * scale))
  canvas.height = Math.max(1, Math.round(bitmap.height * scale))
  const context = canvas.getContext('2d')
  if (!context) return file
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/webp', 0.82),
  )
  return blob
    ? new File([blob], `${file.name.replace(/\.[^.]+$/, '')}.webp`, { type: 'image/webp' })
    : file
}

export function CloudinaryMediaPanel() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [kind, setKind] = useState<UploadKind>('avatar')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  async function refresh() {
    const response = await fetch('/api/admin/cloudinary/assets', { cache: 'no-store' })
    if (!response.ok) return
    setAssets((await response.json()) as Asset[])
  }

  useEffect(() => {
    void refresh()
  }, [])

  async function upload(file: File) {
    setBusy(true)
    setMessage('')
    try {
      const prepared = kind === 'resume' ? file : await optimizeImage(file)
      const signResponse = await fetch('/api/admin/cloudinary/sign', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ kind }),
      })
      if (!signResponse.ok) throw new Error('Cloudinary signing failed')
      const signed = (await signResponse.json()) as {
        apiKey: string
        cloudName: string
        folder: string
        publicId: string
        resourceType: 'image' | 'raw'
        signature: string
        timestamp: number
      }

      const form = new FormData()
      form.set('file', prepared, prepared.name)
      form.set('api_key', signed.apiKey)
      form.set('folder', signed.folder)
      form.set('public_id', signed.publicId.split('/').at(-1) ?? signed.publicId)
      form.set('signature', signed.signature)
      form.set('timestamp', String(signed.timestamp))
      const cloudinaryResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${signed.cloudName}/${signed.resourceType}/upload`,
        { method: 'POST', body: form },
      )
      if (!cloudinaryResponse.ok) throw new Error('Cloudinary upload failed')
      const uploaded = (await cloudinaryResponse.json()) as {
        public_id: string
        resource_type: 'image' | 'raw'
        secure_url: string
        format?: string
        bytes?: number
        width?: number
        height?: number
      }

      const saveResponse = await fetch('/api/admin/cloudinary/assets', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          publicId: uploaded.public_id,
          resourceType: uploaded.resource_type,
          secureUrl: uploaded.secure_url,
          originalName: file.name,
          format: uploaded.format,
          bytes: uploaded.bytes,
          width: uploaded.width,
          height: uploaded.height,
        }),
      })
      if (!saveResponse.ok) throw new Error('Neon media record failed')
      setMessage(kind === 'avatar' ? 'Avatar uploaded.' : 'Upload complete.')
      await refresh()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="pb-10">
      <div className="flex items-center justify-between gap-4">
        <h1 className="page-eyebrow">Media</h1>
        <span className="text-xs text-muted-foreground">Cloudinary</span>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        Upload an avatar, resume PDF, or real site image. Images are resized to 1600px and encoded as WebP before upload.
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <select
          value={kind}
          onChange={(event) => setKind(event.target.value as UploadKind)}
          className="h-9 rounded-md border border-border bg-background px-3 text-sm"
        >
          <option value="avatar">Homepage avatar</option>
          <option value="resume">Resume PDF</option>
          <option value="image">Site image</option>
        </select>
        <label className="inline-flex h-9 cursor-pointer items-center rounded-md bg-foreground px-3 text-sm text-background">
          {busy ? 'Uploading…' : 'Choose file'}
          <input
            type="file"
            accept={kind === 'resume' ? 'application/pdf,.pdf' : 'image/*'}
            className="sr-only"
            disabled={busy}
            onChange={(event) => {
              const file = event.target.files?.[0]
              event.target.value = ''
              if (file) void upload(file)
            }}
          />
        </label>
      </div>
      {message ? <p className="mt-3 text-sm text-muted-foreground">{message}</p> : null}
      <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {assets.map((asset) => (
          <li key={asset.id} className="rounded-md border border-border p-2 text-xs">
            {asset.resourceType === 'image' ? (
              <CloudinaryImage
                publicId={asset.publicId}
                alt={asset.originalName ?? ''}
                width={320}
                height={220}
                className="aspect-[4/3] w-full rounded object-cover"
              />
            ) : (
              <div className="flex aspect-[4/3] items-center justify-center bg-muted">PDF</div>
            )}
            <p className="mt-2 truncate">{asset.originalName ?? asset.publicId}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
