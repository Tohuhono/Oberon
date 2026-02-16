# @oberoncms/plugin-upload-thing

## 0.16.1

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

## 0.16.0

### Minor Changes

- 0c6f7a0: Bump minor package versions

### Patch Changes

- 62ead8b: chore: align Node runtime and CI to Node 24 with pnpm-managed
  versions
- a7653c1: Add package-level Tailwind source entrypoints and a published
  `@oberoncms/core/tailwind.css` entrypoint for app-level composition without
  optional package import failures.
- 3fc23f9: Migrate Puck dependencies and imports from `@measured/puck` to
  `@puckeditor/core` and bump to the `0.21.x` line.

  Aligned CSS and import paths with the new package namespace and validated
  workspace check/build after migration.

- d51da69: Split shared repo configs into dedicated internal packages and
  migrate all consumers:
  - add `@config/eslint`, `@config/typescript`, and `@config/vite`
  - move workspace `eslint`, `tsconfig`, `tailwind`, and `vite` references to
    those packages
  - replace `@tohuhono/dev` with `@config/scripts` and keep only the `odt`
    tooling export
  - modernize package `exports` maps with explicit `types`/`default` conditions
  - simplify `@config/vite` to source export + typecheck-only workflow

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

## 0.15.0

### Minor Changes

- a75ba57: Fixed the actionbar selector to work with the new overlay in puck@18

### Patch Changes

- Updated dependencies [a75ba57]
  - @oberoncms/core@0.16.0

## 0.14.0

### Minor Changes

- bce6613: Bump dependencies

### Patch Changes

- 38a8da8: Bump dependencies for all packages
- Updated dependencies [38a8da8]
- Updated dependencies [bce6613]
  - @oberoncms/core@0.15.0

## 0.13.0

### Minor Changes

- 22dd6fe: Bump @measured/puck to 16.2

### Patch Changes

- Updated dependencies [22dd6fe]
  - @oberoncms/core@0.14.0

## 0.12.1

### Patch Changes

- f81809b: Bump dependancies
- a49cf41: Bump dependancies
- Updated dependencies [93ecf7f]
- Updated dependencies [f81809b]
- Updated dependencies [a49cf41]
  - @oberoncms/core@0.13.1

## 0.12.0

### Minor Changes

- 9bb8cb7: Move all handlers to single api handler endpoint under cms

### Patch Changes

- Updated dependencies [9bb8cb7]
- Updated dependencies [8b62b9d]
- Updated dependencies [b6d32fa]
  - @oberoncms/core@0.13.0

## 0.11.0

### Minor Changes

- a8d2554: BREAKING CHANGE Removed initActions Removed initAdapter initOberon
  now returns an object with the intitialised adapter and handlers Clarified
  types - OberonActions is now OberonAdapter

### Patch Changes

- Updated dependencies [a8d2554]
- Updated dependencies [a8d2554]
  - @oberoncms/core@0.12.0

## 0.10.7

### Patch Changes

- a2d1a58: Update documentation
- Updated dependencies [a2d1a58]
  - @oberoncms/core@0.11.1

## 0.10.6

### Patch Changes

- Updated dependencies [d233d9a]
- Updated dependencies [19e0f04]
- Updated dependencies [19e0f04]
- Updated dependencies [85f2f55]
- Updated dependencies [634cc82]
  - @oberoncms/core@0.11.0

## 0.10.5

### Patch Changes

- Updated dependencies [e28293f]
- Updated dependencies [01fde22]
  - @oberoncms/core@0.10.4

## 0.10.4

### Patch Changes

- Updated dependencies [2aebcf6]
  - @oberoncms/core@0.10.3

## 0.10.3

### Patch Changes

- eae0eab: Fix create-oberon-app not installing plugin dependencies

## 0.10.2

### Patch Changes

- Updated dependencies [b8ed573]
  - @oberoncms/core@0.10.2

## 0.10.1

### Patch Changes

- 9ce4e84: Improve developer tooling
- Updated dependencies [9ce4e84]
  - @oberoncms/core@0.10.1

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
  - @oberoncms/core@0.10.0

## 0.9.3

### Patch Changes

- d2ece32: fix turbo build filter
- d2ece32: Fix build command
- d2ece32: Fix dist not included in published packages
- Updated dependencies [d2ece32]
- Updated dependencies [d2ece32]
- Updated dependencies [d2ece32]
  - @oberoncms/core@0.9.3

## 0.9.2

### Patch Changes

- f218952: Fix build command
- f218952: Fix dist not included in published packages
- Updated dependencies [f218952]
- Updated dependencies [f218952]
  - @oberoncms/core@0.9.2

## 0.9.1

### Patch Changes

- d6e52e0: Fix dist not included in published packages
- Updated dependencies [d6e52e0]
  - @oberoncms/core@0.9.1

## 0.9.0

### Minor Changes

- 693824e: Moved packages and added create-oberon-app

### Patch Changes

- Updated dependencies [693824e]
  - @oberoncms/core@0.9.0

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
- Updated dependencies [e1761a0]
  - @oberoncms/core@0.8.0

## 0.7.1

### Patch Changes

- e48bd75: Update dependencies

## 0.7.0

### Minor Changes

- 26d9c91: Updated adapter-vercel-postgres for site config and version support
- 26d9c91: Added site manager page and page data migration functionality

### Patch Changes

- Updated dependencies [26d9c91]
- Updated dependencies [26d9c91]
- Updated dependencies [26d9c91]
  - @oberoncms/core@0.7.0

## 0.6.0

### Minor Changes

- c6960f3: Implement Adapter Plugins Refactor OberonProvider Add cleanup for
  uploadthing image removal
- 2deb902: Added updatedAt and updatedBy to images Resolved uploadingthing type
  declaration error
- 4e6430b: Reverted to relative imports because typescript team refuses to
  transpile declaration files

### Patch Changes

- c6960f3: Fixing adapter plugin
- 25bb5bf: Bump packages, improve View Page validation
- Updated dependencies [c6960f3]
- Updated dependencies [c6960f3]
- Updated dependencies [2deb902]
- Updated dependencies [eae691f]
- Updated dependencies [4e6430b]
- Updated dependencies [a5e6827]
- Updated dependencies [25bb5bf]
  - @oberoncms/core@0.6.0

## 0.5.1

### Patch Changes

- Updated dependencies [fcff95c]
  - @oberoncms/core@0.5.1

## 0.5.0

### Minor Changes

- eec8abb: Move auth to core

### Patch Changes

- Updated dependencies [eec8abb]
- Updated dependencies [d251149]
  - @oberoncms/core@0.5.0

## 0.4.1

### Patch Changes

- 7e7aa38: Fix dependencies and server loading of rich-text
- Updated dependencies [7e7aa38]
  - @oberoncms/core@0.4.1

## 0.4.0

### Minor Changes

- d4f6a5b: Publish dependant packages

### Patch Changes

- Updated dependencies [d4f6a5b]
  - @oberoncms/core@0.4.0

## 0.3.0

### Minor Changes

- e10807b: Impliment role based authorization

### Patch Changes

- Updated dependencies [dd9dc69]
- Updated dependencies [39b03d3]
- Updated dependencies [5a0a961]
- Updated dependencies [e10807b]
  - @oberoncms/core@0.3.0

## 0.2.0

### Minor Changes

- 63a21a9: Implemented Uploadthing Image Component. Next -> 14.2. Fixed turbo
  dev to correctly build dependencies. Changed from assets to images - this is a
  breaking change for oberon adapaters. Fixed dynamic tailwind to target preview
  iframe.

### Patch Changes

- Updated dependencies [63a21a9]
  - @oberoncms/core@0.2.0

## 0.1.0

### Minor Changes

- a38fe03: Initial publish

### Patch Changes

- Updated dependencies [a38fe03]
  - @oberoncms/core@0.1.0
