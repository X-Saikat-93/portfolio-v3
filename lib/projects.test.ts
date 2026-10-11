import { describe, expect, it } from 'vitest'

import { getProjectById, projectPath, projects, selectFeaturedProjects } from './projects'

describe('project records', () => {
  it('keeps stable, unique IDs for every internal detail route', () => {
    const ids = projects.map(({ id }) => id)

    expect(new Set(ids).size).toBe(ids.length)
    expect(ids.every((id) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id))).toBe(true)
    expect(projects.map(({ id }) => projectPath(id))).toContain('/en/projects/zaruro')
  })

  it('ships complete public summaries and valid project links', () => {
    for (const project of projects) {
      expect(project.description.trim().length).toBeGreaterThan(40)
      expect(project.overview.length).toBeGreaterThan(0)
      expect(project.stack.length).toBeGreaterThan(0)
      expect(project.links.length).toBeGreaterThan(0)

      for (const link of project.links) {
        expect(new URL(link.url).protocol).toBe('https:')
      }
    }
  })

  it('finds records without synthesizing an unknown fallback', () => {
    expect(getProjectById('jobpulse')?.name).toBe('JobPulse')
    expect(getProjectById('not-a-project')).toBeUndefined()
  })
})

describe('featured project selection', () => {
  it('leads with case studies, fills with live work, and never repeats', () => {
    const featured = selectFeaturedProjects(['jobpulse', 'zaruro'])

    expect(featured.map(({ id }) => id)).toEqual(['zaruro', 'jobpulse', 'human-before-resource-ats'])
  })

  it('falls back to shipped products alone, never live demos', () => {
    const featured = selectFeaturedProjects([])

    expect(featured.length).toBeGreaterThan(0)
    expect(featured.every(({ status }) => status === 'Live')).toBe(true)
    expect(featured.map(({ id }) => id)).not.toContain('weathersheet')
  })
})
