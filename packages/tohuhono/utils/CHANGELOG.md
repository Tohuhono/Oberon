# @oberon/utils

## 0.13.1

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

## 0.13.0

### Minor Changes

- 0c6f7a0: Bump minor package versions

### Patch Changes

- 62ead8b: chore: align Node runtime and CI to Node 24 with pnpm-managed
  versions
- d51da69: Split shared repo configs into dedicated internal packages and
  migrate all consumers:
  - add `@config/eslint`, `@config/typescript`, and `@config/vite`
  - move workspace `eslint`, `tsconfig`, `tailwind`, and `vite` references to
    those packages
  - replace `@tohuhono/dev` with `@config/scripts` and keep only the `odt`
    tooling export
  - modernize package `exports` maps with explicit `types`/`default` conditions
  - simplify `@config/vite` to source export + typecheck-only workflow

- 40a22ae: Remove UI type assertions for Base UI class names and keep
  type-safety intact.
  - Replaced `as` assertions in `@tohuhono/ui` components with structural typing
    and runtime guards.
  - Updated button/form/toaster internals to avoid unsafe assertions while
    preserving behavior.
  - Enhanced `cn` in `@tohuhono/utils` to support state-based className
    functions used by Base UI primitives.

## 0.12.0

### Minor Changes

- bce6613: Bump dependencies

### Patch Changes

- 38a8da8: Bump dependencies for all packages

## 0.11.0

### Minor Changes

- 22dd6fe: Bump @measured/puck to 16.2

## 0.10.1

### Patch Changes

- f81809b: Bump dependancies
- a49cf41: Bump dependancies

## 0.10.0

### Minor Changes

- a8d2554: BREAKING CHANGE Removed initActions Removed initAdapter initOberon
  now returns an object with the intitialised adapter and handlers Clarified
  types - OberonActions is now OberonAdapter

## 0.9.1

### Patch Changes

- a2d1a58: Update documentation

## 0.9.0

### Minor Changes

- d233d9a: Wrap server actions to retain error messages in production Add
  Toaster component to surface action errors

## 0.8.1

### Patch Changes

- 9ce4e84: Improve developer tooling

## 0.8.0

### Minor Changes

- 982a202: Moved initialisation for plugins into adapter prebuild function

### Patch Changes

- 982a202: fix turbo build filter
- 982a202: Fix build command
- 982a202: Fix dist not included in published packages

## 0.7.3

### Patch Changes

- d2ece32: fix turbo build filter
- d2ece32: Fix build command
- d2ece32: Fix dist not included in published packages

## 0.7.2

### Patch Changes

- f218952: Fix build command
- f218952: Fix dist not included in published packages

## 0.7.1

### Patch Changes

- d6e52e0: Fix dist not included in published packages

## 0.7.0

### Minor Changes

- 693824e: Moved packages and added create-oberon-app

## 0.6.0

### Minor Changes

- 4767eb7: Moved plugins and renamed packages
- d13cecf: Change all adapters to be plugins

## 0.5.0

### Minor Changes

- 26d9c91: Updated adapter-vercel-postgres for site config and version support
- 26d9c91: Added site manager page and page data migration functionality

## 0.4.0

### Minor Changes

- 2deb902: Added updatedAt and updatedBy to images Resolved uploadingthing type
  declaration error
- 4e6430b: Reverted to relative imports because typescript team refuses to
  transpile declaration files

## 0.3.0

### Minor Changes

- eec8abb: Move auth to core

## 0.2.1

### Patch Changes

- 7e7aa38: Fix dependencies and server loading of rich-text

## 0.2.0

### Minor Changes

- d4f6a5b: Publish dependant packages

## 0.1.0

### Minor Changes

- 63a21a9: Implemented Uploadthing Image Component. Next -> 14.2. Fixed turbo
  dev to correctly build dependencies. Changed from assets to images - this is a
  breaking change for oberon adapaters. Fixed dynamic tailwind to target preview
  iframe.
