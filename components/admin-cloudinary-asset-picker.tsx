'use client'

import { useEffect, useState } from 'react'

import { CloudinaryImage } from '~/components/cloudinary-image'

type Asset = {
  id: string
  publicId: string
  resourceType: 'image' | 'raw'
  secureUrl: string
  originalName: string | null
  format?: string | null
  bytes: number | null
}

type UploadKind = 'avatar' | 'resume' | 'image' | 'photo'

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

function isResumeAsset(asset: Asset) {
  return asset.format?.toLowerCase() === 'pdf' || asset.originalName?.toLowerCase().endsWith('.pdf')
}

export function CloudinaryAssetPicker({
  value,
  onChange,
  kind = 'image',
  label = 'Asset',
  help,
  selectable = true,
}: {
  value: string | null
  onChange: (publicId: string | null) => void
  kind?: UploadKind
  label?: string
  help?: string
  selectable?: boolean
}) {
  const [assets, setAssets] = useState<Asset[]>([])
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  async function refresh() {
    const response = await fetch('/api/admin/cloudinary/assets', { cache: 'no-store' })
    if (!response.ok) throw new Error('Could not load Cloudinary assets')
    setAssets((await response.json()) as Asset[])
  }

  useEffect(() => {
    void refresh().catch((error) =>
      setMessage(error instanceof Error ? error.message : 'Could not load Cloudinary assets'),
    )
  }, [])

  const matchingAssets = assets.filter((asset) =>
    kind === 'resume' ? isResumeAsset(asset) : asset.resourceType === 'image' && !isResumeAsset(asset),
  )
  const selectedAsset = assets.find((asset) => asset.publicId === value)

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

      onChange(uploaded.public_id)
      setMessage('Uploaded and selected.')
      await refresh()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <fieldset className="admin-asset-picker">
      <legend className="admin-field-label">{label}</legend>
      {help ? <p className="admin-field-help">{help}</p> : null}
      <div className="admin-asset-picker-controls">
        {selectable ? (
          <select
            value={value ?? ''}
            onChange={(event) => onChange(event.target.value || null)}
            className="h-9 min-w-0 flex-1 rounded-md border border-border bg-background px-3 text-sm"
            aria-label={`Select ${label.toLowerCase()}`}
          >
            <option value="">No asset selected</option>
            {matchingAssets.map((asset) => (
              <option key={asset.id} value={asset.publicId}>
                {asset.originalName ?? asset.publicId}
              </option>
            ))}
          </select>
        ) : (
          <span className="admin-asset-picker-fixed">Canonical asset · {value}</span>
        )}
        <label className="admin-upload-button">
          {busy ? 'Uploading…' : 'Upload here'}
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
      {selectedAsset ? (
        <div className="admin-asset-picker-preview">
          {selectedAsset.resourceType === 'image' && !isResumeAsset(selectedAsset) ? (
            <CloudinaryImage
              publicId={selectedAsset.publicId}
              alt={selectedAsset.originalName ?? ''}
              width={180}
              height={110}
              className="h-20 w-28 rounded object-cover"
            />
          ) : (
            <span className="admin-asset-picker-file">PDF</span>
          )}
          <span className="min-w-0 truncate text-xs text-muted-foreground">
            {selectedAsset.originalName ?? selectedAsset.publicId}
          </span>
          <button type="button" className="text-xs text-muted-foreground hover:text-foreground" onClick={() => onChange(null)}>
            Clear
          </button>
        </div>
      ) : null}
      {message ? <p className="admin-field-help" role="status">{message}</p> : null}
    </fieldset>
  )
}
