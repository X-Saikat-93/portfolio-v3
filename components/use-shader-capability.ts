'use client'

import { useCallback, useRef } from 'react'

// The list-stage field draws with WebGL2 (components/ink-shader-canvas). The
// check is a cheap global probe; a context that still fails to start reports
// through markUnavailable and the stage keeps its static art.
export function useShaderCapability() {
  const supported = useRef<boolean | null>(null)

  const check = useCallback(() => {
    if (supported.current === null) {
      supported.current = typeof WebGL2RenderingContext !== 'undefined'
    }
    return Promise.resolve(supported.current)
  }, [])

  const markUnavailable = useCallback(() => {
    supported.current = false
  }, [])

  return { check, markUnavailable, supported }
}
