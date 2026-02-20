# create-oberon-app

## 0.10.2

### Patch Changes

- f24ecd0: Fix a Node.js compatibility issue in the scaffolder by resolving
  template/plugin paths by documenting and enforcing a Node.js runtime
  requirement of 22+ in the package metadata and README.
- 8265abe: Normalize package `repository.url` metadata to the canonical GitHub
  repository URL used in npm provenance validation.
- 4a4ab91: Standardize unit test scripts by introducing `test:unit` and making
  `test` call `test:unit`.
  - rename direct unit test command from `test` to `test:unit`
  - keep `test` as the entrypoint by delegating to `pnpm test:unit`
  - add root `test:unit` orchestration for consistent workspace-level unit-test
    invocation
  - preserve existing e2e-oriented test scripts

## 0.10.1

### Patch Changes

- 35b86e7: Normalize package `repository.url` metadata to the canonical GitHub
  repository URL used in npm provenance validation.

## 0.10.0

### Minor Changes

- 53f1409: Remove the deprecated Vercel Postgres adapter from generated project
  options.
  - remove `@oberoncms/plugin-vercel-postgres` from scaffolder dependencies
  - remove the `vercel-postgres` database choice from installer config

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

- d78a3de: Use pnpm-native command execution in repository automation.
  - replace `npx turbo` with `pnpm exec turbo` in changed-package script
  - replace workflow `npx vercel` usage with pnpm-based execution

## 0.9.0

### Minor Changes

- 0c6f7a0: Bump minor package versions

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

- 62ead8b: chore: align Node runtime and CI to Node 24 with pnpm-managed
  versions
- 1a4ce67: Include `plugins/**/*.ts` in `create-oberon-app` TypeScript config so
  plugin templates are typechecked.

  Also narrow unknown caught errors in the Sendgrid template to satisfy strict
  typechecking.

- d51da69: Split shared repo configs into dedicated internal packages and
  migrate all consumers:
  - add `@dev/eslint`, `@dev/typescript`, and `@dev/vite`
  - move workspace `eslint`, `tsconfig`, `tailwind`, and `vite` references to
    those packages
  - replace `@tohuhono/dev` with `@dev/scripts` and keep only the `odt` tooling
    export
  - modernize package `exports` maps with explicit `types`/`default` conditions
  - simplify `@dev/vite` to source export + typecheck-only workflow

## 0.8.0

### Minor Changes

- bce6613: Bump dependencies

### Patch Changes

- 38a8da8: Bump dependencies for all packages

## 0.7.0

### Minor Changes

- 22dd6fe: Bump @measured/puck to 16.2

## 0.6.1

### Patch Changes

- f81809b: Bump dependancies
- a49cf41: Bump dependancies

## 0.6.0

### Minor Changes

- 9bb8cb7: Move all handlers to single api handler endpoint under cms

## 0.5.1

### Patch Changes

- 94cadff: Fix create-oberon-app dependencies

## 0.5.0

### Minor Changes

- a8d2554: BREAKING CHANGE Removed initActions Removed initAdapter initOberon
  now returns an object with the intitialised adapter and handlers Clarified
  types - OberonActions is now OberonAdapter
- a8d2554: BREAKING CHANGE move all auth including login to Oberon Client

### Patch Changes

- Updated dependencies [a8d2554]
- Updated dependencies [a8d2554]
  - @oberon/recipe-nextjs@0.12.0

## 0.4.1

### Patch Changes

- a2d1a58: Update documentation
- ecdcc22: Fix default disable custom plugins in development

## 0.4.0

### Minor Changes

- d233d9a: Wrap server actions to retain error messages in production Add
  Toaster component to surface action errors
- 85f2f55: Create a development plugin

## 0.3.8

### Patch Changes

- e803dd5: Fix create oberon app missing dev dependency

## 0.3.7

### Patch Changes

- e28293f: Fix create-oberon-app with development fallbacks
- 01fde22: Move development fallback to wrappers Move local sqlite to separate
  plugin
- e8c2c24: Fix dynamically load client after initialisation

## 0.3.6

### Patch Changes

- 2aebcf6: Add welcome page during database initialisation

## 0.3.5

### Patch Changes

- 753fcc2: Fix vercel postgre installer

## 0.3.4

### Patch Changes

- 4eccc4b: Fix pnpm install @libsql/client

## 0.3.3

### Patch Changes

- eae0eab: Fix create-oberon-app not installing plugin dependencies

## 0.3.2

### Patch Changes

- 9ce4e84: Improve developer tooling
- 9ce4e84: Fix missing dependencies

## 0.3.1

### Patch Changes

- 638cb69: Fix adapter template location

## 0.3.0

### Minor Changes

- 982a202: Moved initialisation for plugins into adapter prebuild function

### Patch Changes

- 982a202: fix turbo build filter
- 982a202: Fix build command
- 982a202: Fix dist not included in published packages

## 0.2.3

### Patch Changes

- d2ece32: fix turbo build filter
- d2ece32: Fix build command
- d2ece32: Fix dist not included in published packages

## 0.2.2

### Patch Changes

- f218952: Fix build command
- f218952: Fix dist not included in published packages

## 0.2.1

### Patch Changes

- d6e52e0: Fix dist not included in published packages

## 0.2.0

### Minor Changes

- 2931919: Implement create-oberon-app
- 693824e: Moved packages and added create-oberon-app

## 0.1.0

### Minor Changes

- 4767eb7: Moved plugins and renamed packages

## 0.0.3

### Patch Changes

- 4ce94f8: Minor bump
