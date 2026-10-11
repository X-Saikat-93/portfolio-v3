'use client'

import { RefreshCw } from 'lucide-react'

import { ErrorHomeAction } from '~/components/error-home-action'
import { ErrorProof } from '~/components/error-proof'
import { Button } from '~/components/ui/button'

export interface ErrorBoundaryProps {
  error: Error & { digest?: string }
  retry: () => void
}

export function ErrorPageView({ retry }: Pick<ErrorBoundaryProps, 'retry'>) {
  return (
    <ErrorProof
      code="500"
      meta={['INK / MISREG', 'POS / ??']}
      status="AWAITING REPRINT"
      title="This page did not print correctly."
      body="No private details are shown. Try again, or return home safely."
    >
      <Button size="md" leadingIcon={RefreshCw} onClick={retry}>
        Try again
      </Button>
      <ErrorHomeAction />
    </ErrorProof>
  )
}
