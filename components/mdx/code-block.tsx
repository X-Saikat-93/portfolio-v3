'use client'

import { useRef, useState } from 'react'

const languageLabels: Record<string, string> = {
  bash: 'Shell',
  css: 'CSS',
  html: 'HTML',
  js: 'JavaScript',
  json: 'JSON',
  jsx: 'JSX',
  md: 'Markdown',
  mdx: 'MDX',
  plaintext: 'Plain text',
  py: 'Python',
  python: 'Python',
  sh: 'Shell',
  sql: 'SQL',
  text: 'Plain text',
  ts: 'TypeScript',
  tsx: 'TSX',
  txt: 'Plain text',
  yaml: 'YAML',
  yml: 'YAML',
}

// Plain-text blocks are diagrams and traces, where numbers add noise.
const unnumbered = new Set(['text', 'plaintext', 'txt'])

export function MdxCodeBlock({ children, ...props }: React.ComponentPropsWithoutRef<'pre'>) {
  const [copied, setCopied] = useState(false)
  const preRef = useRef<HTMLPreElement>(null)
  const language = (props as { 'data-language'?: string })['data-language'] ?? 'text'
  const numbered = !unnumbered.has(language)

  async function copyCode() {
    // line numbers are CSS pseudo-content, so textContent is the source alone
    const code = preRef.current?.textContent?.replace(/\n$/, '')
    if (!code || !navigator.clipboard) return

    await navigator.clipboard.writeText(code)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1400)
  }

  return (
    <div className="code-frame" data-numbered={numbered || undefined}>
      <div className="code-head">
        <span className="code-lang">{languageLabels[language] ?? language.toUpperCase()}</span>
        <button
          type="button"
          className="code-copy"
          data-copied={copied || undefined}
          onClick={() => void copyCode()}
        >
          <span aria-live="polite">{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <pre ref={preRef} {...props}>
        {children}
      </pre>
    </div>
  )
}
