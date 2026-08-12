'use client'

import Link from 'next/link'

import { CloudinaryAssetPicker } from '~/components/admin-cloudinary-asset-picker'
import { cloudinaryResumePublicId } from '~/lib/cloudinary/image-url'

export function ResumeEditor() {
  return (
    <div className="admin-editor pb-10">
      <Link href="/admin" className="admin-back-link">← Admin overview</Link>
      <p className="page-eyebrow mt-5">Resume</p>
      <h1 className="mt-3 text-2xl font-medium tracking-tight">Original PDF</h1>
      <p className="mt-3 max-w-[32rem] text-sm leading-relaxed text-muted-foreground">
        Upload the replacement PDF here. It overwrites the canonical Cloudinary asset and refreshes the DB media record used by the public resume download link.
      </p>
      <div className="mt-8 border-t border-border pt-4">
        <CloudinaryAssetPicker
          value={cloudinaryResumePublicId}
          onChange={() => undefined}
          kind="resume"
          label="Canonical resume PDF"
          selectable={false}
          help="The public page always downloads this canonical asset through the signed server route."
        />
      </div>
      <Link href="/en/resume" target="_blank" className="mt-8 inline-flex text-sm text-muted-foreground underline-offset-4 hover:underline">View public resume ↗</Link>
    </div>
  )
}
