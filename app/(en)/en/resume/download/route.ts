import { connection } from 'next/server'

import { cloudinaryResumePublicId } from '~/lib/cloudinary/image-url'
import { getCloudinaryClient } from '~/lib/cloudinary/server'
import { getPublicCloudinaryMediaByPublicId } from '~/lib/cloudinary/media-repository'

export async function GET() {
  await connection()

  try {
    const resume = await getPublicCloudinaryMediaByPublicId(cloudinaryResumePublicId)
    if (!resume) throw new Error('Resume media record is unavailable')

    const { client } = getCloudinaryClient()
    const downloadUrl = client.utils.private_download_url(resume.publicId, resume.format ?? 'pdf', {
      resource_type: resume.resourceType === 'raw' ? 'raw' : 'image',
      type: 'upload',
      attachment: true,
      expires_at: Math.floor(Date.now() / 1000) + 600,
    })

    return new Response(null, {
      status: 302,
      headers: {
        location: downloadUrl,
        'cache-control': 'no-store',
      },
    })
  } catch {
    return new Response('Resume unavailable', {
      status: 503,
      headers: { 'cache-control': 'no-store' },
    })
  }
}
