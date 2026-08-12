import { ownerRequest } from '~/lib/admin/request'
import { listAdminProjectCaseStudies } from '~/lib/project-case-studies/repository'

export async function GET(request: Request) {
  const access = await ownerRequest(request)
  if ('response' in access) return access.response

  try {
    return Response.json(await listAdminProjectCaseStudies(), {
      headers: { 'cache-control': 'no-store' },
    })
  } catch {
    return Response.json({ error: 'database_unavailable' }, { status: 503 })
  }
}
