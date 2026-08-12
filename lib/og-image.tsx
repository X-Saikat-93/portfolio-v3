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

async function render(title: string, description: string, section = 'PRODUCT ENGINEERING') {
  return new ImageResponse(
    (
      <div
        style={{
          position: 'relative',
          background: '#f3efe7',
          color: '#191817',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 76px',
          width: '100%',
          height: '100%',
          fontFamily: 'Frex Sans GB',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -210,
            right: -150,
            width: 640,
            height: 640,
            border: '1px solid #d1c8bb',
            borderRadius: 999,
            opacity: 0.7,
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: -140,
            right: -80,
            width: 500,
            height: 500,
            border: '1px dashed #d1c8bb',
            borderRadius: 999,
            opacity: 0.6,
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', fontSize: 26, letterSpacing: 4 }}>SAIKAT DAS</div>
            <div style={{ display: 'flex', marginTop: 14, fontSize: 17, letterSpacing: 3, color: '#b0542b' }}>
              {section}
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: 104,
              height: 104,
              border: '2px solid #191817',
              transform: 'rotate(6deg)',
            }}
          >
            <div style={{ display: 'flex', fontSize: 34, fontWeight: 600, letterSpacing: 4 }}>SD</div>
            <div style={{ display: 'flex', marginTop: 5, fontSize: 10, letterSpacing: 2, color: '#6e6961' }}>
              MARK
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 960 }}>
          <div style={{ display: 'flex', fontSize: 68, fontWeight: 600, letterSpacing: -2, lineHeight: 1.05 }}>
            {title}
          </div>
          <div style={{ display: 'flex', fontSize: 27, color: '#6e6961', lineHeight: 1.35 }}>{description}</div>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            paddingTop: 18,
            borderTop: '1px solid #d1c8bb',
            fontSize: 17,
            letterSpacing: 2,
            color: '#6e6961',
          }}
        >
          <div style={{ display: 'flex' }}>REAL-TIME · DATA · APIs</div>
          <div style={{ display: 'flex' }}>{seo.url.host}</div>
        </div>
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
  return render(
    'BUILDING RELIABLE PRODUCT SYSTEMS',
    'Full-stack web products, APIs, and data systems — from architecture to production.',
  )
}

export function createSectionOgImage(section: PublicSection, _locale: Locale) {
  const copy = sectionCopy[section]
  return render(copy.title, copy.description, copy.title.toUpperCase())
}
