import { cacheLife, cacheTag } from 'next/cache'

import type { GitHubSnapshot } from '~/components/social-cards'
import bakedGithub from '~/content/github.json'

const GITHUB_USER = 'X-Saikat-93'

type GitHubUserResponse = {
  followers?: unknown
  public_repos?: unknown
}

type ContributionResponse = {
  contributions?: unknown
  total?: { lastYear?: unknown }
}

function numberValue(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

async function json<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init)
  if (!response.ok) throw new Error(`${url} returned ${response.status}`)
  return (await response.json()) as T
}

export async function getGitHub(): Promise<GitHubSnapshot> {
  'use cache'
  cacheLife({ stale: 21_600, revalidate: 21_600, expire: 604_800 })
  cacheTag('github-live')

  try {
    const [user, contributions] = await Promise.all([
      json<GitHubUserResponse>(`https://api.github.com/users/${GITHUB_USER}`, {
        headers: {
          accept: 'application/vnd.github+json',
          'user-agent': 'saikat-das-portfolio',
        },
      }),
      json<ContributionResponse>(
        `https://github-contributions-api.jogruber.de/v4/${GITHUB_USER}?y=last`,
      ),
    ])

    const days = Array.isArray(contributions.contributions)
      ? contributions.contributions.filter(
          (day): day is { date: string; level: number } =>
            typeof day === 'object' &&
            day !== null &&
            typeof (day as { date?: unknown }).date === 'string' &&
            typeof (day as { level?: unknown }).level === 'number',
        )
      : []

    return {
      user: GITHUB_USER,
      followers: numberValue(user.followers),
      publicRepos: numberValue(user.public_repos),
      total: numberValue(contributions.total?.lastYear),
      to: days.at(-1)?.date,
      levels: days.map((day) => day.level).join(''),
    }
  } catch {
    return { ...(bakedGithub as GitHubSnapshot), user: GITHUB_USER }
  }
}
