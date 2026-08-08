import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { FooterUtilities } from './footer-utilities'

describe('FooterUtilities', () => {
  it('links to the English privacy policy and the page-top target', () => {
    const html = renderToStaticMarkup(<FooterUtilities locale="en" />)

    expect(html).toContain('href="/en/privacy"')
    expect(html).toContain('Privacy policy')
    expect(html).toContain('href="#main-content"')
    expect(html).toContain('Back to top')
  })
})
