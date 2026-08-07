import { z } from 'zod'

import { ownerRequest } from '~/lib/admin/request'
import {
  createCollectionItem,
  listAdminCollectionItems,
  type CollectionKind,
} from '~/lib/collections/repository'

const kindSchema = z.enum(['book', 'music', 'photo'])
const itemSchema = z.object({
  kind: kindSchema,
  title: z.string().trim().min(1).max(240),
  creator: z.string().trim().max(240),
  year: z.number().int().min(0).max(3000).nullable(),
  description: z.string().max(2000),
  url: z.string().url().max(2000).nullable(),
  imagePublicId: z.string().trim().max(500).nullable(),
  status: z.enum(['draft', 'published']),
  sortOrder: z.number().int().min(-100_000).max(100_000),
})

export async function GET(request: Request) {
  const access = await ownerRequest(request)
  if ('response' in access) return access.response

  const kind = new URL(request.url).searchParams.get('kind')
  const parsedKind = kind ? kindSchema.safeParse(kind) : null
  if (parsedKind && !parsedKind.success) {
    return Response.json({ error: 'invalid_request' }, { status: 400 })
  }

  try {
    return Response.json(
      await listAdminCollectionItems(parsedKind?.data as CollectionKind | undefined),
      { headers: { 'cache-control': 'no-store' } },
    )
  } catch {
    return Response.json({ error: 'database_unavailable' }, { status: 503 })
  }
}

export async function POST(request: Request) {
  const access = await ownerRequest(request, { mutation: true })
  if ('response' in access) return access.response

  try {
    return Response.json(await createCollectionItem(itemSchema.parse(await request.json())), {
      status: 201,
      headers: { 'cache-control': 'no-store' },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'invalid_request' }, { status: 400 })
    }
    return Response.json({ error: 'database_unavailable' }, { status: 503 })
  }
}
