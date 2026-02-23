# @oberon/docs

## 0.11.6

### Patch Changes

- @oberoncms/core@0.17.4
- @tohuhono/puck-blocks@0.13.4

## 0.11.5

### Patch Changes

- 5fcb1cd: Add Playwright e2e smoke tests for playground and docs
  - Configure e2e tests under `dev/test/e2e/` with shared build via globalSetup
  - Playground smoke tests: homepage, CMS route, 404 page
  - Docs smoke tests: homepage, docs index, CMS route, 404 page
  - Uses development plugin with SQLite for playground persistence
  - Add CI workflow (`call-playwright-e2e.yml`) wired into the CI pipeline
  - New scripts: `pnpm e2e` and `pnpm e2e:ui`

- d680fc0: Remove dead code: unused legacy Pages Router file, unused Welcome
  component duplicate, and unused import. Add noUnusedLocals/noUnusedParameters
  to recipe tsconfig to prevent future unused imports.
- fed3aa0: Switch Turbo from loose to strict env handling and explicitly model
  runtime env dependencies.
  - set `envMode` to `strict`
  - scope task `env` allowlists to app packages only (`apps/playground`,
    `apps/documentation`)
  - keep root turbo tasks env-agnostic so non-app packages are not invalidated
    by app env changes
  - remove redundant task-level `CI` declarations (covered by root `globalEnv`)
  - narrow app `build` env hashing to currently wired env dependencies to reduce
    unnecessary cache misses
  - keep test task env minimal while allowing required Playwright vars
  - expand env file hashing for app build inputs with package-local `.env*`

- Updated dependencies [fbad025]
- Updated dependencies [d383641]
- Updated dependencies [bcf3676]
- Updated dependencies [25706d7]
- Updated dependencies [8265abe]
- Updated dependencies [4a4ab91]
  - @oberoncms/core@0.17.3
  - @tohuhono/puck-blocks@0.13.3

## 0.11.4

### Patch Changes

- Updated dependencies [35b86e7]
  - @oberoncms/core@0.17.2
  - @tohuhono/puck-blocks@0.13.2

## 0.11.3

### Patch Changes

- Updated dependencies [53f1409]
- Updated dependencies [d78a3de]
  - @oberoncms/core@0.17.1
  - @tohuhono/puck-blocks@0.13.1

## 0.11.2

### Patch Changes

- cb8481e: Add agent workflow and repository documentation notes.
- 47984d0: Update agent workflow and repository guidance.
- 2694e84: Handle non-MDX paths in the docs route to avoid Nextra import errors.
- 2694e84: Avoid noisy module-not-found errors by short-circuiting Nextra page
  imports when a route has no mapped MDX file.
- 8b774a8: Run Next.js typegen before TypeScript checks and restore global route
  prop helpers.
- 1a4ce67: Remove the deprecated `@tohuhono/puck-rich-text` package and the
  `rich-text-demo` app from the monorepo.

  Also remove direct runtime/dependency references and switch `puck-blocks`
  example text rendering to native `richtext` fields. Also remove stale CI
  deploy/promote workflow jobs and quick-start references for the removed demo.

- Updated dependencies [8774704]
- Updated dependencies [10e7219]
- Updated dependencies [62ead8b]
- Updated dependencies [0054a4f]
- Updated dependencies [a7653c1]
- Updated dependencies [0c6f7a0]
- Updated dependencies [38b6272]
- Updated dependencies [3fc23f9]
- Updated dependencies [1dfe98b]
- Updated dependencies [8b774a8]
- Updated dependencies [1a4ce67]
- Updated dependencies [0c6f7a0]
- Updated dependencies [d51da69]
  - @oberoncms/core@0.17.0
  - @tohuhono/puck-blocks@0.13.0

## 0.11.1

### Patch Changes

- Updated dependencies [a75ba57]
- Updated dependencies [de10a55]
- Updated dependencies [314fa18]
  - @tohuhono/puck-rich-text@0.13.0
  - @tohuhono/puck-blocks@0.12.0
  - @oberoncms/core@0.16.0

## 0.11.0

### Minor Changes

- bce6613: Bump dependencies

### Patch Changes

- 38a8da8: Bump dependencies for all packages
- Updated dependencies [0b5aae0]
- Updated dependencies [38a8da8]
- Updated dependencies [bce6613]
  - @tohuhono/puck-rich-text@0.12.0
  - @tohuhono/puck-blocks@0.11.0
  - @oberoncms/core@0.15.0

## 0.10.0

### Minor Changes

- 22dd6fe: Bump @measured/puck to 16.2

### Patch Changes

- Updated dependencies [22dd6fe]
  - @tohuhono/puck-rich-text@0.11.0
  - @tohuhono/puck-blocks@0.10.0
  - @oberoncms/core@0.14.0

## 0.9.3

### Patch Changes

- f81809b: Bump dependancies
- f336edf: Move demo components to puck-components
- a49cf41: Bump dependancies
- Updated dependencies [93ecf7f]
- Updated dependencies [f81809b]
- Updated dependencies [f336edf]
- Updated dependencies [a49cf41]
- Updated dependencies [ed43e37]
  - @tohuhono/puck-blocks@0.9.2
  - @oberoncms/core@0.13.1
  - @tohuhono/puck-rich-text@0.10.0

## 0.9.2

### Patch Changes

- 8b62b9d: Bump sample components to remove local image dependency
- b6d32fa: Move sample components into monorepo
- Updated dependencies [9bb8cb7]
- Updated dependencies [8b62b9d]
- Updated dependencies [b6d32fa]
  - @oberoncms/core@0.13.0
  - @tohuhono/puck-blocks@0.9.1
  - @tohuhono/puck-rich-text@0.9.1

## 0.9.1

### Patch Changes

- Updated dependencies [635748a]
  - @tohuhono/puck-rich-text@0.9.1

## 0.9.0

### Minor Changes

- a8d2554: BREAKING CHANGE Removed initActions Removed initAdapter initOberon
  now returns an object with the intitialised adapter and handlers Clarified
  types - OberonActions is now OberonAdapter
- a8d2554: BREAKING CHANGE move all auth including login to Oberon Client

### Patch Changes

- Updated dependencies [a8d2554]
- Updated dependencies [a8d2554]
  - @tohuhono/puck-rich-text@0.9.0
  - @oberoncms/core@0.12.0

## 0.8.0

### Minor Changes

- d89bb71: fix export nested field

### Patch Changes

- a2d1a58: Update documentation
- Updated dependencies [a2d1a58]
  - @tohuhono/puck-rich-text@0.8.2
  - @oberoncms/core@0.11.1

## 0.7.0

### Minor Changes

- d233d9a: Wrap server actions to retain error messages in production Add
  Toaster component to surface action errors
- 19e0f04: Move signOut to adapter

### Patch Changes

- 19e0f04: Move demo into documentation
- Updated dependencies [d233d9a]
- Updated dependencies [19e0f04]
- Updated dependencies [19e0f04]
- Updated dependencies [85f2f55]
- Updated dependencies [634cc82]
  - @oberoncms/core@0.11.0

## 0.6.2

### Patch Changes

- e28293f: Fix create-oberon-app with development fallbacks
- 01fde22: Move development fallback to wrappers Move local sqlite to separate
  plugin

## 0.6.1

### Patch Changes

- b8ed573: Reorder type definitions for readability

## 0.6.0

### Minor Changes

- 693824e: Moved packages and added create-oberon-app

## 0.5.0

### Minor Changes

- 4767eb7: Moved plugins and renamed packages

## 0.4.0

### Minor Changes

- eec8abb: Move auth to core

## 0.3.1

### Patch Changes

- 7e7aa38: Fix dependencies and server loading of rich-text

## 0.3.0

### Minor Changes

- d4f6a5b: Publish dependant packages

## 0.2.0

### Minor Changes

- 63a21a9: Implemented Uploadthing Image Component. Next -> 14.2. Fixed turbo
  dev to correctly build dependencies. Changed from assets to images - this is a
  breaking change for oberon adapaters. Fixed dynamic tailwind to target preview
  iframe.
