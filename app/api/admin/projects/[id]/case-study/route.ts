import { z } from 'zod'

import { ownerRequest } from '~/lib/admin/request'
import {
  deleteProjectCaseStudy,
  getAdminProjectCaseStudy,
  upsertProjectCaseStudy,
} from '~/lib/project-case-studies/repository'
import { getProjectById } from '~/lib/projects'

const projectIdSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(160)

const caseStudySchema = z.object({
  heroImagePublicId: z.string().trim().max(500).nullable(),
  heroImageAlt: z.string().trim().max(300),
  framing: z.string().trim().min(1).max(5000),
  challenge: z.string().trim().min(1).max(5000),
  ownership: z.array(z.string().trim().min(1).max(1000)).min(1).max(20),
  proof: z
    .array(
      z.object({
        label: z.string().trim().min(1).max(120),
        value: z.string().trim().min(1).max(500),
      }),
    )
    .min(1)
    .max(20),
  decisions: z
    .array(
      z.object({
        title: z.string().trim().min(1).max(160),
        body: z.string().trim().min(1).max(2000),
      }),
    )
    .min(1)
    .max(20),
  evidence: z.array(z.string().trim().min(1).max(1000)).min(1).max(20),
  boundary: z.string().trim().min(1).max(3000),
  status: z.enum(['draft', 'published']),
})

async function projectIdFrom(params: Promise<{ id: string }>) {
  const projectId = projectIdSchema.parse((await params).id)
  return getProjectById(projectId) ? projectId : null
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const access = await ownerRequest(request)
  if ('response' in access) return access.response

  try {
    const projectId = await projectIdFrom(params)
    if (!projectId) return Response.json({ error: 'not_found' }, { status: 404 })
    return Response.json(await getAdminProjectCaseStudy(projectId), {
      headers: { 'cache-control': 'no-store' },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'invalid_request' }, { status: 400 })
    }
    return Response.json({ error: 'database_unavailable' }, { status: 503 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const access = await ownerRequest(request, { mutation: true })
  if ('response' in access) return access.response

  try {
    const projectId = await projectIdFrom(params)
    if (!projectId) return Response.json({ error: 'not_found' }, { status: 404 })
    const input = caseStudySchema.parse(await request.json())
    return Response.json(await upsertProjectCaseStudy(projectId, input), {
      headers: { 'cache-control': 'no-store' },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'invalid_request' }, { status: 400 })
    }
    return Response.json({ error: 'database_unavailable' }, { status: 503 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const access = await ownerRequest(request, { mutation: true })
  if ('response' in access) return access.response

  try {
    const projectId = await projectIdFrom(params)
    if (!projectId) return Response.json({ error: 'not_found' }, { status: 404 })
    await deleteProjectCaseStudy(projectId)
    return new Response(null, { status: 204 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'invalid_request' }, { status: 400 })
    }
    return Response.json({ error: 'database_unavailable' }, { status: 503 })
  }
}
