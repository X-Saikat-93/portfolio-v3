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
        <ul className="flex flex-col">
          <li className="border-b border-border py-3">
            <Link href="/admin/cms" className="text-sm hover:text-foreground">CMS / MDX</Link>
          </li>
          <li className="border-b border-border py-3">
            <Link href="/admin/media" className="text-sm hover:text-foreground">Cloudinary media</Link>
          </li>
          <li className="border-b border-border py-3">
            <Link href="/admin/collections" className="text-sm hover:text-foreground">Books, music, and photos</Link>
          </li>
          <li className="border-b border-border py-3">
            <Link href="/admin/contact" className="text-sm hover:text-foreground">Contact inbox</Link>
          </li>
          <li className="py-3">
            <Link href="/en" className="text-sm text-muted-foreground hover:text-foreground">Back to site</Link>
          </li>
        </ul>
      </nav>
    </div>
  )
}
