'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react'

import type { CommandPaletteItem } from '~/components/command-palette'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'

const MAX_VISIBLE_ITEMS = 12

// The palette's dialog, loaded on first open so the Base UI dialog stays out
// of every page's initial JavaScript.
export function CommandPaletteDialog({
  items,
  open,
  setOpen,
}: {
  items: readonly CommandPaletteItem[]
  open: boolean
  setOpen: (open: boolean) => void
}) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)

  const visibleItems = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase()
    const matches = normalizedQuery
      ? items.filter((item) =>
          [item.label, item.description, item.group, item.href]
            .join(' ')
            .toLocaleLowerCase()
            .includes(normalizedQuery),
        )
      : items

    return matches.slice(0, MAX_VISIBLE_ITEMS)
  }, [items, query])

  useEffect(() => {
    if (!open) return

    setQuery('')
    setSelectedIndex(0)
    const frame = window.requestAnimationFrame(() => inputRef.current?.focus())

    return () => window.cancelAnimationFrame(frame)
  }, [open])

  useEffect(() => {
    setSelectedIndex((index) => Math.min(index, Math.max(visibleItems.length - 1, 0)))
  }, [visibleItems.length])

  function navigateTo(item: CommandPaletteItem | undefined) {
    if (!item) return

    setOpen(false)
    router.push(item.href)
  }

  function handleInputKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setSelectedIndex((index) => (visibleItems.length ? (index + 1) % visibleItems.length : 0))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setSelectedIndex((index) =>
        visibleItems.length ? (index - 1 + visibleItems.length) % visibleItems.length : 0,
      )
    } else if (event.key === 'Home' && visibleItems.length) {
      event.preventDefault()
      setSelectedIndex(0)
    } else if (event.key === 'End' && visibleItems.length) {
      event.preventDefault()
      setSelectedIndex(visibleItems.length - 1)
    } else if (event.key === 'Enter') {
      event.preventDefault()
      navigateTo(visibleItems[selectedIndex])
    }
  }

  const selectedItem = visibleItems[selectedIndex]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent size="lg" className="command-palette-dialog">
        <DialogHeader className="command-palette-header">
          <div>
            <DialogTitle>Jump to</DialogTitle>
            <DialogDescription className="sr-only">
              Search pages, projects, and published writing.
            </DialogDescription>
          </div>
          <kbd className="command-palette-escape">Esc</kbd>
        </DialogHeader>

        <div className="command-palette-body">
          <label className="sr-only" htmlFor="command-palette-search">
            Search pages, projects, and published writing
          </label>
          <div className="command-palette-input-wrap">
            <span className="command-palette-input-mark" aria-hidden>
              /
            </span>
            <input
              ref={inputRef}
              id="command-palette-search"
              type="search"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              value={query}
              placeholder="Search the site"
              aria-controls="command-palette-results"
              aria-activedescendant={selectedItem ? `command-result-${selectedItem.id}` : undefined}
              onChange={(event) => {
                setQuery(event.target.value)
                setSelectedIndex(0)
              }}
              onKeyDown={handleInputKeyDown}
            />
          </div>

          {visibleItems.length ? (
            <ul
              id="command-palette-results"
              className="command-palette-results"
              role="listbox"
              aria-label="Search results"
            >
              {visibleItems.map((item, index) => (
                <li key={item.id}>
                  <Link
                    id={`command-result-${item.id}`}
                    href={item.href}
                    prefetch={false}
                    role="option"
                    aria-selected={index === selectedIndex}
                    className="command-palette-result"
                    data-active={index === selectedIndex ? 'true' : undefined}
                    onClick={() => setOpen(false)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <span className="command-palette-result-main">
                      <span className="command-palette-result-label">{item.label}</span>
                      <span className="command-palette-result-description">
                        {item.description}
                      </span>
                    </span>
                    <span className="command-palette-result-group">{item.group}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="command-palette-empty" role="status">
              No matching pages, projects, or writing.
            </p>
          )}

          <div className="command-palette-footer" aria-hidden>
            <span>↑↓ Navigate</span>
            <span>↵ Open</span>
            <span>Esc Close</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
