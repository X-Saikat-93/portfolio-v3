# Contributing

This repository is a personal portfolio. Contributions are welcome when they
improve the product without fabricating personal content, weakening the
owner-only boundary, or changing the established interaction language by
accident.

## Contribution contract

- Keep public routes and public copy under `/en` in English.
- Do not invent biography, resume, writing, books, music, photography,
  testimonials, or project facts.
- Keep `/admin` owner-protected. A browser cookie is not authorization; server
  loaders and API handlers must validate the Better Auth session again.
- Keep Cloudinary credentials, database credentials, SMTP passwords, Redis
  tokens, and Better Auth secrets on the server.
- Use Neon for actual CMS, media, collection, and contact records. Empty
  public collections are a valid state.
- Preserve the halftone portrait, reduced-motion behavior, route transitions,
  and dock navigation unless the change explicitly revises that contract.

## Local workflow

The supported toolchain is Node.js 22 or newer and pnpm 10.12.1.

```bash
pnpm install
```

Copy `.env.example` to `.env` for local configuration. UI-only work can use
the local avatar preview, while database, Cloudinary, authentication, Redis,
and SMTP flows require their corresponding provider values.

Run the smallest relevant check while iterating, then run the release suite
before opening a pull request:

```bash
pnpm typecheck
pnpm test:unit
pnpm test:security
pnpm build
pnpm audit:prod
```

`pnpm test:unit` covers the unit suite under `app`, `components`, `db`, and
`lib`. The suite excludes live tests. `pnpm build` also generates the runtime
assets used by the OG route.

## Database changes

Change `db/schema.ts`, generate a migration, review the SQL, and apply it with
the migration credential:

```bash
pnpm db:generate
pnpm db:migrate
```

`MIGRATION_DATABASE_URL` is preferred for migrations; `DATABASE_URL` is the
runtime connection. Never commit `.env`, credentials, or a provider export.
Do not edit an already-applied migration. Add a new migration for a follow-up
change and verify destructive operations against the intended database before
running them.

## Content and media changes

Public content must be supplied by the owner or an explicitly provided source.
Use the owner CMS for Markdown/MDX drafts and publish only records that are
intended to be public. Published images and the resume PDF belong in
Cloudinary; upload credentials and signed-upload logic remain server-only.

## Commit standard

Use a Conventional Commit subject with a meaningful scope:

```text
<type>(<scope>): <imperative summary>
```

The body should explain the reason for the change, its boundary, and the
verification performed. Keep each commit logically reviewable.

| Type | Use for |
| --- | --- |
| `feat` | User-visible capability or behavior |
| `fix` | Correctness or regression repair |
| `docs` | Documentation, policy, or repository guidance |
| `refactor` | Behavior-preserving structure changes |
| `test` | Coverage or test-harness changes |
| `chore` | Tooling, dependencies, or maintenance |
| `security` | Security boundary or hardening changes |

Example:

```text
docs(readme): document stack and repository signals

Add version-accurate stack badges, live GitHub repository signals, and a
Mermaid runtime map so the README exposes the project's technical surface at
a glance.
```

## Pull requests

Keep a pull request focused and describe:

- the user or maintainer problem being solved;
- the files and boundaries affected;
- migration, environment, or content implications;
- checks run and any provider-dependent checks not run;
- screenshots or a short recording for meaningful visual changes.

Do not include secrets, private owner records, generated build output, or
unrelated formatting churn.
