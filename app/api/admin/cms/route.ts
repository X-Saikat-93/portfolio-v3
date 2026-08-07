import { z } from 'zod'

import { ownerRequest } from '~/lib/admin/request'
import { createCmsEntry, listCmsEntries } from '~/lib/cms/repository'

const entrySchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(160),
  title: z.string().trim().min(1).max(240),
  description: z.string().max(1000),
  body: z.string().max(200_000),
  status: z.enum(['draft', 'published']),
})

export async function GET(request: Request) {
  const access = await ownerRequest(request)
  if ('response' in access) return access.response

  try {
    return Response.json(await listCmsEntries(), { headers: { 'cache-control': 'no-store' } })
  } catch {
    return Response.json({ error: 'database_unavailable' }, { status: 503 })
  }
}

export async function POST(request: Request) {
  const access = await ownerRequest(request, { mutation: true })
  if ('response' in access) return access.response

  try {
    const input = entrySchema.parse(await request.json())
    return Response.json(await createCmsEntry(input), {
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
