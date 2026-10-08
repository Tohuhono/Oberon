# @oberoncms/plugin-tailwind

## 0.21.0

### Minor Changes

- 1037113: Use one final Adapter throughout Plugin composition. Adapter hooks now receive a
  late-bound `getAdapter` function and object-shaped method payloads, while the Adapter exposes
  reusable `can`, `will`, and `whoWill` authorization capabilities for action orchestration.
  Framework action bridges now validate every action through an independently evolvable schema,
  including explicit undefined schemas for actions that currently have no payload.
- 1037113: Migrate Plugins to declarative phase-based definitions. Adapter hooks now initialize with
  the final composed adapter and preceding implementation, then receive the original method
  arguments. Plugin phase factories receive a late-bound Adapter getter, closure-bound Bootstrap
  hooks run sequentially, Handler factories receive the final augmented Adapter, and framework
  action entrypoints validate input before authorized actions call Adapter methods. Runtime setup
  now returns the Adapter directly through `initAdapter(config)`, with explicit
  `createActionHandler(adapter)` and `createRestHandler(adapter)` projections. Bootstrap remains an
  independent `bootstrapOberon(config)` lifecycle.

### Patch Changes

- Updated dependencies [1037113]
- Updated dependencies [1037113]
- Updated dependencies [1037113]
- Updated dependencies [2b4526a]
  - @oberoncms/core@0.21.0

## 0.20.0

### Minor Changes

- 4b794ca: Moved nextjs caching into the new nextjs plugin

### Patch Changes

- 7e48e64: Add follow-up updates for the Next.js decoupling work across docs and playground
  examples, and align SQLite/PostgreSQL adapters and plugin integration tests with the new core
  handler boundaries.
- 929bc33: Moved from prettier and eslint to oxc
- Updated dependencies [4b794ca]
- Updated dependencies [2f7a0c2]
- Updated dependencies [2f7a0c2]
- Updated dependencies [7e48e64]
- Updated dependencies [929bc33]
- Updated dependencies [5ff8413]
  - @oberoncms/core@0.20.0

## 0.19.1

### Patch Changes

- @oberoncms/core@0.19.1

## 0.19.0

### Minor Changes

- 20820f4: Promote the repo to the Better Auth model across core packages, plugins, docs, recipes,
  and app scaffolds.

  This release removes remaining Auth.js/NextAuth assumptions, standardizes auth adapter
  expectations, and aligns setup guidance around Better Auth as the supported path.

  Risks and implications:
  - Integrations still relying on Auth.js/NextAuth-specific behavior may require configuration and
    implementation updates.
  - Auth adapter implementations must match the updated user-table/auth contract expectations across
    sqlite and pgsql paths.
  - Existing user schemas with provider-specific fields may need to be reduced or remapped to the
    active Better Auth model.
  - Environment variables, callback handling, and session/user lifecycle behavior should be reviewed
    during upgrade to avoid auth regressions.

  Treat this as a coordinated upgrade across core, plugins, recipes, and app scaffolds rather than a
  piecemeal patch.

### Patch Changes

- Updated dependencies [1858e24]
- Updated dependencies [20820f4]
- Updated dependencies [65abaa0]
- Updated dependencies [fb4d240]
- Updated dependencies [65abaa0]
- Updated dependencies [65abaa0]
  - @oberoncms/core@0.19.0

## 0.18.1

### Patch Changes

- Updated dependencies [ad993d0]
- Updated dependencies [0e72818]
- Updated dependencies [6e8ba23]
  - @oberoncms/core@0.18.1

## 0.18.0

### Minor Changes

- 8109ea8: Add a dynamic Tailwind plugin, expose public plugin settings through the core adapter,
  and scaffold the Tailwind plugin into new apps.

### Patch Changes

- 8109ea8: Fix Tailwind compiler loading, seed the welcome block on initial pages, and make
  Playwright smoke report uploads rerun-safe.
- fc1747c: Refactor the tailwind plugin to simplify style syncing and serve immutable hashed css
  assets from path-based endpoints.
- Updated dependencies [a73560b]
- Updated dependencies [8109ea8]
- Updated dependencies [b654991]
- Updated dependencies [8109ea8]
- Updated dependencies [a4578f6]
- Updated dependencies [a011a89]
- Updated dependencies [28aa7e5]
- Updated dependencies [48de893]
- Updated dependencies [aa5371a]
- Updated dependencies [36a3b7e]
- Updated dependencies [237d393]
  - @oberoncms/core@0.18.0
