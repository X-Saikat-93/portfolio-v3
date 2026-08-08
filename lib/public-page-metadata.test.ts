import { describe, expect, it } from 'vitest'

import { publicPageMetadata } from './public-page-metadata'

describe('public page metadata copy', () => {
  it('uses Saikat’s English homepage copy', () => {
    expect(publicPageMetadata.home.en).toEqual({
      title: 'Saikat Das',
      description: 'Product Engineer building reliable web products end to end.',
      ogDescription: 'Product Engineer building reliable web products end to end.',
    })
  })

  it('keeps the available sections English and content-specific', () => {
    expect(publicPageMetadata.blog.en).toEqual({
      title: 'Writing',
      description:
        'Senior engineering notes on AI systems, data architecture, real-time software, product design, and reliable web applications.',
    })
    expect(publicPageMetadata.photos.en).toEqual({
      title: 'Photos',
      description: 'A collection of photographs by Saikat Das.',
    })
    expect(publicPageMetadata.books.en).toEqual({
      title: 'Books',
      description: 'Books Saikat Das is reading, keeping, or recommending.',
    })
    expect(publicPageMetadata.music.en).toEqual({
      title: 'Music',
      description: 'Music Saikat Das is listening to and returning to.',
    })
    expect(publicPageMetadata.projects.en).toEqual({
      title: 'Projects',
      description:
        'Production software and open-source projects built by Saikat Das, including Zaruro and a recruitment operations platform.',
    })
    expect(publicPageMetadata.now.en).toEqual({
      title: 'Now',
      description: 'A current snapshot of what Saikat Das is building, learning, reading, and open to.',
    })
  })

  it('keeps section descriptions within social preview budgets', () => {
    for (const section of ['blog', 'photos', 'books', 'music', 'projects', 'now'] as const) {
      expect(publicPageMetadata[section].en.description.length, section).toBeLessThanOrEqual(160)
    }
  })
})
