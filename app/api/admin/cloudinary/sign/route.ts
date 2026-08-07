import { getCloudinaryClient } from '~/lib/cloudinary/server'
import { ownerRequest } from '~/lib/admin/request'

const kinds = new Set(['avatar', 'resume', 'image'])

export async function POST(request: Request) {
  const access = await ownerRequest(request, { mutation: true })
  if ('response' in access) return access.response

  let body: { kind?: unknown }
  try {
    body = (await request.json()) as { kind?: unknown }
  } catch {
    return Response.json({ error: 'invalid_request' }, { status: 400 })
  }

  const kind = typeof body.kind === 'string' && kinds.has(body.kind) ? body.kind : null
  if (!kind) return Response.json({ error: 'invalid_request' }, { status: 400 })

  try {
    const { client, config } = getCloudinaryClient()
    const timestamp = Math.floor(Date.now() / 1000)
    const publicId = kind === 'avatar' ? 'avatar' : kind === 'resume' ? 'resume' : crypto.randomUUID()
    const params = {
      folder: config.uploadFolder,
      public_id: publicId,
      timestamp,
    }
    const signature = client.utils.api_sign_request(params, config.apiSecret)

    return Response.json(
      {
        apiKey: config.apiKey,
        cloudName: config.cloudName,
        folder: config.uploadFolder,
        publicId: `${config.uploadFolder}/${publicId}`,
        resourceType: kind === 'resume' ? 'raw' : 'image',
        signature,
        timestamp,
      },
      { headers: { 'cache-control': 'no-store' } },
    )
  } catch {
    return Response.json({ error: 'provider_unavailable' }, { status: 503 })
  }
}
