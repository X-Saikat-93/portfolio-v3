'use client'

import { useEffect, useRef, useState } from 'react'

import { MusicRecordArtwork } from '~/components/music-record-artwork'

export type MusicExperienceItem = {
  id: string
  title: string
  creator: string
  year: number | null
  url: string | null
  imagePublicId: string | null
}

export function MusicExperience({
  title,
  description,
  items,
  displayFontClassName,
}: {
  title: string
  description: string
  items: MusicExperienceItem[]
  displayFontClassName?: string
}) {
  const [selectedId, setSelectedId] = useState(items[0]?.id ?? '')
  const pageRef = useRef<HTMLElement>(null)
  const featureRef = useRef<HTMLElement>(null)
  const artworkRef = useRef<HTMLDivElement>(null)
  const catalogueRef = useRef<HTMLDivElement>(null)
  const selected = items.find((item) => item.id === selectedId) ?? items[0]
  const selectedIndex = selected ? items.indexOf(selected) : -1
  const artists = [...new Set(items.flatMap((item) => item.creator.split(/\s*,\s*/).filter(Boolean)))]

  useEffect(() => {
    const canAnimate =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia(
        '(min-width: 64rem) and (min-height: 48rem) and (prefers-reduced-motion: no-preference)',
      ).matches

    if (!canAnimate || !pageRef.current || !featureRef.current || !catalogueRef.current || !artworkRef.current) {
      return
    }

    let disposed = false
    let revert: (() => void) | undefined

    void Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([gsapModule, triggerModule]) => {
      if (disposed || !pageRef.current || !featureRef.current || !catalogueRef.current || !artworkRef.current) {
        return
      }

      const gsap = gsapModule.gsap
      const { ScrollTrigger } = triggerModule
      gsap.registerPlugin(ScrollTrigger)

      const context = gsap.context(() => {
        ScrollTrigger.create({
          trigger: featureRef.current,
          start: 'top top+=124',
          endTrigger: catalogueRef.current,
          end: 'bottom bottom',
          pin: featureRef.current,
          pinSpacing: false,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        })

        gsap.fromTo(
          artworkRef.current,
          { autoAlpha: 0.72, scale: 0.94, y: 14 },
          {
            autoAlpha: 1,
            scale: 1,
            y: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: featureRef.current,
              start: 'top 78%',
              end: 'top 34%',
              scrub: 0.8,
            },
          },
        )
      }, pageRef)

      revert = () => context.revert()
    }).catch(() => {
      // The server-rendered collection remains fully usable if motion code fails to load.
    })

    return () => {
      disposed = true
      revert?.()
    }
  }, [])

  return (
    <main ref={pageRef} className={`music-experience ${displayFontClassName ?? ''}`}>
      <header className="music-page-heading">
        <div className="music-heading-copy">
          <h1 className="music-page-title">
            <span>{title}</span>
            {items[0] ? (
              <span className="music-inline-art" aria-hidden="true">
                <MusicRecordArtwork item={items[0]} size="inline" />
              </span>
            ) : null}
          </h1>
          <p className="music-page-description">{description}</p>
        </div>
        <div className="music-record-count" aria-label={`${items.length} records`}>
          <span className="music-record-count-number">{String(items.length).padStart(2, '0')}</span>
          <span className="music-record-count-label">Records</span>
        </div>
      </header>

      {items.length === 0 ? (
        <p className="empty-state music-empty-state" role="status">
          Music will appear here when you add and publish it.
        </p>
      ) : (
        <>
          {artists.length > 0 ? (
            <div className="music-credit-marquee" aria-hidden="true">
              <div className="music-credit-track">
                {[...artists, ...artists].map((artist, index) => (
                  <span className="music-credit-item" key={`${artist}-${index}`}>
                    {artist}
                    <span className="music-credit-separator">/</span>
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <div className="music-layout">
            {selected ? (
              <aside ref={featureRef} className="music-feature" aria-label={`Selected record: ${selected.title}`}>
                <div ref={artworkRef} className="music-feature-artwork">
                  <MusicRecordArtwork item={selected} size="feature" eager={selectedIndex === 0} />
                  <span className="music-feature-index" aria-label={`Record ${selectedIndex + 1} of ${items.length}`}>
                    {String(selectedIndex + 1).padStart(2, '0')}
                    <span aria-hidden="true"> / </span>
                    {String(items.length).padStart(2, '0')}
                  </span>
                </div>
                <div className="music-feature-details" aria-live="polite">
                  {selected.year ? <span className="music-feature-year">{selected.year}</span> : null}
                  <h2 className="music-feature-title">{selected.title}</h2>
                  {selected.creator ? <p className="music-feature-artist">{selected.creator}</p> : null}
                  {selected.url ? (
                    <a className="music-listen-link" href={selected.url} target="_blank" rel="noreferrer">
                      Listen on Spotify <span aria-hidden="true">↗</span>
                    </a>
                  ) : null}
                </div>
              </aside>
            ) : null}

            <div ref={catalogueRef} className="music-catalogue">
              <ol className="music-track-list" aria-label="Music collection">
                {items.map((item, index) => {
                  const isSelected = item.id === selected?.id

                  return (
                    <li key={item.id} className={`music-track${isSelected ? ' is-selected' : ''}`}>
                      <button
                        type="button"
                        className="music-track-select"
                        aria-current={isSelected ? 'true' : undefined}
                        aria-controls={`music-track-link-${item.id}`}
                        onClick={() => setSelectedId(item.id)}
                      >
                        <span className="music-track-number">{String(index + 1).padStart(2, '0')}</span>
                        <span className="music-track-copy">
                          <span className="music-track-title">{item.title}</span>
                          {item.creator ? <span className="music-track-artist">{item.creator}</span> : null}
                        </span>
                        {item.year ? <time className="music-track-year">{item.year}</time> : null}
                        <span className="music-track-mark" aria-hidden="true">{isSelected ? '−' : '+'}</span>
                      </button>
                      <div
                        id={`music-track-link-${item.id}`}
                        className="music-track-detail"
                        hidden={!isSelected || !item.url}
                      >
                        {item.url ? (
                          <a href={item.url} target="_blank" rel="noreferrer">
                            Listen on Spotify <span aria-hidden="true">↗</span>
                          </a>
                        ) : null}
                      </div>
                    </li>
                  )
                })}
              </ol>
            </div>
          </div>
        </>
      )}
    </main>
  )
}
