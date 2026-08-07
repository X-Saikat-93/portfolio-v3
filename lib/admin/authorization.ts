export type OwnerPrincipal = {
  id: string
  actorId: string
}

export type OwnerAccess =
  | { status: 'authorized'; principal: OwnerPrincipal }
  | { status: 'forbidden' }
  | { status: 'unauthenticated' }

type OwnerAuthorizerDependencies = {
  getOwnerEmail(): string | null
  getSession(): Promise<{
    user: {
      id: string
      email: string
    }
  } | null>
}

export function createOwnerAuthorizer({
  getOwnerEmail,
  getSession,
}: OwnerAuthorizerDependencies) {
  return async function authorizeOwner(): Promise<OwnerAccess> {
    const session = await getSession()
    if (!session?.user.id) {
      return { status: 'unauthenticated' }
    }

    const ownerEmail = getOwnerEmail()?.trim().toLowerCase()
    if (!ownerEmail || session.user.email.trim().toLowerCase() !== ownerEmail) {
      return { status: 'forbidden' }
    }

    return {
      status: 'authorized',
      principal: { id: ownerEmail, actorId: session.user.id },
    }
  }
}
