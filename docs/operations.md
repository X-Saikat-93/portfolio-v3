# Operations

This document covers the configuration and one-time operations needed to run
the portfolio. `.env.example` remains the authoritative variable list.

## Configuration matrix

| Area | Variables | Boundary |
| --- | --- | --- |
| Runtime database | `DATABASE_URL` | Server-only Neon/Postgres connection |
| Migrations | `MIGRATION_DATABASE_URL` | Private migration command; falls back to `DATABASE_URL` |
| Cloudinary delivery | `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, public IDs | Browser-safe delivery configuration |
| Cloudinary management | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `CLOUDINARY_UPLOAD_FOLDER` | Server-only signed upload configuration |
| Owner auth | `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `ADMIN_EMAIL` | Server auth and owner authorization |
| Bootstrap | `ADMIN_PASSWORD` | Private one-time bootstrap input; never deploy |
| Rate limiting | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, limit/window values | Server-only mutation and contact controls |
| Contact delivery | `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM_EMAIL`, `CONTACT_NOTIFICATION_EMAIL` | Server-only notification path |
| Canonical origin | `PUBLIC_SITE_URL` | Metadata, feeds, and canonical URL generation |

Keep `.env` out of git. Public Cloudinary identifiers are not credentials;
API keys, API secrets, and signed-upload operations are credentials.

## First-time setup

```bash
pnpm install
pnpm db:migrate
pnpm auth:bootstrap
```

Run the migration with the intended `MIGRATION_DATABASE_URL`. Run the bootstrap
command from a private shell with `ADMIN_EMAIL` and `ADMIN_PASSWORD` loaded;
the command creates the first owner and exits. Remove or unset the bootstrap
password after use.

## Release checks

Before a production deployment or significant route change:

```bash
pnpm typecheck
pnpm test:unit
pnpm test:security
pnpm build
pnpm audit:prod
```

The build generates OG runtime fonts and verifies the production bundle. The
repository currently has no checked-in CI workflow, and `vercel.json` disables
Git-based automatic deployments; trigger deployments through the explicitly
chosen deployment path.

## Safe change rules

- Treat a database migration as forward-only once applied. Roll back by
  shipping a compensating migration, not by rewriting migration history.
- Keep credentials out of browser bundles, logs, screenshots, and commit
  messages.
- Verify Cloudinary public IDs and media records together before publishing a
  new asset.
- Do not publish CMS or collection records merely to make an empty page look
  populated.
- When a provider is unavailable, prefer the existing fail-closed or
  empty-safe behavior over a local bypass that changes production semantics.
