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

type ContributionDay = {
  date: string
  level: number
  count: number
}

const GRID_WEEKS = 26
const GRID_DAYS = 7

function numberValue(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

// Last-26-week grid is 26 columns of 7 days, oldest first, matching the
// render order of `levels`. Each column total powers the weekly fallback.
function weeklyTotals(days: ContributionDay[]): number[] {
  const recent = days.slice(-GRID_WEEKS * GRID_DAYS)
  const weeks: number[] = []
  for (let week = 0; week < GRID_WEEKS; week++) {
    const slice = recent.slice(week * GRID_DAYS, (week + 1) * GRID_DAYS)
    weeks.push(slice.reduce((sum, day) => sum + (numberValue(day.count) ?? 0), 0))
  }
  return weeks
}

// Day-wise grid data: ISO dates and exact commit counts for the same
// last-26-week window, aligned 1:1 with the tail of `levels` so the graph
// can read out per-day counts and draw month labels.
function recentWindow(days: ContributionDay[]): { dates: string[]; counts: number[] } {
  const recent = days.slice(-GRID_WEEKS * GRID_DAYS)
  return {
    dates: recent.map((day) => day.date),
    counts: recent.map((day) => numberValue(day.count) ?? 0),
  }
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
          (day): day is ContributionDay =>
            typeof day === 'object' &&
            day !== null &&
            typeof (day as { date?: unknown }).date === 'string' &&
            typeof (day as { level?: unknown }).level === 'number',
        )
      : []

    const window = recentWindow(days)

    return {
      user: GITHUB_USER,
      followers: numberValue(user.followers),
      publicRepos: numberValue(user.public_repos),
      total: numberValue(contributions.total?.lastYear),
      to: days.at(-1)?.date,
      levels: days.map((day) => day.level).join(''),
      weeks: weeklyTotals(days),
      dates: window.dates,
      counts: window.counts,
    }
  } catch {
    return { ...(bakedGithub as GitHubSnapshot), user: GITHUB_USER }
  }
}
