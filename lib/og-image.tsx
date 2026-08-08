import { ImageResponse } from 'next/og'

import type { Locale } from './locale-route'
import { ogRuntimeFonts } from './og'
import { publicPageMetadata, type PublicSection } from './public-page-metadata'
import { seo } from './seo'

const sectionCopy: Record<PublicSection, { title: string; description: string }> = {
  blog: publicPageMetadata.blog.en,
  photos: publicPageMetadata.photos.en,
  books: publicPageMetadata.books.en,
  music: publicPageMetadata.music.en,
  projects: publicPageMetadata.projects.en,
  now: publicPageMetadata.now.en,
  resume: publicPageMetadata.resume.en,
  contact: publicPageMetadata.contact.en,
  privacy: publicPageMetadata.privacy.en,
}

async function render(title: string, description: string) {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#f3efe7',
          color: '#191817',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 88px',
          width: '100%',
          height: '100%',
          fontFamily: 'Frex Sans GB',
        }}
      >
        <div style={{ display: 'flex', fontSize: 28, letterSpacing: 4 }}>SAIKAT DAS</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 920 }}>
          <div style={{ display: 'flex', fontSize: 72, fontWeight: 600, letterSpacing: -2 }}>{title}</div>
          <div style={{ display: 'flex', fontSize: 28, color: '#6e6961' }}>{description}</div>
        </div>
        <div style={{ display: 'flex', fontSize: 22, color: '#6e6961' }}>{seo.url.host}</div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: await ogRuntimeFonts(),
    },
  )
}

export function createHomeOgImage(_locale: Locale) {
  return render(publicPageMetadata.home.en.title, publicPageMetadata.home.en.description)
}

export function createSectionOgImage(section: PublicSection, _locale: Locale) {
  const copy = sectionCopy[section]
  return render(copy.title, copy.description)
}
