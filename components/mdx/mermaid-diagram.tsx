import { renderMermaidSVG } from 'beautiful-mermaid'

export function MermaidDiagram({ code, caption }: { code: string; caption?: string }) {
  try {
    const svg = renderMermaidSVG(code, {
      bg: 'transparent',
      fg: 'var(--foreground)',
      line: 'var(--muted-foreground)',
      accent: 'var(--signal)',
      muted: 'var(--muted-foreground)',
      surface: 'var(--surface-2)',
      border: 'var(--border)',
      transparent: true,
      font: 'var(--font-sans)',
    })

    return (
      <figure className="mermaid-frame">
        <div className="scroll-area-x-viewport">
          <div className="mermaid-sheet" dangerouslySetInnerHTML={{ __html: svg }} />
        </div>
        {caption ? <figcaption className="post-figcaption">{caption}</figcaption> : null}
      </figure>
    )
  } catch {
    return (
      <pre className="mermaid-error" role="img" aria-label="Mermaid diagram unavailable">
        {code}
      </pre>
    )
  }
}
