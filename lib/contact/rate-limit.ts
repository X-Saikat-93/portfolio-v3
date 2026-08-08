import 'server-only'

import { createRequestLimiter, limitRequest } from '~/lib/rate-limit'

const contactLimiter = createRequestLimiter({
  prefix: 'saikat:contact',
  maxRequestsEnv: 'CONTACT_RATE_LIMIT_MAX_REQUESTS',
  windowSecondsEnv: 'CONTACT_RATE_LIMIT_WINDOW_SECONDS',
  maxRequests: 5,
  windowSeconds: 3_600,
})

export async function limitContactSubmission(request: Request) {
  return limitRequest(request, contactLimiter, {
    failOpen: process.env.NODE_ENV !== 'production',
  })
}
