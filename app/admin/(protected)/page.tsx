import Link from 'next/link'
import type { Metadata } from 'next'

import { requireOwnerPage } from '~/lib/admin/server'
import { nonPublicRobots } from '~/lib/non-public-metadata'

export const metadata: Metadata = {
  title: 'Admin',
  robots: nonPublicRobots,
}

export const instant = false

export default async function AdminPage() {
  await requireOwnerPage('/admin')
  return (
    <div className="pb-10">
      <p className="page-eyebrow">Owner console</p>
      <h1 className="mt-3 text-2xl font-medium tracking-tight">Publish from the surface you are editing.</h1>
      <p className="mt-4 max-w-[34rem] text-sm leading-relaxed text-muted-foreground">
        Every editor writes to Neon. Images and the resume can be uploaded in context, then saved as Cloudinary media records automatically.
      </p>
      <nav className="admin-dashboard-menu" aria-label="Admin surfaces">
        <Link href="/admin/projects">
          <span><strong>Projects & case studies</strong><small>Build evidence-backed project pages</small></span>
          <span>Open →</span>
        </Link>
        <Link href="/admin/cms">
          <span><strong>Writing / MDX</strong><small>Draft, publish, and attach cover artwork</small></span>
          <span>Open →</span>
        </Link>
        <Link href="/admin/media">
          <span><strong>Media archive</strong><small>Review Cloudinary assets and upload defaults</small></span>
          <span>Open →</span>
        </Link>
        <Link href="/admin/resume">
          <span><strong>Resume PDF</strong><small>Replace the canonical original PDF in context</small></span>
          <span>Open →</span>
        </Link>
        <Link href="/admin/collections">
          <span><strong>Books, music, and photos</strong><small>Publish collection items with inline photo upload</small></span>
          <span>Open →</span>
        </Link>
        <Link href="/admin/contact">
          <span><strong>Contact inbox</strong><small>Read and triage private messages</small></span>
          <span>Open →</span>
        </Link>
      </nav>
      <Link href="/en" className="mt-8 inline-flex text-sm text-muted-foreground underline-offset-4 hover:underline">Back to site ↗</Link>
    </div>
  )
}
