import { z } from 'zod'

import { ownerRequest } from '~/lib/admin/request'
import { deleteCmsEntry, updateCmsEntry } from '~/lib/cms/repository'

const idSchema = z.string().uuid()
const updateSchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(160).optional(),
  title: z.string().trim().min(1).max(240).optional(),
  description: z.string().max(1000).optional(),
  body: z.string().max(200_000).optional(),
  status: z.enum(['draft', 'published']).optional(),
}).strict()

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const access = await ownerRequest(request, { mutation: true })
  if ('response' in access) return access.response

  try {
    const id = idSchema.parse((await params).id)
    const input = updateSchema.parse(await request.json())
    const entry = await updateCmsEntry(id, input)
    return entry
      ? Response.json(entry, { headers: { 'cache-control': 'no-store' } })
      : Response.json({ error: 'not_found' }, { status: 404 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'invalid_request' }, { status: 400 })
    }
    return Response.json({ error: 'database_unavailable' }, { status: 503 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const access = await ownerRequest(request, { mutation: true })
  if ('response' in access) return access.response

  try {
    await deleteCmsEntry(idSchema.parse((await params).id))
    return new Response(null, { status: 204 })
  } catch {
    return Response.json({ error: 'database_unavailable' }, { status: 503 })
  }
}
