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
      <h1 className="page-eyebrow">Admin</h1>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        Owner-only controls for the portfolio. Content stays unpublished until you add it.
      </p>
      <nav className="mt-8 hairline-top pt-3">
        <ul className="motion-list flex flex-col">
          <li className="border-b border-border py-3">
            <Link href="/admin/cms" className="list-row-link block text-sm">CMS / MDX</Link>
          </li>
          <li className="border-b border-border py-3">
            <Link href="/admin/media" className="list-row-link block text-sm">Cloudinary media</Link>
          </li>
          <li className="border-b border-border py-3">
            <Link href="/admin/collections" className="list-row-link block text-sm">Books, music, and photos</Link>
          </li>
          <li className="border-b border-border py-3">
            <Link href="/admin/contact" className="list-row-link block text-sm">Contact inbox</Link>
          </li>
          <li className="py-3">
            <Link href="/en" className="list-row-link block text-sm text-muted-foreground">Back to site</Link>
          </li>
        </ul>
      </nav>
    </div>
  )
}
