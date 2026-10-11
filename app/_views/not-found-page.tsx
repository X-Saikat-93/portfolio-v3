import { ErrorHomeAction } from '~/components/error-home-action'
import { ErrorProof } from '~/components/error-proof'

export function NotFoundPageView() {
  return (
    <ErrorProof
      code="404"
      meta={['INK / 00%', 'POS / ??']}
      status="NO IMPRESSION"
      title="This page slipped off the grid."
      body="The address works. There just isn’t a print here yet."
    >
      <ErrorHomeAction />
    </ErrorProof>
  )
}
