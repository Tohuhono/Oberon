# @oberoncms/plugin-flydrive

## 0.8.3

### Patch Changes

- 01fa4b5: Fix silent data loss in deleteImage operations. Previously,
  Promise.allSettled silently swallowed errors from both storage and database
  deletions, causing users to see success even when operations failed. Now
  properly handles errors by collecting failures and throwing an AggregateError,
  ensuring users are aware of partial failures that require admin intervention.
- 1a7415a: Fix infinite loop in getImageSize() that could hang the application
  when image size cannot be determined. The function now tries once and falls
  back to default size on error, instead of looping forever on a static buffer.
- 8265abe: Normalize package `repository.url` metadata to the canonical GitHub
  repository URL used in npm provenance validation.
- 4a4ab91: Standardize unit test scripts by introducing `test:unit` and making
  `test` call `test:unit`.
  - rename direct unit test command from `test` to `test:unit`
  - keep `test` as the entrypoint by delegating to `pnpm test:unit`
  - add root `test:unit` orchestration for consistent workspace-level unit-test
    invocation
  - preserve existing e2e-oriented test scripts

- Updated dependencies [fbad025]
- Updated dependencies [d383641]
- Updated dependencies [bcf3676]
- Updated dependencies [25706d7]
- Updated dependencies [8265abe]
- Updated dependencies [4a4ab91]
  - @oberoncms/core@0.17.3

## 0.8.2

### Patch Changes

- 35b86e7: Normalize package `repository.url` metadata to the canonical GitHub
  repository URL used in npm provenance validation.
- Updated dependencies [35b86e7]
  - @oberoncms/core@0.17.2

## 0.8.1

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
  - @oberoncms/core@0.17.1

## 0.8.0

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
- 38b6272: Fix Next.js error handling helpers and align storage adapters with
  updated driver contracts.
- 3fc23f9: Migrate Puck dependencies and imports from `@measured/puck` to
  `@puckeditor/core` and bump to the `0.21.x` line.

  Aligned CSS and import paths with the new package namespace and validated
  workspace check/build after migration.

- d51da69: Split shared repo configs into dedicated internal packages and
  migrate all consumers:
  - add `@dev/eslint`, `@dev/typescript`, and `@dev/vite`
  - move workspace `eslint`, `tsconfig`, `tailwind`, and `vite` references to
    those packages
  - replace `@tohuhono/dev` with `@dev/scripts` and keep only the `odt` tooling
    export
  - modernize package `exports` maps with explicit `types`/`default` conditions
  - simplify `@dev/vite` to source export + typecheck-only workflow

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
- Updated dependencies [0c6f7a0]
- Updated dependencies [d51da69]
  - @oberoncms/core@0.17.0

## 0.7.0

### Minor Changes

- a75ba57: Fixed the actionbar selector to work with the new overlay in puck@18

### Patch Changes

- Updated dependencies [a75ba57]
  - @oberoncms/core@0.16.0

## 0.6.0

### Minor Changes

- bce6613: Bump dependencies

### Patch Changes

- 38a8da8: Bump dependencies for all packages
- Updated dependencies [38a8da8]
- Updated dependencies [bce6613]
  - @oberoncms/core@0.15.0

## 0.5.0

### Minor Changes

- 22dd6fe: Bump @measured/puck to 16.2

### Patch Changes

- Updated dependencies [22dd6fe]
  - @oberoncms/core@0.14.0

## 0.4.1

### Patch Changes

- f81809b: Bump dependancies
- a49cf41: Bump dependancies
- Updated dependencies [93ecf7f]
- Updated dependencies [f81809b]
- Updated dependencies [a49cf41]
  - @oberoncms/core@0.13.1

## 0.4.0

### Minor Changes

- 9bb8cb7: Move all handlers to single api handler endpoint under cms

### Patch Changes

- 8b62b9d: Bump sample components to remove local image dependency
- 1219464: update flydrive handlers
- 7f48d1e: support vercel blob
- Updated dependencies [9bb8cb7]
- Updated dependencies [8b62b9d]
- Updated dependencies [b6d32fa]
  - @oberoncms/core@0.13.0

## 0.3.1

### Patch Changes

- eed0622: fix import trace, use contract type instead

## 0.3.0

### Minor Changes

- a8d2554: BREAKING CHANGE Removed initActions Removed initAdapter initOberon
  now returns an object with the intitialised adapter and handlers Clarified
  types - OberonActions is now OberonAdapter

### Patch Changes

- Updated dependencies [a8d2554]
- Updated dependencies [a8d2554]
  - @oberoncms/core@0.12.0

## 0.2.0

### Minor Changes

- d89bb71: fix export nested field

### Patch Changes

- a2d1a58: Update documentation
- Updated dependencies [a2d1a58]
  - @oberoncms/core@0.11.1

## 0.1.3

### Patch Changes

- Updated dependencies [d233d9a]
- Updated dependencies [19e0f04]
- Updated dependencies [19e0f04]
- Updated dependencies [85f2f55]
- Updated dependencies [634cc82]
  - @oberoncms/core@0.11.0

## 0.1.2

### Patch Changes

- e28293f: Fix create-oberon-app with development fallbacks
- 01fde22: Move development fallback to wrappers Move local sqlite to separate
  plugin
- Updated dependencies [e28293f]
- Updated dependencies [01fde22]
  - @oberoncms/core@0.10.4

## 0.1.1

### Patch Changes

- Updated dependencies [2aebcf6]
  - @oberoncms/core@0.10.3

## 0.1.0

### Minor Changes

- 322e153: Support cloud and filesystem providers using flydrive plugin

### Patch Changes

- Updated dependencies [b8ed573]
  - @oberoncms/core@0.10.2
