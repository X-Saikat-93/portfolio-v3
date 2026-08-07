import { z } from 'zod'

import { ownerRequest } from '~/lib/admin/request'
import {
  deleteCollectionItem,
  updateCollectionItem,
} from '~/lib/collections/repository'

const idSchema = z.string().uuid()
const updateSchema = z.object({
  kind: z.enum(['book', 'music', 'photo']).optional(),
  title: z.string().trim().min(1).max(240).optional(),
  creator: z.string().trim().max(240).optional(),
  year: z.number().int().min(0).max(3000).nullable().optional(),
  description: z.string().max(2000).optional(),
  url: z.string().url().max(2000).nullable().optional(),
  imagePublicId: z.string().trim().max(500).nullable().optional(),
  status: z.enum(['draft', 'published']).optional(),
  sortOrder: z.number().int().min(-100_000).max(100_000).optional(),
}).strict()

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const access = await ownerRequest(request, { mutation: true })
  if ('response' in access) return access.response

  try {
    const id = idSchema.parse((await params).id)
    const item = await updateCollectionItem(id, updateSchema.parse(await request.json()))
    return item
      ? Response.json(item, { headers: { 'cache-control': 'no-store' } })
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
    await deleteCollectionItem(idSchema.parse((await params).id))
    return new Response(null, { status: 204 })
  } catch {
    return Response.json({ error: 'database_unavailable' }, { status: 503 })
  }
}
