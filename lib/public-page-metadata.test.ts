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
      description: 'Writing by Saikat Das.',
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
      description: 'Products, tools, and experiments built by Saikat Das.',
    })
  })

  it('keeps section descriptions within social preview budgets', () => {
    for (const section of ['blog', 'photos', 'books', 'music', 'projects'] as const) {
      expect(publicPageMetadata[section].en.description.length, section).toBeLessThanOrEqual(160)
    }
  })
})
