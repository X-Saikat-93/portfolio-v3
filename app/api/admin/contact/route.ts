import { z } from 'zod'

import { ownerRequest } from '~/lib/admin/request'
import {
  listContactSubmissions,
  markContactSubmissionRead,
} from '~/lib/contact/repository'

const updateSchema = z.object({
  id: z.string().uuid(),
  status: z.literal('read'),
})

export async function GET(request: Request) {
  const access = await ownerRequest(request)
  if ('response' in access) return access.response

  try {
    return Response.json(await listContactSubmissions(), {
      headers: { 'cache-control': 'no-store' },
    })
  } catch {
    return Response.json({ error: 'database_unavailable' }, { status: 503 })
  }
}

export async function PATCH(request: Request) {
  const access = await ownerRequest(request, { mutation: true })
  if ('response' in access) return access.response

  try {
    const input = updateSchema.parse(await request.json())
    const submission = await markContactSubmissionRead(input.id)
    return Response.json(submission, { headers: { 'cache-control': 'no-store' } })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'invalid_request' }, { status: 400 })
    }
    return Response.json({ error: 'database_unavailable' }, { status: 503 })
  }
}
