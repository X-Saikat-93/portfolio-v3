# Saikat Das portfolio

An English-only `/en` portfolio for Saikat Das. The public site stays empty
where Saikat has not supplied real writing, photos, music, or books.

## Stack

- Next.js 16, React 19, TypeScript, and Tailwind CSS v4
- Neon/Postgres for CMS entries and media records
- Upstash Redis for shared admin mutation rate limiting
- SMTP contact notifications with a Neon-backed private inbox
- Cloudinary for the avatar, resume PDF, and future site media
- Better Auth owner authentication for `/admin` (admin-only; no public auth)
- Live GitHub data for `X-Saikat-93`

## Local setup

```bash
pnpm install
Copy-Item .env.example .env
pnpm dev
```

Add Neon, Cloudinary, Better Auth, Upstash, and SMTP values to `.env.local`.
Set `CONTACT_NOTIFICATION_EMAIL` to the other email address that should receive
a copy. Production admin mutations and contact submissions fail closed unless
the Upstash Redis REST URL and token are configured.
Run migrations with a migration-only credential:

```bash
pnpm db:migrate
```

Create the first owner account from a private shell. The command never exposes
a public registration screen:

```powershell
pnpm auth:bootstrap
```

The script reads `ADMIN_EMAIL` and `ADMIN_PASSWORD` from `.env`, generates its
bootstrap guard inside the process, and exits after creating the owner. Keep
`BETTER_AUTH_SECRET` at least 32 characters; `ADMIN_PASSWORD` is only needed
for this seed step and should not be deployed.

Upload the supplied avatar and resume from `/admin/media`. The repository also
contains an optimized local avatar preview so the halftone interaction can be
checked before Cloudinary is configured; Cloudinary takes precedence whenever
its public cloud name is present.

## Checks

```bash
pnpm typecheck
pnpm test:unit
pnpm build
```
