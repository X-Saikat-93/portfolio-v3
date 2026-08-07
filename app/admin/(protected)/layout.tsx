import { Suspense } from 'react'
import { connection } from 'next/server'

import { requireOwnerPage } from '~/lib/admin/server'

import { AdminShell } from './AdminShell'

async function OwnerGate() {
  await requireOwnerPage('/admin')
  return null
}

// The shell — column and owner dock — prerenders. Ownership is re-checked
// here in parallel for every admin route as defense in depth; each page's
// own loader independently requires the owner before touching any data.
export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Admin HTML must be resolved per request; the proxy cookie check is only
  // an optimistic redirect and never replaces this server-side authorization.
  await connection()

  return (
    <AdminShell>
      {children}
      <Suspense fallback={null}>
        <OwnerGate />
      </Suspense>
    </AdminShell>
  )
}
