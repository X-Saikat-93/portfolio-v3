'use client'

import { useEffect, useState } from 'react'

// The 404 sheet is one static page for every missing address, so the
// address itself is read in the browser. It holds its line until then.
export function MissingPath() {
  const [path, setPath] = useState<string | null>(null)

  useEffect(() => {
    setPath(decodeURI(window.location.pathname))
  }, [])

  return (
    <>
      <span className="error-detail-label">Asked for</span>{' '}
      <code className="error-detail-path" data-pending={path === null ? '' : undefined}>
        {path ?? '/'}
      </code>
    </>
  )
}
