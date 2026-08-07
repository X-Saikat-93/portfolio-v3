import { connection } from 'next/server'

import { getOwnerAccess } from '~/lib/admin/server'

// Owner probe for the public chrome: answers only whether the current
// session belongs to the site owner, so the dock's Preferences panel can
// reveal its Admin row. Read-only and never a redirect — visitors and
// signed-out owners simply get { owner: false }. Public pages stay static;
// this is called client-side after the panel opens.
export async function GET() {
  await connection()
  let owner = false
  try {
    owner = (await getOwnerAccess()).status === 'authorized'
  } catch {
    // An auth-provider hiccup must never surface in public chrome — the
    // Admin row just stays hidden until the next probe.
  }

  return Response.json(
    { owner },
    { headers: { 'cache-control': 'no-store' } },
  )
}
