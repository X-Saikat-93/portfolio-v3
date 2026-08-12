export default function GlobalLoading() {
  return (
    <main className="global-loading" aria-busy="true" aria-live="polite">
      <div className="global-loading-grid" aria-hidden="true" />
      <div className="global-loading-orbit" aria-hidden="true">
        <span className="global-loading-orbit-line global-loading-orbit-line-a" />
        <span className="global-loading-orbit-line global-loading-orbit-line-b" />
        <span className="global-loading-orbit-dot global-loading-orbit-dot-a" />
        <span className="global-loading-orbit-dot global-loading-orbit-dot-b" />
        <span className="global-loading-mark" aria-label="SD mark">
          SD
        </span>
      </div>
      <div className="global-loading-register">
        <span>Saikat Das</span>
        <span>Loading the next surface</span>
      </div>
    </main>
  )
}
