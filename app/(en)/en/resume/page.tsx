import type { Metadata } from 'next'

import { ResumePageView } from '../../../_views/resume-page'
import { cloudinaryRawUrl, cloudinaryResumePublicId } from '~/lib/cloudinary/image-url'
import { localeMetadata } from '~/lib/locale-metadata'

export const metadata: Metadata = localeMetadata({
  locale: 'en',
  path: '/resume',
  title: 'Resume',
  description: 'Resume for Saikat Das, Product Engineer.',
})

export default function ResumePage() {
  const resumeUrl = cloudinaryRawUrl(cloudinaryResumePublicId)

  return <ResumePageView resumeUrl={resumeUrl} />
}
