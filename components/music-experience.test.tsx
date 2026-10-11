/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { MusicExperience, type MusicExperienceItem } from './music-experience'

vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img {...props} />
  ),
}))

const records: MusicExperienceItem[] = [
  {
    id: 'closer',
    title: 'Closer',
    creator: 'The Chainsmokers, Halsey',
    year: 2016,
    url: 'https://open.spotify.com/track/closer',
    imagePublicId: 'portfolio/music/closer',
  },
  {
    id: 'paris',
    title: 'Paris',
    creator: 'The Chainsmokers',
    year: 2017,
    url: 'https://open.spotify.com/track/paris',
    imagePublicId: 'portfolio/music/paris',
  },
  {
    id: 'track-without-art',
    title: 'Track without art',
    creator: 'Artist',
    year: null,
    url: null,
    imagePublicId: null,
  },
]

afterEach(() => cleanup())

describe('MusicExperience', () => {
  it('renders each published track and uses the first as the initial feature', () => {
    render(
      <MusicExperience
        title="Music"
        description="Music Saikat Das is listening to and returning to."
        items={records}
      />,
    )

    expect(screen.getByRole('heading', { level: 1, name: 'Music' })).toBeTruthy()
    expect(screen.getByRole('heading', { level: 2, name: 'Closer' })).toBeTruthy()
    expect(screen.getByRole('list', { name: 'Music collection' }).querySelectorAll('li')).toHaveLength(3)
    expect(screen.getByRole('button', { name: /Closer/ }).getAttribute('aria-current')).toBe('true')
    expect(screen.getByRole('img', { name: 'Closer artwork' })).toBeTruthy()
    expect(screen.getByText('Track without art')).toBeTruthy()
  })

  it('updates the featured artwork and Spotify link when a track is selected', () => {
    render(<MusicExperience title="Music" description="Collection" items={records} />)

    fireEvent.click(screen.getByRole('button', { name: /Paris/ }))

    expect(screen.getByRole('heading', { level: 2, name: 'Paris' })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Paris/ }).getAttribute('aria-current')).toBe('true')
    expect(screen.getByRole('button', { name: /Closer/ }).getAttribute('aria-current')).toBeNull()
    expect(screen.getAllByRole('link', { name: /Listen on Spotify/ }).some((link) =>
      link.getAttribute('href') === 'https://open.spotify.com/track/paris',
    )).toBe(true)
  })

  it('renders the published-collection empty state without fabricating records', () => {
    render(<MusicExperience title="Music" description="Collection" items={[]} />)

    expect(screen.getByRole('status').textContent).toBe('Music will appear here when you add and publish it.')
    expect(screen.queryByRole('list', { name: 'Music collection' })).toBeNull()
  })
})
