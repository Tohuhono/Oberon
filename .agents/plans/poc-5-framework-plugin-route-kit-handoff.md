# POC 5 Handoff: Framework Plugin Route Kit

## Purpose

Explore a design where core owns CMS route semantics and framework Plugins turn those semantics into
native framework route modules.

Use this when continuing the POC described as **Route Kit From Framework Plugin**.

## Suggested Skills

- `design-an-interface` for the route model and framework route factory API.
- `grill-with-docs` to decide whether new route-kit terms belong in `.agents/CONTEXT.md`.
- `tdd` once a single route flow is selected for proof, ideally unauthenticated `/cms/login`.

## Context To Read First

- `.agents/CONTEXT.md`
- `.agents/ARCHITECTURE.md`
- `packages/oberoncms/core/src/provider.tsx`
- `packages/oberoncms/core/src/render.tsx`
- `packages/oberoncms/core/src/lib/utils.ts`
- `packages/plugins/tanstack/src/context.ts`
- `apps/newground/src/routes/cms/$.tsx`
- `apps/newground/src/routes/$.tsx`

## Design Intent

Core should know what Oberon CMS routes mean. Framework Plugins should know how to express those
routes in TanStack, Next.js, or another host.

Core owns:

- CMS path parsing.
- Mapping paths to login, edit, preview, pages, images, users, and site actions.
- Context loading decisions.
- Redirect/notFound intent as framework-neutral route outcomes.
- Public Page render route semantics.
- CMS API handler semantics.

Framework Plugins own:

- TanStack `createFileRoute` option shape.
- TanStack loader/search/deps plumbing.
- TanStack `redirect()` and `notFound()` throwing.
- TanStack route cache/refresh behavior.
- Next.js page, route handler, redirect, notFound, and cache equivalents.

Apps own:

- Mount points required by file-based routing.
- App config and Puck client config.

## POC Shape

Create a core route model that returns framework-neutral outcomes rather than React route modules.

Sketch:

```ts
const model = createCmsRouteModel(runtime)

await model.loadCmsContext({ path, searchParams })
await model.loadPublicPage({ path })
model.resolveCmsPath(path)
```

Then make the TanStack Plugin adapt it:

```ts
export const Route = createFileRoute("/cms/$")(createTanstackCmsRoute({ model }))
```

The Plugin should translate core route outcomes into TanStack loader data, redirects, not-found
throws, and client route components.

## Questions To Resolve

- Is the route model created from `config`, `runtime`, or `adapter/actions`?
- Are redirect/notFound represented as thrown core errors, discriminated return values, or adapter
  methods?
- How does the route kit avoid importing client UI into server route modules?
- Should public rendering and CMS UI share one route model or separate models?
- Can the route kit cover both file-based TanStack routes and Next.js App Router without becoming
  lowest-common-denominator glue?

## Risks

- Framework route APIs are shaped very differently; a route kit may become either too abstract or
  too framework-specific.
- TanStack Start server functions prefer static imports. A route kit must respect compiler-visible
  boundaries.
- Route loader caching means search params used by the loader must be explicit, not blindly passed
  as an entire object.

## Current Warning

This POC should not start from the current newground route as ideal. It is useful evidence of pain:
the app currently knows too much about context loading, lazy client mounting, and Plugin wrappers.
The route kit should reduce that surface.
