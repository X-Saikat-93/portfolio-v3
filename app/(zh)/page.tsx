// The root request is redirected by proxy.ts before this fallback renders.
// Keeping the segment render-free avoids Cache Components validating a
// navigation exception during prerendering.
export default function RootFallback() {
  return null
}
