# OberonCMS architecture

## High-level view

The monorepo centers around the Oberon adapter/plugin system used by Next.js
apps to render and edit CMS content.

## Core details

See `packages/oberoncms/core/AGENTS.md` for the core adapter/plugin design, data
flow, cache tags, and prebuild behavior.

## Playground reference wiring

- `apps/playground/oberon/adapter.ts` uses `mockPlugin` +
  `@oberoncms/plugin-development`.
- `apps/playground/app/(oberon)/cms/api/[...path]/route.tsx` exports handler
  methods.
- `apps/playground/app/(oberon)/cms/[[...path]]/page.tsx` renders
  `OberonProvider` with `adapter/actions/path`.
- `apps/playground/app/(oberon)/cms/[[...path]]/client.tsx` boots `OberonClient`
  with config.
