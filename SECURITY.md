# Security Policy

Security issues should be handled privately. Do not open a public issue with
credentials, exploit details, private contact submissions, or unpublished
portfolio material.

## Reporting

Use GitHub's private vulnerability reporting flow if it is enabled for this
repository. Otherwise, contact the repository owner privately through GitHub.
Include:

- a concise description and impact;
- affected route, component, dependency, or commit;
- reproducible steps or a minimal proof of concept;
- the environment and configuration assumptions;
- any suggested mitigation.

Remove secrets and personal data from logs, screenshots, and reproduction
projects. Do not probe production systems without explicit authorization.

## Security boundaries

- `/admin` and `/api/admin/*` require a valid Better Auth owner session. The
  configured owner email is checked server-side.
- Admin mutations pass through CSRF/origin and rate-limit protections before
  the mutation is executed.
- Public contact submissions are rate-limited through Upstash Redis in
  production; if the required production limiter is unavailable, the endpoint
  fails closed.
- Cloudinary signing uses server credentials. Only the resulting public media
  identifiers and delivery URLs may cross the browser boundary.
- `ADMIN_PASSWORD` is a one-time bootstrap input and must not be deployed.
- Database, SMTP, Redis, Cloudinary, and Better Auth secrets must remain in
  server-only environment variables.

## Local verification

Run the security-focused tests and production dependency audit when changing a
trust boundary:

```bash
pnpm test:security
pnpm audit:prod
```

The latest `main` line is the maintained code line. No separate release
support matrix or security response-time commitment is published at this
time.
