import { describe, expect, it } from 'vitest'

import {
  nonPublicDescriptions,
  nonPublicRobots,
} from '~/lib/non-public-metadata'

describe('non-public route metadata', () => {
  it('keeps admin, forbidden, and not-found surfaces out of indexes', () => {
    expect(nonPublicRobots).toEqual({ index: false, follow: false })
    expect(nonPublicDescriptions).toEqual({
      admin: 'Private owner administration for Saikat Das.',
      forbidden: 'Sign in with an account that has access, or return home.',
      notFound: 'This page does not exist.',
    })
  })
})
