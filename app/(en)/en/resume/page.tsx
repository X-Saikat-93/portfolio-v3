import type { Metadata } from 'next'

import { ResumePageView } from '../../../_views/resume-page'
import { cloudinaryResumePublicId } from '~/lib/cloudinary/image-url'
import { getPublicCloudinaryMediaByPublicId } from '~/lib/cloudinary/media-repository'
import { localeMetadata } from '~/lib/locale-metadata'
import { publicPageMetadata } from '~/lib/public-page-metadata'

const copy = publicPageMetadata.resume.en

export const metadata: Metadata = localeMetadata({
  locale: 'en',
  path: '/resume',
  ...copy,
})

export default async function ResumePage() {
  const resume = await getPublicCloudinaryMediaByPublicId(cloudinaryResumePublicId)

  return <ResumePageView resumeUrl={resume ? '/en/resume/download' : null} />
}
