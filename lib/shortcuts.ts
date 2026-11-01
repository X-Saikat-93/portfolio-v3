// Single-key shortcuts (the dock letters and / for search) can be switched
// off from the preferences panel: one-character shortcuts must be possible
// to turn off for people using speech input (WCAG 2.1.4). On by default;
// the choice lives in localStorage like the sound preference.

let inMemoryShortcutsEnabled = true

export function shortcutsEnabled(): boolean {
  try {
    const preference = localStorage.getItem('shortcuts')
    return preference === null ? inMemoryShortcutsEnabled : preference === 'on'
  } catch {
    return inMemoryShortcutsEnabled
  }
}

export function setShortcutsEnabled(on: boolean) {
  inMemoryShortcutsEnabled = on
  try {
    localStorage.shortcuts = on ? 'on' : 'off'
  } catch {
    /* private mode */
  }
}

export function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable
}
