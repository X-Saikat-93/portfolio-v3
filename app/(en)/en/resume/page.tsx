import type { Metadata } from 'next'

import { ResumePageView } from '../../../_views/resume-page'
import { cloudinaryRawUrl, cloudinaryResumePublicId } from '~/lib/cloudinary/image-url'
import { localeMetadata } from '~/lib/locale-metadata'
import { publicPageMetadata } from '~/lib/public-page-metadata'

const copy = publicPageMetadata.resume.en

export const metadata: Metadata = localeMetadata({
  locale: 'en',
  path: '/resume',
  ...copy,
})

export default function ResumePage() {
  const resumeUrl = cloudinaryRawUrl(cloudinaryResumePublicId)

  return <ResumePageView resumeUrl={resumeUrl} />
}
