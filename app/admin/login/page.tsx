import { AdminLoginForm } from '~/components/admin-login-form'
import { AdminBackLink } from '~/components/admin-nav'
import { isBetterAuthConfigured } from '~/lib/auth'

export const instant = false

function AdminSetupNotice() {
  return (
    <div className="mx-auto w-full max-w-[37.5rem] px-6 pb-10">
      <AdminBackLink href="/en">Back to site</AdminBackLink>
      <h1 className="page-eyebrow mt-10">Admin setup required</h1>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        Configure Better Auth, Neon, and ADMIN_EMAIL before opening the owner panel.
      </p>
    </div>
  )
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>
}) {
  if (!isBetterAuthConfigured()) return <AdminSetupNotice />

  const params = await searchParams
  const requestedPath = typeof params.next === 'string' ? params.next : '/admin'
  const nextPath = requestedPath.startsWith('/admin') ? requestedPath : '/admin'

  return (
    <div className="mx-auto w-full max-w-[37.5rem] px-6 pb-10">
      <AdminBackLink href="/en">Back to site</AdminBackLink>
      <h1 className="page-eyebrow mt-10">Owner sign in</h1>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        Sign in to manage Saikat Das&apos;s portfolio.
      </p>
      <div className="mt-8">
        <AdminLoginForm nextPath={nextPath} />
      </div>
    </div>
  )
}
