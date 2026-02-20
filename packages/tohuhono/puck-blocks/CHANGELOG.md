# @tohuhono/puck-blocks

## 0.13.3

### Patch Changes

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
  - @tohuhono/utils@0.14.0
  - @tohuhono/ui@0.14.3

## 0.13.2

### Patch Changes

- 35b86e7: Normalize package `repository.url` metadata to the canonical GitHub
  repository URL used in npm provenance validation.
- Updated dependencies [35b86e7]
  - @oberoncms/core@0.17.2
  - @tohuhono/ui@0.14.2
  - @tohuhono/utils@0.13.2

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

- Updated dependencies [53f1409]
- Updated dependencies [d78a3de]
  - @oberoncms/core@0.17.1
  - @tohuhono/ui@0.14.1
  - @tohuhono/utils@0.13.1

## 0.13.0

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
- a7653c1: Add package-level Tailwind source entrypoints and a published
  `@oberoncms/core/tailwind.css` entrypoint for app-level composition without
  optional package import failures.
- 3fc23f9: Migrate Puck dependencies and imports from `@measured/puck` to
  `@puckeditor/core` and bump to the `0.21.x` line.

  Aligned CSS and import paths with the new package namespace and validated
  workspace check/build after migration.

- 1a4ce67: Remove the deprecated `@tohuhono/puck-rich-text` package and the
  `rich-text-demo` app from the monorepo.

  Also remove direct runtime/dependency references and switch `puck-blocks`
  example text rendering to native `richtext` fields. Also remove stale CI
  deploy/promote workflow jobs and quick-start references for the removed demo.

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
- Updated dependencies [1daa573]
- Updated dependencies [38b6272]
- Updated dependencies [40a22ae]
- Updated dependencies [3fc23f9]
- Updated dependencies [1dfe98b]
- Updated dependencies [8b774a8]
- Updated dependencies [0c6f7a0]
- Updated dependencies [d51da69]
- Updated dependencies [40a22ae]
  - @oberoncms/core@0.17.0
  - @tohuhono/ui@0.14.0
  - @tohuhono/utils@0.13.0

## 0.12.0

### Minor Changes

- a75ba57: Fixed the actionbar selector to work with the new overlay in puck@18

### Patch Changes

- Updated dependencies [a75ba57]
- Updated dependencies [de10a55]
- Updated dependencies [314fa18]
  - @tohuhono/puck-rich-text@0.13.0
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
  - @oberoncms/core@0.15.0
  - @tohuhono/utils@0.12.0
  - @tohuhono/ui@0.13.0

## 0.10.0

### Minor Changes

- 22dd6fe: Bump @measured/puck to 16.2

### Patch Changes

- Updated dependencies [22dd6fe]
  - @tohuhono/puck-rich-text@0.11.0
  - @oberoncms/core@0.14.0
  - @tohuhono/utils@0.11.0
  - @tohuhono/ui@0.12.0

## 0.9.2

### Patch Changes

- 93ecf7f: More example components
- f81809b: Bump dependancies
- f336edf: Move demo components to puck-components
- a49cf41: Bump dependancies
- Updated dependencies [93ecf7f]
- Updated dependencies [f81809b]
- Updated dependencies [f336edf]
- Updated dependencies [a49cf41]
- Updated dependencies [ed43e37]
  - @oberoncms/core@0.13.1
  - @tohuhono/puck-rich-text@0.10.0
  - @tohuhono/utils@0.10.1
  - @tohuhono/ui@0.11.2

## 0.9.1

### Patch Changes

- b6d32fa: Move sample components into monorepo
- Updated dependencies [8b62b9d]
- Updated dependencies [b6d32fa]
  - @tohuhono/ui@0.11.1
  - @tohuhono/utils@0.10.0

## 0.9.0

### Minor Changes

- a8d2554: BREAKING CHANGE Removed initActions Removed initAdapter initOberon
  now returns an object with the intitialised adapter and handlers Clarified
  types - OberonActions is now OberonAdapter

### Patch Changes

- Updated dependencies [a8d2554]
- Updated dependencies [a8d2554]
- Updated dependencies [f7f5adb]
  - @tohuhono/ui@0.11.0

## 0.8.3

### Patch Changes

- a2d1a58: Update documentation
- Updated dependencies [a2d1a58]
  - @tohuhono/ui@0.10.1

## 0.8.2

### Patch Changes

- Updated dependencies [d233d9a]
  - @tohuhono/ui@0.10.0

## 0.8.1

### Patch Changes

- 9ce4e84: Improve developer tooling
- Updated dependencies [9ce4e84]
  - @tohuhono/ui@0.9.1

## 0.8.0

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
  - @tohuhono/ui@0.9.0

## 0.7.3

### Patch Changes

- d2ece32: fix turbo build filter
- d2ece32: Fix build command
- d2ece32: Fix dist not included in published packages
- Updated dependencies [d2ece32]
- Updated dependencies [d2ece32]
- Updated dependencies [d2ece32]
  - @tohuhono/ui@0.8.3

## 0.7.2

### Patch Changes

- f218952: Fix build command
- f218952: Fix dist not included in published packages
- Updated dependencies [f218952]
- Updated dependencies [f218952]
  - @tohuhono/ui@0.8.2

## 0.7.1

### Patch Changes

- d6e52e0: Fix dist not included in published packages
- Updated dependencies [d6e52e0]
  - @tohuhono/ui@0.8.1

## 0.7.0

### Minor Changes

- 693824e: Moved packages and added create-oberon-app

### Patch Changes

- Updated dependencies [693824e]
  - @tohuhono/ui@0.8.0

## 0.6.0

### Minor Changes

- 4767eb7: Moved plugins and renamed packages

### Patch Changes

- Updated dependencies [4767eb7]
  - @tohuhono/ui@0.7.0

## 0.5.1

### Patch Changes

- Updated dependencies [26d9c91]
- Updated dependencies [26d9c91]
  - @tohuhono/ui@0.6.0

## 0.5.0

### Minor Changes

- 4e6430b: Reverted to relative imports because typescript team refuses to
  transpile declaration files

### Patch Changes

- 25bb5bf: Bump packages, improve View Page validation
- Updated dependencies [c6960f3]
- Updated dependencies [4e6430b]
- Updated dependencies [a5e6827]
- Updated dependencies [25bb5bf]
  - @tohuhono/ui@0.5.0

## 0.4.0

### Minor Changes

- eec8abb: Move auth to core

### Patch Changes

- Updated dependencies [eec8abb]
  - @tohuhono/ui@0.4.0

## 0.3.1

### Patch Changes

- 7e7aa38: Fix dependencies and server loading of rich-text
- Updated dependencies [7e7aa38]
  - @tohuhono/ui@0.3.1

## 0.3.0

### Minor Changes

- d4f6a5b: Publish dependant packages

### Patch Changes

- Updated dependencies [d4f6a5b]
  - @tohuhono/ui@0.3.0

## 0.2.1

### Patch Changes

- Updated dependencies [39b03d3]
- Updated dependencies [5a0a961]
  - @oberon/ui@0.2.0

## 0.2.0

### Minor Changes

- 63a21a9: Implemented Uploadthing Image Component. Next -> 14.2. Fixed turbo
  dev to correctly build dependencies. Changed from assets to images - this is a
  breaking change for oberon adapaters. Fixed dynamic tailwind to target preview
  iframe.

### Patch Changes

- Updated dependencies [63a21a9]
  - @oberon/ui@0.1.0

## 0.1.0

### Minor Changes

- a38fe03: Initial publish
