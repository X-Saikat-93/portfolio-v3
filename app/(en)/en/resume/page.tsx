import type { Metadata } from 'next'

import { cloudinaryRawUrl, cloudinaryResumePublicId } from '~/lib/cloudinary/image-url'

export const metadata: Metadata = {
  title: 'Resume',
  description: 'Resume for Saikat Das, Product Engineer.',
}

export default function ResumePage() {
  const resumeUrl = cloudinaryRawUrl(cloudinaryResumePublicId)

  return (
    <div className="mx-auto w-full max-w-[37.5rem] px-6">
      <h1 className="page-eyebrow enter">Resume</h1>
      <p className="mt-5 max-w-[34rem] text-sm leading-relaxed text-muted-foreground">
        Product Engineer building reliable web products end to end.
      </p>
      {resumeUrl ? (
        <a
          href={resumeUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-8 inline-flex rounded-md bg-foreground px-4 py-2 text-sm text-background"
        >
          Download resume PDF
        </a>
      ) : (
        <p className="mt-8 text-sm text-muted-foreground">
          Resume delivery is waiting for the Cloudinary upload.
        </p>
      )}
    </div>
  )
}
