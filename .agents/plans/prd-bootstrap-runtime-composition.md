## Problem Statement

Oberon currently exposes build-time initialization through the public Adapter as `prebuild`. That
means app prebuild scripts call the same Adapter shape that runtime code uses, and plugin
composition happens as one final adapter chain. Runtime-only decorators, especially the Next.js
cache and revalidation plugin, can end up wrapping calls made during build-time initialization even
though those calls run outside the Next.js request/runtime context.

This creates a conflict for users who need plugin-provided storage during build-time initialization
while also needing runtime-only framework integrations during request handling. Database access,
auth setup, welcome Page seeding, and Tailwind style assets all need bootstrap-time behavior, but
Next.js cache wrappers should only participate in Runtime composition.

## Solution

Introduce phase-aware plugin composition with two separate composition paths for one Oberon config.

Runtime composition builds the public Adapter and Handler returned by `initOberon`. Bootstrap
composition is used only by `bootstrapOberon` and prepares the same Oberon config without exposing
bootstrap behavior as an Adapter method. Plugins receive a phase context so runtime-only
integrations can skip bootstrap contributions while storage, auth, and style-asset plugins can
participate in both phases.

The existing client-safe component/editor setup becomes `OberonClientConfig`. The full server-side
`OberonConfig` contains `{ client, plugins }`, is created with `defineConfig`, and is consumed by
both `initOberon` and `bootstrapOberon`. Generated Starter apps keep component/editor config
separate from server-only plugin config.

## User Stories

1. As an Oberon Starter app author, I want prebuild scripts to call `bootstrapOberon`, so that
   build-time initialization no longer depends on public Adapter lifecycle methods.
2. As an Oberon Starter app author, I want runtime routes to call `initOberon`, so that serving
   requests composes only the runtime Adapter and Handler.
3. As an Oberon Starter app author, I want one server-side Oberon config shared by runtime and
   bootstrap entrypoints, so that I do not duplicate plugin lists.
4. As an Oberon Starter app author, I want client-safe component/editor config to be separate from
   server-only plugin config, so that render and editor code can import component config without
   importing plugin implementations.
5. As an Oberon Starter app author, I want generated apps to follow the new config split, so that
   new projects start with the correct runtime/bootstrap boundary.
6. As an Oberon Starter app author, I want the package script to remain named `prebuild`, so that
   existing package lifecycle tooling and Turbo task wiring keep their external meaning.
7. As an Oberon Starter app author, I want `prebuild` to be only a package task name, so that it is
   not confused with an Oberon Adapter capability.
8. As an Oberon runtime consumer, I want the public Adapter to exclude bootstrap behavior, so that
   runtime code only exposes CMS operations used while serving requests.
9. As an Oberon runtime consumer, I want `initOberon` to return one Adapter and one Handler, so that
   the public runtime contract stays easy to understand.
10. As an Oberon runtime consumer, I want Handler composition to happen only during Runtime
    composition, so that Bootstrap composition does not create unused HTTP surfaces.
11. As an Oberon runtime consumer, I want runtime plugin metadata to remain phase-agnostic, so that
    plugins are not marked disabled merely because they skip bootstrap contributions.
12. As a plugin author, I want plugins to receive `phase: "bootstrap" | "runtime"`, so that I can
    decide which contributions belong in each composition.
13. As a plugin author, I want adapter contributions to participate in both phases by default, so
    that storage, auth, send, and style-asset plugins can remain simple unless they need
    phase-specific behavior.
14. As a plugin author, I want runtime-only plugins to skip bootstrap adapter contributions, so that
    they do not construct or execute runtime-only wrappers during Oberon bootstrap.
15. As a plugin author, I want bootstrap behavior to be a top-level `bootstrap(next)` hook, so that
    lifecycle work is not modeled as a public Adapter method.
16. As a plugin author, I want the `bootstrap(next)` hook to compose middleware-style, so that I can
    choose whether my bootstrap work runs before or after earlier plugin bootstrap work.
17. As a plugin author, I want `bootstrap(next)` to preserve plugin ordering semantics, so that a
    plugin can depend on adapter capabilities contributed by earlier plugins.
18. As a database plugin author, I want database migrations to run during Oberon bootstrap, so that
    storage is ready before core or other plugins read and write data.
19. As a database plugin author, I want database adapter methods to participate in Bootstrap
    composition, so that bootstrap code can use plugin-provided storage instead of core hardcoding
    database behavior.
20. As an auth plugin author, I want master User seeding to run during Oberon bootstrap, so that
    initial admin setup remains available outside request handling.
21. As an auth plugin author, I want runtime auth handlers to remain runtime-only, so that bootstrap
    does not initialize HTTP handlers it cannot use.
22. As a Tailwind Plugin author, I want Tailwind style assets to be generated during Oberon
    bootstrap, so that build-time output can include styles derived from published Page content.
23. As a Tailwind Plugin author, I want Tailwind runtime hooks to continue wrapping Page writes, so
    that style assets stay synchronized after runtime mutations.
24. As a Next.js plugin author, I want cache and revalidation wrappers to run only during Runtime
    composition, so that Oberon bootstrap does not call Next.js runtime APIs outside their supported
    context.
25. As a Next.js Starter app user, I want `bootstrapOberon` to avoid Next.js cache wrappers, so that
    build-time initialization can run reliably before `next build`.
26. As a recipe maintainer, I want Recipes to generate `OberonClientConfig` and full `OberonConfig`
    separately, so that Starter app imports are clear and safe.
27. As a Playground maintainer, I want the Playground to use the same bootstrap/runtime split as
    generated Starter apps, so that repo-owned development flows exercise the real project shape.
28. As a Documentation app maintainer, I want existing CMS/render behavior to keep working after the
    config split, so that documentation routes can continue to import only client-safe config where
    appropriate.
29. As a create-oberon-app maintainer, I want generated adapter files to import full server-side
    Oberon config, so that runtime composition uses the same plugin list as bootstrap.
30. As a create-oberon-app maintainer, I want generated prebuild files to import full server-side
    Oberon config, so that bootstrap composition does not import runtime composition.
31. As a CMS user, I want the welcome Page to still be created on first bootstrap, so that fresh
    installations retain their current first-run experience.
32. As a CMS user, I want welcome Page initialization to run after plugin bootstrap work, so that
    storage migrations and plugin setup complete before the Page is seeded.
33. As a CMS user, I want welcome Page seeding to use Bootstrap composition, so that plugins such as
    Tailwind can still observe and react to the Page write.
34. As an Oberon maintainer, I want no compatibility shim for `adapter.prebuild`, so that pre-beta
    APIs move cleanly to the new lifecycle model.
35. As an Oberon maintainer, I want TypeScript to make old `adapter.prebuild` usage fail, so that
    recipes, apps, plugins, and tests migrate completely.
36. As an Oberon maintainer, I want root exports to include `defineConfig`, so that app config files
    can use the conventional config helper name.
37. As an Oberon maintainer, I want bootstrap and runtime behavior documented in domain language, so
    that future changes use the same mental model.
38. As an Oberon maintainer, I want the implementation to respect the Bootstrap and Runtime
    composition ADR, so that future readers understand why composition is split.
39. As an implementation agent, I want behavior-level tests around runtime-only and bootstrap-only
    behavior, so that the phase split is protected from regressions.
40. As an implementation agent, I want final validation through the repo root validation script, so
    that lint, types, build, and tests agree with the new contract.

## Implementation Decisions

- Split composition into two public entrypoints: `initOberon(config)` for Runtime composition and
  `bootstrapOberon(config)` for Oberon bootstrap.
- Keep Runtime composition responsible for returning the public Adapter and Handler.
- Keep Bootstrap composition private to `bootstrapOberon`; do not return or expose a bootstrap
  Adapter.
- Remove bootstrap behavior from the public Adapter contract.
- Remove `prebuild` from plugin adapter contracts with no compatibility shim.
- Introduce `OberonClientConfig` for the existing client-safe component/editor configuration.
- Redefine `OberonConfig` as the full server-side configuration containing `{ client, plugins }`.
- Export `defineConfig` from the root core package as the helper for full `OberonConfig` values.
- Update runtime code that currently expects component/editor config to use `OberonClientConfig`.
- Update runtime/bootstrap composition APIs to accept the full `OberonConfig` directly.
- Pass plugin phase as a second argument to plugins: `phase: "bootstrap" | "runtime"`.
- Keep adapter contributions phase-neutral by default; plugins that ignore phase contribute as they
  do today in both compositions.
- Treat handlers as runtime-only by definition; Bootstrap composition must not collect or compile
  plugin handlers.
- Keep plugin version and disabled metadata phase-agnostic, using Runtime composition as the public
  source of truth.
- Add a top-level plugin `bootstrap(next)` hook for lifecycle work.
- Compose plugin bootstrap hooks middleware-style so later plugins can wrap earlier bootstrap work
  and choose whether to call `next()` before or after their own work.
- Preserve plugin ordering semantics so a plugin sees the adapter capabilities contributed before it
  in the ordered plugin list.
- Move database migration hooks from adapter `prebuild` methods to plugin `bootstrap(next)` hooks.
- Move auth master User seeding from adapter `prebuild` methods to plugin `bootstrap(next)` hooks.
- Move Tailwind style asset generation from adapter `prebuild` methods to plugin `bootstrap(next)`
  hooks while keeping runtime Page write synchronization.
- Make the Next.js plugin return runtime-only cache and revalidation wrappers; it should not
  construct those wrappers for Bootstrap composition.
- Keep core welcome Page initialization in core bootstrap for this PRD.
- Run core welcome Page initialization after the composed plugin bootstrap chain.
- Seed the welcome Page through Bootstrap composition so phase-aware plugin adapter wrappers can
  participate.
- Keep package and Turbo task names such as `prebuild` unchanged; only the Oberon API changes.
- Update repo-owned apps, Recipes, and create-oberon-app generated output to use `client.config.tsx`
  for `OberonClientConfig` and server-only `config.ts` for full `OberonConfig`.
- Ensure the server-only config module imports plugin implementations and is not used by client-only
  code.
- Update app prebuild scripts to call `bootstrapOberon(config)` instead of importing the runtime
  Adapter.
- Update app adapter modules to call `initOberon(config)` and export the runtime Adapter and
  Handler.
- Update documentation and architecture notes where they currently describe `adapter.prebuild()`.
- Add changesets as required for breaking public API changes across affected packages.

## Testing Decisions

- Test external behavior at the highest seam available: prefer `initOberon`, `bootstrapOberon`,
  plugin package public exports, generated app output, and Recipe behavior over internal helper
  tests.
- Do not test implementation details such as private reducer state or exact local function
  boundaries unless they become the public seam for the behavior.
- Add core composition tests proving Runtime composition compiles handlers and Bootstrap composition
  does not.
- Add core composition tests proving `bootstrapOberon` runs plugin bootstrap hooks in middleware
  order and preserves before/after control around `next()`.
- Add core composition tests proving `bootstrapOberon` runs core welcome Page initialization after
  plugin bootstrap work.
- Add type-level or compile-time coverage proving public Adapter no longer exposes
  bootstrap/prebuild behavior.
- Add tests showing plugin phase context is passed as `bootstrap` during `bootstrapOberon` and
  `runtime` during `initOberon`.
- Add tests showing disabled/version metadata remains based on Runtime composition and is not
  affected by a plugin skipping bootstrap contributions.
- Add Next.js plugin tests or integration coverage proving runtime cache wrappers are contributed in
  Runtime composition and skipped in Bootstrap composition.
- Add database plugin tests proving migrations moved to the plugin `bootstrap(next)` hook and still
  run before later bootstrap work that needs storage.
- Add auth plugin tests proving master User seeding still runs during bootstrap and no longer relies
  on Adapter `prebuild`.
- Add Tailwind Plugin tests proving Tailwind style assets are generated during bootstrap and
  page-write synchronization remains active at runtime.
- Add create-oberon-app tests proving generated Starter apps contain the split client/full config
  shape and use `bootstrapOberon` in prebuild scripts.
- Add Recipe or Playground coverage proving prebuild scripts do not import the runtime adapter
  module just to run bootstrap.
- Use existing Vitest seams for pure composition and plugin behavior when framework runtime is not
  required.
- Use existing create-oberon-app test coverage for generated file output.
- Use existing Playwright or higher-level validation only when runtime app behavior needs coverage
  beyond unit-level composition tests.
- Final validation should run from the repo root with `pnpm validate`.

## Out of Scope

- Designing a generic host cache abstraction beyond the phase-aware plugin boundary.
- Supporting old `adapter.prebuild` or plugin adapter `prebuild` as a compatibility path.
- Making separate user-authored plugin lists for bootstrap and runtime.
- Moving welcome Page ownership into the development plugin or a new starter-content plugin.
- Renaming package/Turbo lifecycle scripts away from `prebuild`.
- Reworking Tailwind style asset ownership beyond preserving bootstrap generation and runtime
  synchronization.
- Changing database schemas or persisted Site state shape except where required by existing
  migrations.
- Reworking auth behavior beyond moving bootstrap-time master User seeding to the new hook.
- Changing public rendering, CMS editor UI, or Puck component behavior outside the config type
  rename/import updates.

## Further Notes

The ADR for Bootstrap and Runtime composition is accepted context for this PRD. The implementation
should preserve the core constraint that database and storage capabilities remain plugin-provided in
both phases while runtime-only framework integrations do not run during Oberon bootstrap.

The clean breaking migration is intentional because Oberon is pre-beta. Type errors in existing
in-repo usages are desirable during implementation if they reveal lingering old lifecycle
assumptions.
