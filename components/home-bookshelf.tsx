'use client'

import Link from 'next/link'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'

import { CloudinaryImage } from '~/components/cloudinary-image'

export type HomeBookshelfBook = {
  id: string
  title: string
  creator: string
  url: string | null
  imagePublicId: string | null
}

const HOVER_INTENT_MS = 180
const DEFAULT_COVER_W = 141
const BOOK_H = 212
const SPINE_W = 35
const SHELF_GAP = 2
const DURATION = 650
const MAX_TILT = 3.4
const MIN_HIT = 44

type AnimationHandle = number | ReturnType<typeof setTimeout>

function scheduleFrame(callback: FrameRequestCallback): AnimationHandle {
  if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
    return window.requestAnimationFrame(callback)
  }

  return window.setTimeout(() => callback(performance.now()), 16)
}

function cancelScheduledFrame(handle: AnimationHandle) {
  if (
    typeof window !== 'undefined' &&
    typeof window.cancelAnimationFrame === 'function' &&
    typeof handle === 'number'
  ) {
    window.cancelAnimationFrame(handle)
    return
  }

  window.clearTimeout(handle as ReturnType<typeof setTimeout>)
}

function easeInOutCubic(value: number) {
  return value < 0.5
    ? 4 * value * value * value
    : 1 - Math.pow(-2 * value + 2, 3) / 2
}

function baseLean(title: string) {
  let hash = 0
  for (let character = 0; character < title.length; character += 1) {
    hash = (hash * 31 + title.charCodeAt(character)) | 0
  }

  return 0.65 + (Math.abs(hash) % 90) / 100
}

function targetTilt(index: number, open: number, title: string) {
  if (index === open) return 0

  const distance = Math.abs(index - open)
  const toward = index < open ? -1 : 1
  const lean =
    Math.abs(baseLean(title)) * Math.max(0.7, 1 - 0.04 * distance) +
    Math.max(0, 1.85 - 0.26 * distance)

  return Math.max(-MAX_TILT, Math.min(MAX_TILT, toward * lean))
}

function projectBookBounds(
  spine: number,
  coverWidth: number,
  rotateY: number,
  tilt: number,
) {
  const y = rotateY * (Math.PI / 180)
  const z = tilt * (Math.PI / 180)
  const cosY = Math.cos(y)
  const sinY = Math.sin(y)
  const cosZ = Math.cos(z)
  const sinZ = Math.sin(z)
  const centerY = BOOK_H / 2
  const projected: number[] = []
  const faces = [
    { depth: 0, xs: [0, spine] },
    { depth: spine, xs: [0, coverWidth] },
  ]

  for (const face of faces) {
    for (const x of face.xs) {
      for (const yPosition of [0, BOOK_H]) {
        const localY = yPosition - centerY
        projected.push((x * cosY + face.depth * sinY) * cosZ - localY * sinZ)
      }
    }
  }

  const left = Math.min(...projected)
  return {
    width: Math.max(...projected) - left,
    offsetX: -left,
  }
}

function pose(progress: number, tilt: number, spine: number, coverWidth: number) {
  const clamped = Math.max(0, Math.min(1, progress))
  const closed = 1 - clamped
  const rotateY = 90 * closed
  const visibleTilt = tilt * closed

  return {
    ...projectBookBounds(spine, coverWidth, rotateY, visibleTilt),
    rotateY,
    tilt: visibleTilt,
  }
}

function shelfPoses(
  books: HomeBookshelfBook[],
  coverWidths: number[],
  progress: number[],
  tilts: number[],
) {
  let baseX = 0
  let projectedX = 0

  return books.map((book, index) => {
    const next = pose(progress[index] ?? 0, tilts[index] ?? 0, SPINE_W, coverWidths[index])
    const frameX = projectedX - baseX

    baseX += SPINE_W + SHELF_GAP
    projectedX += next.width + SHELF_GAP

    return { ...next, frameX, book }
  })
}

function projectedShelfWidth(
  books: HomeBookshelfBook[],
  coverWidths: number[],
  progress: number[],
  tilts: number[],
) {
  return shelfPoses(books, coverWidths, progress, tilts).reduce(
    (width, next, index) =>
      width + next.width + (index === books.length - 1 ? 0 : SHELF_GAP),
    0,
  )
}

function useReducedMotionPreference() {
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return

    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(media.matches)
    update()

    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', update)
      return () => media.removeEventListener('change', update)
    }

    media.addListener(update)
    return () => media.removeListener(update)
  }, [])

  return reducedMotion
}

export function HomeBookshelf({
  books,
  allBooksHref,
}: {
  books: HomeBookshelfBook[]
  allBooksHref: string
}) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const controlRefs = useRef<Array<HTMLButtonElement | null>>([])
  const frameRefs = useRef<Array<HTMLLIElement | null>>([])
  const innerRefs = useRef<Array<HTMLSpanElement | null>>([])
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingHoverIndexRef = useRef<number | null>(null)
  const animationRef = useRef<AnimationHandle | null>(null)
  const targetRef = useRef(0)
  const shelfRef = useRef<HTMLUListElement | null>(null)
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const boundsRef = useRef<Array<{ left: number; right: number }>>([])
  const pointerXRef = useRef<number | null>(null)
  const hoveredRef = useRef<number | null>(null)
  const coverWidths = useMemo(() => books.map(() => DEFAULT_COVER_W), [books])
  const progressRef = useRef<number[]>(books.map((_, index) => (index === 0 ? 1 : 0)))
  const tiltRef = useRef<number[]>(books.map((book, index) => targetTilt(index, 0, book.title)))
  const reducedMotion = useReducedMotionPreference()
  const selectedBook = books[selectedIndex] ?? books[0]

  const maxProjectedShelfWidth = useMemo(() => {
    if (books.length === 0) return 1

    return Math.max(
      ...books.map((_, open) =>
        projectedShelfWidth(
          books,
          coverWidths,
          books.map((__, index) => (index === open ? 1 : 0)),
          books.map((book, index) => targetTilt(index, open, book.title)),
        ),
      ),
    )
  }, [books, coverWidths])

  const clearHoverIntent = useCallback((index?: number) => {
    if (index !== undefined && pendingHoverIndexRef.current !== index) return
    if (hoverTimerRef.current) window.clearTimeout(hoverTimerRef.current)
    hoverTimerRef.current = null
    pendingHoverIndexRef.current = null
  }, [])

  const nearestBook = useCallback((pointerX: number, fallback = 0) => {
    let nearest = fallback
    let nearestDistance = Number.POSITIVE_INFINITY

    boundsRef.current.forEach((bounds, index) => {
      if (!bounds) return

      const distance =
        pointerX < bounds.left
          ? bounds.left - pointerX
          : pointerX > bounds.right
            ? pointerX - bounds.right
            : 0

      if (distance < nearestDistance) {
        nearest = index
        nearestDistance = distance
      }
    })

    return nearest
  }, [])

  const hoveredBook = useCallback(
    (pointerX: number) => {
      const first = boundsRef.current[0]
      const last = boundsRef.current.at(-1)

      if (
        !first ||
        !last ||
        pointerX < first.left - MIN_HIT / 2 ||
        pointerX > last.right + MIN_HIT / 2
      ) {
        return null
      }

      return nearestBook(pointerX)
    },
    [nearestBook],
  )

  const setHoverOwner = useCallback((next: number | null) => {
    const closed = next === targetRef.current ? null : next
    if (hoveredRef.current === closed) return

    hoveredRef.current = closed
    controlRefs.current.forEach((control, index) => {
      control?.toggleAttribute('data-hover', index === closed)
    })
  }, [])

  const pointerXInShelf = useCallback((clientX: number) => {
    const shelf = shelfRef.current
    if (!shelf) return null

    const bounds = shelf.getBoundingClientRect()
    const scale = bounds.width / shelf.offsetWidth || 1
    return (clientX - bounds.left) / scale
  }, [])

  const updateShelfScale = useCallback(() => {
    const viewport = viewportRef.current
    const shelf = shelfRef.current
    if (!viewport || !shelf || maxProjectedShelfWidth <= 0) return

    const scale =
      viewport.clientWidth > 0
        ? Math.min(1, viewport.clientWidth / maxProjectedShelfWidth)
        : 1
    shelf.style.setProperty('--home-bookshelf-scale', scale.toFixed(4))
  }, [maxProjectedShelfWidth])

  const applyPoses = useCallback(
    (progress: number[], tilts: number[]) => {
      let projectedX = 0

      shelfPoses(books, coverWidths, progress, tilts).forEach((next, index) => {
        const frame = frameRefs.current[index]
        const inner = innerRefs.current[index]
        boundsRef.current[index] = {
          left: projectedX,
          right: projectedX + next.width,
        }
        projectedX += next.width + SHELF_GAP

        if (!frame || !inner) return

        frame.style.zIndex = progress[index] > 0.01 ? '2' : '1'
        frame.style.transform =
          'translate3d(' + next.frameX.toFixed(2) + 'px, 0, 0)'
        frame.style.setProperty(
          '--home-book-contact-scale',
          (next.width / coverWidths[index]).toFixed(4),
        )
        inner.style.transform =
          'translate3d(' +
          next.offsetX.toFixed(2) +
          'px, 0, 0) rotate(' +
          next.tilt.toFixed(3) +
          'deg) rotateY(' +
          next.rotateY.toFixed(3) +
          'deg)'
      })

      if (pointerXRef.current !== null) {
        setHoverOwner(hoveredBook(pointerXRef.current))
      }
    },
    [books, coverWidths, hoveredBook, setHoverOwner],
  )

  const settleOn = useCallback(
    (nextOpen: number, mode: 'animated' | 'instant' = 'animated') => {
      if (!books[nextOpen]) return
      if (
        nextOpen === targetRef.current &&
        animationRef.current &&
        progressRef.current[nextOpen] > 0.999
      ) {
        return
      }

      if (animationRef.current) {
        cancelScheduledFrame(animationRef.current)
        animationRef.current = null
      }

      targetRef.current = nextOpen
      setHoverOwner(pointerXRef.current === null ? null : hoveredBook(pointerXRef.current))
      setSelectedIndex(nextOpen)

      const fromProgress = progressRef.current.slice()
      const fromTilts = tiltRef.current.slice()
      const toProgress = books.map((_, index) => (index === nextOpen ? 1 : 0))
      const toTilts = books.map((book, index) => targetTilt(index, nextOpen, book.title))

      const finish = () => {
        progressRef.current = toProgress
        tiltRef.current = toTilts
        applyPoses(toProgress, toTilts)
        animationRef.current = null
      }

      if (reducedMotion || mode === 'instant') {
        finish()
        return
      }

      const started = typeof performance !== 'undefined' ? performance.now() : Date.now()
      const tick: FrameRequestCallback = (now) => {
        const elapsed = Math.min(1, (now - started) / DURATION)
        const eased = easeInOutCubic(elapsed)
        const progress = fromProgress.map(
          (value, index) => value + (toProgress[index] - value) * eased,
        )
        const tilts = fromTilts.map(
          (value, index) => value + (toTilts[index] - value) * eased,
        )

        progressRef.current = progress
        tiltRef.current = tilts
        applyPoses(progress, tilts)

        if (elapsed < 1) {
          animationRef.current = scheduleFrame(tick)
          return
        }

        finish()
      }

      animationRef.current = scheduleFrame(tick)
    },
    [applyPoses, books, hoveredBook, reducedMotion, setHoverOwner],
  )

  const selectBook = useCallback(
    (index: number, mode: 'animated' | 'instant' = 'animated') => {
      clearHoverIntent()
      settleOn(index, mode)
    },
    [clearHoverIntent, settleOn],
  )

  const queueHoverSelection = useCallback(
    (index: number) => {
      if (!books[index] || index === targetRef.current) {
        clearHoverIntent()
        return
      }
      if (pendingHoverIndexRef.current === index) return

      clearHoverIntent()
      pendingHoverIndexRef.current = index
      hoverTimerRef.current = setTimeout(() => {
        pendingHoverIndexRef.current = null
        hoverTimerRef.current = null
        settleOn(index)
      }, HOVER_INTENT_MS)
    },
    [books, clearHoverIntent, settleOn],
  )

  const handleShelfPointerMove = useCallback(
    (event: React.PointerEvent<HTMLUListElement>) => {
      if (event.pointerType === 'touch') {
        pointerXRef.current = null
        setHoverOwner(null)
        return
      }

      const target =
        event.target instanceof Element
          ? event.target.closest<HTMLButtonElement>('.home-book-control')
          : null
      const targetIndex = target ? controlRefs.current.indexOf(target) : -1
      if (targetIndex < 0) {
        pointerXRef.current = null
        setHoverOwner(null)
        return
      }

      const shelf = shelfRef.current
      const hasLayout = Boolean(shelf && shelf.offsetWidth > 0 && shelf.getBoundingClientRect().width > 0)
      const pointerX = pointerXInShelf(event.clientX)
      const hovered =
        hasLayout && pointerX !== null ? hoveredBook(pointerX) : targetIndex

      if (hovered === null) {
        pointerXRef.current = null
        setHoverOwner(null)
        return
      }

      pointerXRef.current = pointerX
      setHoverOwner(hovered)
      queueHoverSelection(hovered)
    },
    [
      hoveredBook,
      pointerXInShelf,
      queueHoverSelection,
      setHoverOwner,
    ],
  )

  const handleShelfPointerLeave = useCallback(() => {
    pointerXRef.current = null
    clearHoverIntent()
    setHoverOwner(null)
  }, [clearHoverIntent, setHoverOwner])

  const moveSelection = useCallback(
    (index: number) => {
      const nextIndex = (index + books.length) % books.length
      selectBook(nextIndex, 'instant')
      controlRefs.current[nextIndex]?.focus()
    },
    [books.length, selectBook],
  )

  useLayoutEffect(() => {
    applyPoses(progressRef.current, tiltRef.current)
    updateShelfScale()

    const viewport = viewportRef.current
    if (!viewport || typeof ResizeObserver === 'undefined') return

    const observer = new ResizeObserver(updateShelfScale)
    observer.observe(viewport)
    return () => observer.disconnect()
  }, [applyPoses, updateShelfScale])

  useEffect(() => {
    return () => {
      clearHoverIntent()
      if (animationRef.current) cancelScheduledFrame(animationRef.current)
    }
  }, [clearHoverIntent])

  useEffect(() => {
    if (!reducedMotion || !animationRef.current) return

    cancelScheduledFrame(animationRef.current)
    animationRef.current = null
    const nextOpen = targetRef.current
    const progress = books.map((_, index) => (index === nextOpen ? 1 : 0))
    const tilts = books.map((book, index) => targetTilt(index, nextOpen, book.title))
    progressRef.current = progress
    tiltRef.current = tilts
    applyPoses(progress, tilts)
  }, [applyPoses, books, reducedMotion])

  if (!selectedBook) return null

  const renderedPoses = shelfPoses(books, coverWidths, progressRef.current, tiltRef.current)

  return (
    <div className="home-bookshelf">
      <ul className="home-bookshelf-mobile-grid" aria-label="Books in this collection">
        {books.map((book, index) => {
          const isSelected = index === selectedIndex

          return (
            <li key={'mobile-' + book.id}>
              <button
                type="button"
                className="home-bookshelf-mobile-book"
                data-selected={isSelected ? 'true' : undefined}
                aria-label={'Select ' + book.title}
                aria-pressed={isSelected}
                onClick={(event) =>
                  selectBook(index, event.detail === 0 ? 'instant' : 'animated')
                }
              >
                <span className="home-bookshelf-mobile-cover" aria-hidden="true">
                  {book.imagePublicId ? (
                    <CloudinaryImage
                      publicId={book.imagePublicId}
                      alt=""
                      width={96}
                      height={144}
                      sizes="(max-width: 39.99rem) 44px, 60px"
                      loading="lazy"
                      className="home-bookshelf-mobile-cover-image"
                    />
                  ) : (
                    <span className="home-bookshelf-mobile-cover-fallback">
                      {book.title}
                    </span>
                  )}
                </span>
                <span className="home-bookshelf-mobile-title">{book.title}</span>
              </button>
            </li>
          )
        })}
      </ul>

      <div ref={viewportRef} className="home-bookshelf-viewport">
        <ul
          ref={shelfRef}
          className="home-bookshelf-track"
          aria-label="Choose a book to inspect"
          style={
            {
              '--home-bookshelf-layout-width': maxProjectedShelfWidth + 'px',
              '--home-bookshelf-scale': 1,
            } as React.CSSProperties
          }
          onPointerMove={handleShelfPointerMove}
          onPointerLeave={handleShelfPointerLeave}
        >
          {books.map((book, index) => {
            const isOpen = index === selectedIndex
            const initialPose = renderedPoses[index]
            const coverWidth = coverWidths[index]

            return (
              <li
                key={book.id}
                ref={(element) => {
                  frameRefs.current[index] = element
                }}
                className="home-book-frame"
                style={
                  {
                    width: SPINE_W,
                    zIndex: progressRef.current[index] > 0.01 ? 2 : 1,
                    transform: 'translate3d(' + initialPose.frameX.toFixed(2) + 'px, 0, 0)',
                    '--home-book-contact-width': coverWidth + 'px',
                    '--home-book-contact-scale': (initialPose.width / coverWidth).toFixed(4),
                  } as React.CSSProperties
                }
              >
                <span className="home-book-contact-shadow" aria-hidden="true" />
                <button
                  ref={(element) => {
                    controlRefs.current[index] = element
                  }}
                  type="button"
                  className="home-book-control"
                  data-open={isOpen ? 'true' : undefined}
                  aria-label={'Show ' + book.title}
                  aria-pressed={isOpen}
                  tabIndex={isOpen ? 0 : -1}
                  onClick={(event) =>
                    selectBook(index, event.detail === 0 ? 'instant' : 'animated')
                  }
                  onPointerLeave={() => clearHoverIntent(index)}
                  onKeyDown={(event) => {
                    if (event.key === 'ArrowRight') {
                      event.preventDefault()
                      moveSelection(index + 1)
                    } else if (event.key === 'ArrowLeft') {
                      event.preventDefault()
                      moveSelection(index - 1)
                    } else if (event.key === 'Home') {
                      event.preventDefault()
                      moveSelection(0)
                    } else if (event.key === 'End') {
                      event.preventDefault()
                      moveSelection(books.length - 1)
                    }
                  }}
                >
                  <span
                    ref={(element) => {
                      innerRefs.current[index] = element
                    }}
                    className="home-book-inner"
                    style={
                      {
                        width: coverWidth,
                        transform:
                          'translate3d(' +
                          initialPose.offsetX.toFixed(2) +
                          'px, 0, 0) rotate(' +
                          initialPose.tilt.toFixed(3) +
                          'deg) rotateY(' +
                          initialPose.rotateY.toFixed(3) +
                          'deg)',
                      } as React.CSSProperties
                    }
                  >
                    <span
                      className="home-book-cover"
                      style={{ transform: 'translateZ(' + SPINE_W + 'px)' }}
                    >
                      {book.imagePublicId ? (
                        <CloudinaryImage
                          publicId={book.imagePublicId}
                          alt={book.title + ' cover artwork'}
                          width={360}
                          height={540}
                          sizes="(max-width: 640px) 128px, 148px"
                          loading={index === 0 ? 'eager' : 'lazy'}
                          className="home-book-cover-image"
                        />
                      ) : (
                        <span className="home-book-cover-fallback">{book.title}</span>
                      )}
                      <span className="home-book-cover-glaze" aria-hidden="true" />
                    </span>
                    <span
                      className="home-book-spine"
                      style={{ width: SPINE_W }}
                      aria-hidden={isOpen ? 'true' : undefined}
                    >
                      <span className="home-book-spine-title">{book.title}</span>
                    </span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
      <div className="home-bookshelf-edge" aria-hidden="true" />

      <div className="home-bookshelf-note" aria-live="polite">
        <div key={selectedBook.id} className="home-bookshelf-selection min-w-0">
          <p className="home-bookshelf-kicker">Selected volume</p>
          <p className="home-bookshelf-title">{selectedBook.title}</p>
          {selectedBook.creator ? (
            <p className="home-bookshelf-creator">{selectedBook.creator}</p>
          ) : null}
        </div>
        <div className="home-bookshelf-actions">
          {selectedBook.url ? (
            <a href={selectedBook.url} target="_blank" rel="noreferrer">
              Book details ↗
            </a>
          ) : null}
          <Link href={allBooksHref}>Browse all books</Link>
        </div>
      </div>
    </div>
  )
}
