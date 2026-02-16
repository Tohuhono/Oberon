# @oberoncms/core

## 0.17.1

### Patch Changes

- 53f1409: Refresh workspace dependencies to latest available versions with pnpm
  recursive update.

  Notable upgrades requiring follow-up migration work:
  - `flydrive` to v2
  - `react-dropzone` to v15
  - `@vercel/postgres` remains deprecated upstream

  Stability pins retained:
  - `eslint`/`@eslint/js` pinned to v9 for plugin compatibility
  - `@types/node` pinned to `24.10.1` for current Node 24 usage

- d78a3de: Migrate package publishing to npm trusted publishing with GitHub
  OIDC.
  - update release workflow permissions for OIDC token exchange
  - remove static `NPM_TOKEN` usage from publish job
  - enable npm provenance in CI and package publish metadata

- Updated dependencies [53f1409]
- Updated dependencies [d78a3de]
  - @tohuhono/ui@0.14.1
  - @tohuhono/utils@0.13.1

## 0.17.0

### Minor Changes

- 0c6f7a0: Bump minor package versions
- 0c6f7a0: Implement mock adapter

### Patch Changes

- 8774704: Add a monorepo assertion-safety lint rule and remove type assertion
  usage across non-UI packages.
  - Added `@typescript-eslint/consistent-type-assertions` to shared ESLint
    config to discourage `as`/angle-bracket assertions.
  - Replaced non-UI assertion sites with structural typing, runtime guards, and
    typed locals in core, sqlite, flydrive, puck-blocks, puck-rich-text, and
    create-oberon-app.
  - Kept behavior consistent while improving type correctness around server
    action unwrapping, JSON parsing, and runtime value narrowing.

- 10e7219: Migrate shared shadcn-based UI primitives from Radix component
  packages to Base UI.
  - Ported `avatar`, `button`, `checkbox`, `dialog`, `dropdown-menu`, `form`,
    `input-otp`, `label`, `navigation-menu`, `popover`, `radio-group`,
    `scroll-area`, `select`, `separator`, `switch`, `toast`, `tooltip`, and
    related integrations to Base UI while preserving local styling/structure.
  - Added compatibility shims for legacy `asChild` and `delayDuration` usage in
    existing consumers.
  - Updated UI package dependencies and applied a small core typing
    compatibility update for select change handlers.
  - Migrated the rich text toolbar dropdown menu internals from Radix to Base UI
    while preserving the existing local styling pattern.

- 62ead8b: chore: align Node runtime and CI to Node 24 with pnpm-managed
  versions
- 0054a4f: Cache `useLocalData` snapshots to prevent `useSyncExternalStore`
  warnings.
- a7653c1: Add package-level Tailwind source entrypoints and a published
  `@oberoncms/core/tailwind.css` entrypoint for app-level composition without
  optional package import failures.
- 38b6272: Fix Next.js error handling helpers and align storage adapters with
  updated driver contracts.
- 3fc23f9: Migrate Puck dependencies and imports from `@measured/puck` to
  `@puckeditor/core` and bump to the `0.21.x` line.

  Aligned CSS and import paths with the new package namespace and validated
  workspace check/build after migration.

- 1dfe98b: Silence dotenv loading output in the core adapter and tidy the pgsql
  init script.
- 8b774a8: Remove usage of autoprefixer from PostCSS configs and package
  devDependencies. Also includes related fixes:
  - Remove `autoprefixer` plugin entries from PostCSS configs in the playground,
    rich-text-demo and recipe-nextjs.
  - Remove `autoprefixer` devDependency entries from the affected packages.
  - ESLint flat-config fixes (avoid spreading plugin exports; add
    `settings.react.version = "detect"`).
  - Tailwind/PostCSS adjustments and replacement of unsupported
    `@apply border-border` with explicit `border-color` CSS.

  This is a small, non-breaking patch to clean up CSS build-time config and
  linter config.

- d51da69: Split shared repo configs into dedicated internal packages and
  migrate all consumers:
  - add `@config/eslint`, `@config/typescript`, and `@config/vite`
  - move workspace `eslint`, `tsconfig`, `tailwind`, and `vite` references to
    those packages
  - replace `@tohuhono/dev` with `@config/scripts` and keep only the `odt`
    tooling export
  - modernize package `exports` maps with explicit `types`/`default` conditions
  - simplify `@config/vite` to source export + typecheck-only workflow

- Updated dependencies [10e7219]
- Updated dependencies [62ead8b]
- Updated dependencies [a7653c1]
- Updated dependencies [0c6f7a0]
- Updated dependencies [1daa573]
- Updated dependencies [40a22ae]
- Updated dependencies [8b774a8]
- Updated dependencies [d51da69]
- Updated dependencies [40a22ae]
  - @tohuhono/ui@0.14.0
  - @tohuhono/utils@0.13.0

## 0.16.0

### Minor Changes

- a75ba57: Fixed the actionbar selector to work with the new overlay in puck@18

## 0.15.0

### Minor Changes

- bce6613: Bump dependencies

### Patch Changes

- 38a8da8: Bump dependencies for all packages
- Updated dependencies [38a8da8]
- Updated dependencies [bce6613]
  - @tohuhono/utils@0.12.0
  - @tohuhono/ui@0.13.0

## 0.14.0

### Minor Changes

- 22dd6fe: Bump @measured/puck to 16.2

### Patch Changes

- Updated dependencies [22dd6fe]
  - @tohuhono/utils@0.11.0
  - @tohuhono/ui@0.12.0

## 0.13.1

### Patch Changes

- 93ecf7f: More example components
- f81809b: Bump dependancies
- a49cf41: Bump dependancies
- Updated dependencies [f81809b]
- Updated dependencies [a49cf41]
  - @tohuhono/utils@0.10.1
  - @tohuhono/ui@0.11.2

## 0.13.0

### Minor Changes

- 9bb8cb7: Move all handlers to single api handler endpoint under cms

### Patch Changes

- 8b62b9d: Bump sample components to remove local image dependency
- b6d32fa: Move sample components into monorepo
- Updated dependencies [8b62b9d]
- Updated dependencies [b6d32fa]
  - @tohuhono/ui@0.11.1
  - @tohuhono/utils@0.10.0

## 0.12.0

### Minor Changes

- a8d2554: BREAKING CHANGE Removed initActions Removed initAdapter initOberon
  now returns an object with the intitialised adapter and handlers Clarified
  types - OberonActions is now OberonAdapter
- a8d2554: BREAKING CHANGE move all auth including login to Oberon Client

### Patch Changes

- Updated dependencies [a8d2554]
- Updated dependencies [a8d2554]
- Updated dependencies [f7f5adb]
  - @tohuhono/utils@0.10.0
  - @tohuhono/ui@0.11.0

## 0.11.1

### Patch Changes

- a2d1a58: Update documentation
- Updated dependencies [a2d1a58]
  - @tohuhono/utils@0.9.1
  - @tohuhono/ui@0.10.1

## 0.11.0

### Minor Changes

- d233d9a: Wrap server actions to retain error messages in production Add
  Toaster component to surface action errors
- 19e0f04: Move signOut to adapter
- 85f2f55: Create a development plugin

### Patch Changes

- 19e0f04: Move demo into documentation
- 634cc82: Improve error handling to support redirects
- Updated dependencies [d233d9a]
  - @tohuhono/utils@0.9.0
  - @tohuhono/ui@0.10.0

## 0.10.4

### Patch Changes

- e28293f: Fix create-oberon-app with development fallbacks
- 01fde22: Move development fallback to wrappers Move local sqlite to separate
  plugin

## 0.10.3

### Patch Changes

- 2aebcf6: Add welcome page during database initialisation

## 0.10.2

### Patch Changes

- b8ed573: Reorder type definitions for readability

## 0.10.1

### Patch Changes

- 9ce4e84: Improve developer tooling
- Updated dependencies [9ce4e84]
  - @tohuhono/utils@0.8.1
  - @tohuhono/ui@0.9.1

## 0.10.0

### Minor Changes

- 982a202: Moved initialisation for plugins into adapter prebuild function

### Patch Changes

- 982a202: fix turbo build filter
- 982a202: Fix build command
- 982a202: Fix dist not included in published packages
- Updated dependencies [982a202]
- Updated dependencies [982a202]
- Updated dependencies [982a202]
- Updated dependencies [982a202]
  - @tohuhono/utils@0.8.0
  - @tohuhono/ui@0.9.0

## 0.9.3

### Patch Changes

- d2ece32: fix turbo build filter
- d2ece32: Fix build command
- d2ece32: Fix dist not included in published packages
- Updated dependencies [d2ece32]
- Updated dependencies [d2ece32]
- Updated dependencies [d2ece32]
  - @tohuhono/utils@0.7.3
  - @tohuhono/ui@0.8.3

## 0.9.2

### Patch Changes

- f218952: Fix build command
- f218952: Fix dist not included in published packages
- Updated dependencies [f218952]
- Updated dependencies [f218952]
  - @tohuhono/utils@0.7.2
  - @tohuhono/ui@0.8.2

## 0.9.1

### Patch Changes

- d6e52e0: Fix dist not included in published packages
- Updated dependencies [d6e52e0]
  - @tohuhono/utils@0.7.1
  - @tohuhono/ui@0.8.1

## 0.9.0

### Minor Changes

- 693824e: Moved packages and added create-oberon-app

### Patch Changes

- Updated dependencies [693824e]
  - @tohuhono/utils@0.7.0
  - @tohuhono/ui@0.8.0

## 0.8.0

### Minor Changes

- 4767eb7: Moved plugins and renamed packages
- d13cecf: Change all adapters to be plugins
- e1761a0: Removed database adapters and implemented as plugins instead.
  Improved plugin system to better support database and other chaining plugins.
  Implemented auth as plugins.

### Patch Changes

- Updated dependencies [4767eb7]
- Updated dependencies [d13cecf]
  - @tohuhono/ui@0.7.0
  - @tohuhono/utils@0.6.0

## 0.7.0

### Minor Changes

- 26d9c91: Updated adapter-vercel-postgres for site config and version support
- 26d9c91: Added site manager page and page data migration functionality
- 26d9c91: BREAKING CHANGE changed sqlite columns storing json data to use new
  mode

### Patch Changes

- Updated dependencies [26d9c91]
- Updated dependencies [26d9c91]
  - @tohuhono/utils@0.5.0
  - @tohuhono/ui@0.6.0

## 0.6.0

### Minor Changes

- c6960f3: Implement Adapter Plugins Refactor OberonProvider Add cleanup for
  uploadthing image removal
- 2deb902: Added updatedAt and updatedBy to images Resolved uploadingthing type
  declaration error
- eae691f: CAUTION BREAKING CHANGE databases created before this patch will need
  to be manually updated added updatedAt and updatedBy cloumns reset the drizzle
  database migrations
- 4e6430b: Reverted to relative imports because typescript team refuses to
  transpile declaration files

### Patch Changes

- c6960f3: Fixing adapter plugin
- a5e6827: Publish button feedback
- 25bb5bf: Bump packages, improve View Page validation
- Updated dependencies [c6960f3]
- Updated dependencies [2deb902]
- Updated dependencies [4e6430b]
- Updated dependencies [a5e6827]
- Updated dependencies [25bb5bf]
  - @tohuhono/ui@0.5.0
  - @tohuhono/utils@0.4.0

## 0.5.1

### Patch Changes

- fcff95c: Bump nextauth version
  - @tohuhono/ui@0.4.0
  - @tohuhono/utils@0.3.0

## 0.5.0

### Minor Changes

- eec8abb: Move auth to core

### Patch Changes

- d251149: Removed components package
- Updated dependencies [eec8abb]
  - @tohuhono/utils@0.3.0
  - @tohuhono/ui@0.4.0

## 0.4.1

### Patch Changes

- 7e7aa38: Fix dependencies and server loading of rich-text
- Updated dependencies [7e7aa38]
  - @tohuhono/utils@0.2.1
  - @tohuhono/ui@0.3.1

## 0.4.0

### Minor Changes

- d4f6a5b: Publish dependant packages

### Patch Changes

- Updated dependencies [d4f6a5b]
  - @tohuhono/utils@0.2.0
  - @tohuhono/ui@0.3.0

## 0.3.0

### Minor Changes

- dd9dc69: Implement optimistic pages
- 39b03d3: Optimistically update the ui for oberon users
- 5a0a961: Update theme Propogate theme to preview iframe Correctly invalidate
  server side cache on page mutate Add createPage oberon action Add example
  dashboard to recipe (maybe remvoe later?)
- e10807b: Impliment role based authorization

### Patch Changes

- Updated dependencies [39b03d3]
- Updated dependencies [5a0a961]
  - @oberon/ui@0.2.0
  - @oberon/utils@0.1.0

## 0.2.0

### Minor Changes

- 63a21a9: Implemented Uploadthing Image Component. Next -> 14.2. Fixed turbo
  dev to correctly build dependencies. Changed from assets to images - this is a
  breaking change for oberon adapaters. Fixed dynamic tailwind to target preview
  iframe.

### Patch Changes

- Updated dependencies [63a21a9]
  - @oberon/utils@0.1.0
  - @oberon/ui@0.1.0

## 0.1.0

### Minor Changes

- a38fe03: Initial publish
