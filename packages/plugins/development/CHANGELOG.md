# @oberoncms/plugin-development

## 0.7.2

### Patch Changes

- 35b86e7: Normalize package `repository.url` metadata to the canonical GitHub
  repository URL used in npm provenance validation.
- Updated dependencies [35b86e7]
  - @oberoncms/core@0.17.2
  - @oberoncms/sqlite@0.7.2

## 0.7.1

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
  - @oberoncms/sqlite@0.7.1

## 0.7.0

### Minor Changes

- 0c6f7a0: Bump minor package versions

### Patch Changes

- 62ead8b: chore: align Node runtime and CI to Node 24 with pnpm-managed
  versions
- 1a4ce67: Include root `*.config.ts` files in package TypeScript configs so
  config files are typechecked.

  Also update drizzle config typing to the current `drizzle-kit` `dialect` field
  to keep checks passing.

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
- Updated dependencies [1a4ce67]
- Updated dependencies [a7653c1]
- Updated dependencies [0c6f7a0]
- Updated dependencies [38b6272]
- Updated dependencies [3fc23f9]
- Updated dependencies [1dfe98b]
- Updated dependencies [8b774a8]
- Updated dependencies [0c6f7a0]
- Updated dependencies [d51da69]
  - @oberoncms/core@0.17.0
  - @oberoncms/sqlite@0.7.0

## 0.6.0

### Minor Changes

- a75ba57: Fixed the actionbar selector to work with the new overlay in puck@18

### Patch Changes

- Updated dependencies [a75ba57]
  - @oberoncms/sqlite@0.6.0
  - @oberoncms/core@0.16.0

## 0.5.0

### Minor Changes

- bce6613: Bump dependencies

### Patch Changes

- 38a8da8: Bump dependencies for all packages
- Updated dependencies [38a8da8]
- Updated dependencies [bce6613]
  - @oberoncms/sqlite@0.5.0
  - @oberoncms/core@0.15.0

## 0.4.0

### Minor Changes

- 22dd6fe: Bump @measured/puck to 16.2

### Patch Changes

- Updated dependencies [22dd6fe]
  - @oberoncms/sqlite@0.4.0
  - @oberoncms/core@0.14.0

## 0.3.2

### Patch Changes

- f81809b: Bump dependancies
- a49cf41: Bump dependancies
- Updated dependencies [93ecf7f]
- Updated dependencies [f81809b]
- Updated dependencies [a49cf41]
  - @oberoncms/core@0.13.1
  - @oberoncms/sqlite@0.3.2

## 0.3.1

### Patch Changes

- Updated dependencies [9bb8cb7]
- Updated dependencies [8b62b9d]
- Updated dependencies [b6d32fa]
  - @oberoncms/core@0.13.0
  - @oberoncms/sqlite@0.3.1

## 0.3.0

### Minor Changes

- a8d2554: BREAKING CHANGE Removed initActions Removed initAdapter initOberon
  now returns an object with the intitialised adapter and handlers Clarified
  types - OberonActions is now OberonAdapter
- a8d2554: BREAKING CHANGE move all auth including login to Oberon Client

### Patch Changes

- Updated dependencies [a8d2554]
- Updated dependencies [a8d2554]
  - @oberoncms/sqlite@0.3.0
  - @oberoncms/core@0.12.0

## 0.2.1

### Patch Changes

- Updated dependencies [a2d1a58]
  - @oberoncms/core@0.11.1
  - @oberoncms/sqlite@0.2.1

## 0.2.0

### Minor Changes

- 19e0f04: Move signOut to adapter
- 85f2f55: Create a development plugin

### Patch Changes

- Updated dependencies [d233d9a]
- Updated dependencies [19e0f04]
- Updated dependencies [19e0f04]
- Updated dependencies [85f2f55]
- Updated dependencies [634cc82]
  - @oberoncms/core@0.11.0
  - @oberoncms/sqlite@0.2.0
