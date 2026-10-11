import { ErrorHomeAction } from '~/components/error-home-action'
import { ErrorProof } from '~/components/error-proof'

export function ForbiddenPageView() {
  return (
    <ErrorProof
      code="403"
      meta={['INK / SEALED', 'POS / LOCKED']}
      status="NOT FOR RELEASE"
      title="You do not have access to this page."
      body="Sign in with an account that has access, or return home."
    >
      <ErrorHomeAction />
    </ErrorProof>
  )
}
