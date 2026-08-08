import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { PrivacyPageView } from './_views/privacy-page'

describe('PrivacyPageView', () => {
  it('documents the portfolio’s real public data flows', () => {
    const html = renderToStaticMarkup(<PrivacyPageView />)

    expect(html).toContain('Privacy policy')
    expect(html).toContain('Contact messages')
    expect(html).toContain('Neon Postgres')
    expect(html).toContain('SHA-256')
    expect(html).toContain('Vercel Web Analytics')
    expect(html).toContain('Browser storage')
    expect(html).toContain('No automatic deletion schedule is currently configured')
    expect(html).toContain('href="mailto:ibx.saikat37@gmail.com"')
  })

  it('links to each named infrastructure provider’s privacy information', () => {
    const html = renderToStaticMarkup(<PrivacyPageView />)

    expect(html).toContain('https://vercel.com/docs/analytics/privacy-policy')
    expect(html).toContain('https://neon.tech/privacy-policy')
    expect(html).toContain('https://upstash.com/static/trust/privacy.pdf')
    expect(html).toContain('https://cloudinary.com/privacy')
  })
})
