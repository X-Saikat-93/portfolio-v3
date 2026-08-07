import { z } from 'zod'

import { ownerRequest } from '~/lib/admin/request'
import {
  listCloudinaryMedia,
  saveCloudinaryMedia,
} from '~/lib/cloudinary/media-repository'

const assetSchema = z.object({
  publicId: z.string().min(1).max(500),
  resourceType: z.enum(['image', 'raw']),
  format: z.string().max(32).optional(),
  secureUrl: z.string().url(),
  originalName: z.string().max(255).optional(),
  bytes: z.number().int().nonnegative().optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
})

export async function GET(request: Request) {
  const access = await ownerRequest(request)
  if ('response' in access) return access.response

  try {
    return Response.json(await listCloudinaryMedia(), {
      headers: { 'cache-control': 'no-store' },
    })
  } catch {
    return Response.json({ error: 'database_unavailable' }, { status: 503 })
  }
}

export async function POST(request: Request) {
  const access = await ownerRequest(request, { mutation: true })
  if ('response' in access) return access.response

  try {
    const input = assetSchema.parse(await request.json())
    const asset = await saveCloudinaryMedia(input)
    return Response.json(asset, { status: 201, headers: { 'cache-control': 'no-store' } })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'invalid_request' }, { status: 400 })
    }
    return Response.json({ error: 'database_unavailable' }, { status: 503 })
  }
}
