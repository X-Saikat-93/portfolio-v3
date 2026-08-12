'use client'

import { isValidElement, useState, type ReactNode } from 'react'

function textFromNode(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(textFromNode).join('')
  if (!isValidElement(node)) return ''

  const props = node.props as { children?: ReactNode; className?: string | string[] }
  const className = Array.isArray(props.className)
    ? props.className.join(' ')
    : props.className ?? ''
  const value = textFromNode(props.children)
  return className.split(' ').includes('line') ? `${value}\n` : value
}

export function MdxCodeBlock({ children, ...props }: React.ComponentPropsWithoutRef<'pre'>) {
  const [copied, setCopied] = useState(false)

  async function copyCode() {
    const code = textFromNode(children).replace(/\n$/, '')
    if (!code || !navigator.clipboard) return

    await navigator.clipboard.writeText(code)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1400)
  }

  return (
    <div className="code-frame">
      <pre {...props}>{children}</pre>
      <button
        type="button"
        className="code-copy"
        data-copied={copied || undefined}
        aria-label={copied ? 'Code copied' : 'Copy code'}
        onClick={() => void copyCode()}
      >
        <span aria-hidden="true">{copied ? '✓' : '↗'}</span>
      </button>
    </div>
  )
}
