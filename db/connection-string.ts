const legacyVerifiedSslModes = new Set(['prefer', 'require', 'verify-ca'])

export function normalizeDatabaseUrl(connectionString: string) {
  const url = new URL(connectionString)
  const sslMode = url.searchParams.get('sslmode')?.toLowerCase()

  if (sslMode && legacyVerifiedSslModes.has(sslMode)) {
    url.searchParams.set('sslmode', 'verify-full')
  }

  return url.toString()
}
