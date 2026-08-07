import 'server-only'

import { v2 as cloudinary } from 'cloudinary'

export type CloudinaryServerConfig = {
  cloudName: string
  apiKey: string
  apiSecret: string
  uploadFolder: string
}

export function getCloudinaryServerConfig(): CloudinaryServerConfig {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim()
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim()
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim()
  const uploadFolder = process.env.CLOUDINARY_UPLOAD_FOLDER?.trim() || 'saikat-das'

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary server credentials are not configured')
  }

  return { cloudName, apiKey, apiSecret, uploadFolder }
}

export function getCloudinaryClient() {
  const config = getCloudinaryServerConfig()
  cloudinary.config({
    cloud_name: config.cloudName,
    api_key: config.apiKey,
    api_secret: config.apiSecret,
    secure: true,
  })
  return { client: cloudinary, config }
}
