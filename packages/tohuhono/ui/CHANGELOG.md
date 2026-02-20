# @oberon/ui

## 0.14.4

### Patch Changes

- Updated dependencies [39d2f88]
  - @dev/scripts@0.1.2
  - @dev/vite@0.1.2
  - @tohuhono/utils@0.14.0

## 0.14.3

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
- Updated dependencies [25706d7]
- Updated dependencies [8265abe]
- Updated dependencies [4a4ab91]
  - @dev/vite@0.1.2
  - @tohuhono/utils@0.14.0

## 0.14.2

### Patch Changes

- 35b86e7: Normalize package `repository.url` metadata to the canonical GitHub
  repository URL used in npm provenance validation.
- Updated dependencies [35b86e7]
  - @tohuhono/utils@0.13.2

## 0.14.1

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
  - @tohuhono/utils@0.13.1

## 0.14.0

### Minor Changes

- 0c6f7a0: Bump minor package versions

### Patch Changes

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
- a7653c1: Add package-level Tailwind source entrypoints and a published
  `@oberoncms/core/tailwind.css` entrypoint for app-level composition without
  optional package import failures.
- 1daa573: Fix theme editor style injection to avoid passing non-boolean
  `jsx`/`global` attributes to the DOM under Next.js 16 + Turbopack, and remove
  the direct `styled-jsx` dependency from `@tohuhono/ui`.
- 40a22ae: Adopt React 19 ref-as-prop patterns across UI components by removing
  `forwardRef` wrappers.
  - Replaced `forwardRef` usage in component wrappers with plain function
    components.
  - Updated component prop types to `ComponentPropsWithRef<...>` where refs
    should be accepted.
  - Kept runtime behavior and component structure intact while simplifying the
    public API surface.

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
  - add `@dev/eslint`, `@dev/typescript`, and `@dev/vite`
  - move workspace `eslint`, `tsconfig`, `tailwind`, and `vite` references to
    those packages
  - replace `@tohuhono/dev` with `@dev/scripts` and keep only the `odt` tooling
    export
  - modernize package `exports` maps with explicit `types`/`default` conditions
  - simplify `@dev/vite` to source export + typecheck-only workflow

- 40a22ae: Remove UI type assertions for Base UI class names and keep
  type-safety intact.
  - Replaced `as` assertions in `@tohuhono/ui` components with structural typing
    and runtime guards.
  - Updated button/form/toaster internals to avoid unsafe assertions while
    preserving behavior.
  - Enhanced `cn` in `@tohuhono/utils` to support state-based className
    functions used by Base UI primitives.

- Updated dependencies [62ead8b]
- Updated dependencies [0c6f7a0]
- Updated dependencies [d51da69]
- Updated dependencies [40a22ae]
  - @tohuhono/utils@0.13.0
  - @dev/scripts@0.1.1
  - @dev/eslint@0.1.1
  - @dev/typescript@0.1.1
  - @dev/vite@0.1.1

## 0.13.0

### Minor Changes

- bce6613: Bump dependencies

### Patch Changes

- 38a8da8: Bump dependencies for all packages
- Updated dependencies [38a8da8]
- Updated dependencies [bce6613]
  - @tohuhono/utils@0.12.0
  - @tohuhono/dev@0.13.0

## 0.12.0

### Minor Changes

- 22dd6fe: Bump @measured/puck to 16.2

### Patch Changes

- Updated dependencies [22dd6fe]
  - @tohuhono/utils@0.11.0
  - @tohuhono/dev@0.12.0

## 0.11.2

### Patch Changes

- f81809b: Bump dependancies
- a49cf41: Bump dependancies
- Updated dependencies [f81809b]
- Updated dependencies [f336edf]
- Updated dependencies [a49cf41]
  - @tohuhono/utils@0.10.1
  - @tohuhono/dev@0.11.1

## 0.11.1

### Patch Changes

- 8b62b9d: Bump sample components to remove local image dependency
- b6d32fa: Move sample components into monorepo
- Updated dependencies [9bb8cb7]
- Updated dependencies [8b62b9d]
  - @tohuhono/dev@0.11.0
  - @tohuhono/utils@0.10.0

## 0.11.0

### Minor Changes

- a8d2554: BREAKING CHANGE Removed initActions Removed initAdapter initOberon
  now returns an object with the intitialised adapter and handlers Clarified
  types - OberonActions is now OberonAdapter
- a8d2554: BREAKING CHANGE move all auth including login to Oberon Client

### Patch Changes

- f7f5adb: Update default theme
- Updated dependencies [a8d2554]
  - @tohuhono/utils@0.10.0

## 0.10.1

### Patch Changes

- a2d1a58: Update documentation
- Updated dependencies [a2d1a58]
  - @tohuhono/utils@0.9.1

## 0.10.0

### Minor Changes

- d233d9a: Wrap server actions to retain error messages in production Add
  Toaster component to surface action errors

### Patch Changes

- Updated dependencies [d233d9a]
  - @tohuhono/utils@0.9.0

## 0.9.1

### Patch Changes

- 9ce4e84: Improve developer tooling
- Updated dependencies [9ce4e84]
  - @tohuhono/utils@0.8.1

## 0.9.0

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

## 0.8.3

### Patch Changes

- d2ece32: fix turbo build filter
- d2ece32: Fix build command
- d2ece32: Fix dist not included in published packages
- Updated dependencies [d2ece32]
- Updated dependencies [d2ece32]
- Updated dependencies [d2ece32]
  - @tohuhono/utils@0.7.3

## 0.8.2

### Patch Changes

- f218952: Fix build command
- f218952: Fix dist not included in published packages
- Updated dependencies [f218952]
- Updated dependencies [f218952]
  - @tohuhono/utils@0.7.2

## 0.8.1

### Patch Changes

- d6e52e0: Fix dist not included in published packages
- Updated dependencies [d6e52e0]
  - @tohuhono/utils@0.7.1

## 0.8.0

### Minor Changes

- 693824e: Moved packages and added create-oberon-app

### Patch Changes

- Updated dependencies [693824e]
  - @tohuhono/utils@0.7.0

## 0.7.0

### Minor Changes

- 4767eb7: Moved plugins and renamed packages

### Patch Changes

- Updated dependencies [4767eb7]
- Updated dependencies [d13cecf]
  - @tohuhono/utils@0.6.0

## 0.6.0

### Minor Changes

- 26d9c91: Updated adapter-vercel-postgres for site config and version support
- 26d9c91: Added site manager page and page data migration functionality

### Patch Changes

- Updated dependencies [26d9c91]
- Updated dependencies [26d9c91]
  - @tohuhono/utils@0.5.0

## 0.5.0

### Minor Changes

- 4e6430b: Reverted to relative imports because typescript team refuses to
  transpile declaration files

### Patch Changes

- c6960f3: Fixing adapter plugin
- a5e6827: Publish button feedback
- 25bb5bf: Bump packages, improve View Page validation
- Updated dependencies [2deb902]
- Updated dependencies [4e6430b]
  - @tohuhono/utils@0.4.0

## 0.4.0

### Minor Changes

- eec8abb: Move auth to core

### Patch Changes

- Updated dependencies [eec8abb]
  - @tohuhono/utils@0.3.0

## 0.3.1

### Patch Changes

- 7e7aa38: Fix dependencies and server loading of rich-text
- Updated dependencies [7e7aa38]
  - @tohuhono/utils@0.2.1

## 0.3.0

### Minor Changes

- d4f6a5b: Publish dependant packages

### Patch Changes

- Updated dependencies [d4f6a5b]
  - @tohuhono/utils@0.2.0

## 0.2.0

### Minor Changes

- 39b03d3: Optimistically update the ui for oberon users
- 5a0a961: Update theme Propogate theme to preview iframe Correctly invalidate
  server side cache on page mutate Add createPage oberon action Add example
  dashboard to recipe (maybe remvoe later?)

### Patch Changes

- @oberon/utils@0.1.0

## 0.1.0

### Minor Changes

- 63a21a9: Implemented Uploadthing Image Component. Next -> 14.2. Fixed turbo
  dev to correctly build dependencies. Changed from assets to images - this is a
  breaking change for oberon adapaters. Fixed dynamic tailwind to target preview
  iframe.

### Patch Changes

- Updated dependencies [63a21a9]
  - @oberon/utils@0.1.0
