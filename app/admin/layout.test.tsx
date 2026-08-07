import { describe, expect, it, vi } from 'vitest'

vi.mock('../_components/site-document', () => ({
  rootMetadata: {},
  SiteDocument: vi.fn(),
}))

import { SiteDocument } from '../_components/site-document'
import AdminRootLayout from './layout'

describe('admin root layout', () => {
  it('keeps the owner document shell English and provider-neutral', () => {
    const children = <div>Admin</div>
    const layout = AdminRootLayout({ children })

    expect(layout.type).toBe(SiteDocument)
    expect(layout.props).toMatchObject({
      isAdmin: true,
      locale: 'en',
      children,
    })
  })
})
