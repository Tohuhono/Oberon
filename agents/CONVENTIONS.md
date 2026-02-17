# Repository conventions

## Next.js + Oberon wiring

- Next.js App Router everywhere; CMS routes live under `app/(oberon)/cms/...`.
- App-specific Oberon wiring lives in `apps/<app>/oberon/`: `config.tsx`,
  `adapter.ts`, `actions.ts`, optional `send.ts`.
- Server actions pattern: `"use server"` + `wrap(adapter.<method>)`.
- `OberonConfig` commonly uses `withExamples` and plugin components (e.g.
  `Image` from `@oberoncms/plugin-uploadthing`).
- Core adapter conventions live in `packages/oberoncms/core/AGENTS.md`.

## Integrations

- Email sending: `apps/playground/oberon/send.ts` uses Resend (`RESEND_SECRET`,
  optional `EMAIL_FROM`).
- `USE_DEVELOPMENT_SEND_PLUGIN` disables Resend for local development.
