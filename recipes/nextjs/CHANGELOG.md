# oberon-cms-example

## 0.16.0

### Minor Changes

- 0c6f7a0: Bump minor package versions

### Patch Changes

- 62ead8b: chore: align Node runtime and CI to Node 24 with pnpm-managed versions
- 8b774a8: Run Next.js typegen before TypeScript checks and restore global route prop
  helpers.
- 8b774a8: Remove usage of autoprefixer from PostCSS configs and package devDependencies.
  Also includes related fixes:
  - Remove `autoprefixer` plugin entries from PostCSS configs in the playground,
    rich-text-demo and recipe-nextjs.
  - Remove `autoprefixer` devDependency entries from the affected packages.
  - ESLint flat-config fixes (avoid spreading plugin exports; add
    `settings.react.version = "detect"`).
  - Tailwind/PostCSS adjustments and replacement of unsupported
    `@apply border-border` with explicit `border-color` CSS.

  This is a small, non-breaking patch to clean up CSS build-time config and linter
  config.

- 1a4ce67: Remove the deprecated `@tohuhono/puck-rich-text` package and the
  `rich-text-demo` app from the monorepo.

  Also remove direct runtime/dependency references and switch `puck-blocks`
  example text rendering to native `richtext` fields. Also remove stale CI
  deploy/promote workflow jobs and quick-start references for the removed demo.

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
  - @oberoncms/plugin-development@0.7.0

## 0.15.1

### Patch Changes

- Updated dependencies [a75ba57]
  - @oberoncms/plugin-development@0.6.0
  - @oberoncms/core@0.16.0

## 0.15.0

### Minor Changes

- bce6613: Bump dependencies

### Patch Changes

- 38a8da8: Bump dependencies for all packages
- Updated dependencies [38a8da8]
- Updated dependencies [bce6613]
  - @oberoncms/plugin-development@0.5.0
  - @oberoncms/core@0.15.0

## 0.14.0

### Minor Changes

- 22dd6fe: Bump @measured/puck to 16.2

### Patch Changes

- Updated dependencies [22dd6fe]
  - @oberoncms/plugin-development@0.4.0
  - @oberoncms/core@0.14.0

## 0.13.1

### Patch Changes

- f81809b: Bump dependancies
- a49cf41: Bump dependancies
- Updated dependencies [93ecf7f]
- Updated dependencies [f81809b]
- Updated dependencies [a49cf41]
  - @oberoncms/core@0.13.1
  - @oberoncms/plugin-development@0.3.2

## 0.13.0

### Minor Changes

- 9bb8cb7: Move all handlers to single api handler endpoint under cms

### Patch Changes

- 8b62b9d: Bump sample components to remove local image dependency
- Updated dependencies [9bb8cb7]
- Updated dependencies [8b62b9d]
- Updated dependencies [b6d32fa]
  - @oberoncms/core@0.13.0
  - @oberoncms/plugin-development@0.3.1

## 0.12.0

### Minor Changes

- a8d2554: BREAKING CHANGE Removed initActions Removed initAdapter initOberon now returns
  an object with the intitialised adapter and handlers Clarified types -
  OberonActions is now OberonAdapter
- a8d2554: BREAKING CHANGE move all auth including login to Oberon Client

### Patch Changes

- Updated dependencies [a8d2554]
- Updated dependencies [a8d2554]
  - @oberoncms/plugin-development@0.3.0
  - @oberoncms/core@0.12.0

## 0.11.1

### Patch Changes

- Updated dependencies [a2d1a58]
  - @oberoncms/core@0.11.1
  - @oberoncms/plugin-development@0.2.1

## 0.11.0

### Minor Changes

- d233d9a: Wrap server actions to retain error messages in production
  Add Toaster component to surface action errors
- 19e0f04: Move signOut to adapter
- 85f2f55: Create a development plugin

### Patch Changes

- 634cc82: Improve error handling to support redirects
- Updated dependencies [d233d9a]
- Updated dependencies [19e0f04]
- Updated dependencies [19e0f04]
- Updated dependencies [85f2f55]
- Updated dependencies [634cc82]
  - @oberoncms/core@0.11.0
  - @oberoncms/plugin-development@0.2.0

## 0.10.8

### Patch Changes

- e803dd5: Fix create oberon app missing dev dependency

## 0.10.7

### Patch Changes

- 3d8e16b: Fix tsx regression for unqualified imports in sub modules
  - @oberoncms/core@0.10.4
  - @oberoncms/plugin-sqlite@0.1.1

## 0.10.6

### Patch Changes

- e28293f: Fix create-oberon-app with development fallbacks
- 01fde22: Move development fallback to wrappers
  Move local sqlite to separate plugin
- Updated dependencies [e28293f]
- Updated dependencies [01fde22]
- Updated dependencies [e8c2c24]
  - @oberoncms/core@0.10.4
  - @oberoncms/plugin-sqlite@0.1.1

## 0.10.5

### Patch Changes

- 2aebcf6: Add welcome page during database initialisation
- Updated dependencies [2aebcf6]
  - @oberoncms/core@0.10.3

## 0.10.4

### Patch Changes

- 753fcc2: Fix vercel postgre installer

## 0.10.3

### Patch Changes

- eae0eab: Fix create-oberon-app not installing plugin dependencies

## 0.10.2

### Patch Changes

- Updated dependencies [b8ed573]
  - @oberoncms/core@0.10.2
  - @oberoncms/plugin-turso@0.11.2

## 0.10.1

### Patch Changes

- 9ce4e84: Improve developer tooling
- Updated dependencies [9ce4e84]
- Updated dependencies [9ce4e84]
  - @oberoncms/plugin-turso@0.11.1
  - @oberoncms/core@0.10.1

## 0.10.0

### Minor Changes

- 982a202: Moved initialisation for plugins into adapter prebuild function

### Patch Changes

- 982a202: fix turbo build filter
- 982a202: Fix build command
- Updated dependencies [982a202]
- Updated dependencies [982a202]
- Updated dependencies [982a202]
- Updated dependencies [982a202]
  - @oberoncms/core@0.10.0
  - @tohuhono/utils@0.8.0

## 0.9.3

### Patch Changes

- d2ece32: fix turbo build filter
- d2ece32: Fix build command
- Updated dependencies [d2ece32]
- Updated dependencies [d2ece32]
- Updated dependencies [d2ece32]
  - @oberoncms/core@0.9.3
  - @tohuhono/utils@0.7.3

## 0.9.2

### Patch Changes

- f218952: Fix build command
- Updated dependencies [f218952]
- Updated dependencies [f218952]
  - @oberoncms/core@0.9.2
  - @tohuhono/utils@0.7.2

## 0.9.1

### Patch Changes

- Updated dependencies [d6e52e0]
  - @oberoncms/core@0.9.1
  - @tohuhono/utils@0.7.1

## 0.9.0

### Minor Changes

- 2931919: Implement create-oberon-app
- 693824e: Moved packages and added create-oberon-app

### Patch Changes

- Updated dependencies [693824e]
  - @oberoncms/core@0.9.0
  - @tohuhono/utils@0.7.0

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
  - @oberoncms/plugin-turso@0.9.0
  - @oberoncms/core@0.8.0

## 0.7.1

### Patch Changes

- Updated dependencies [e48bd75]
  - @oberoncms/plugin-uploadthing@0.7.1

## 0.7.0

### Minor Changes

- 26d9c91: Updated adapter-vercel-postgres for site config and version support
- 26d9c91: Added site manager page and page data migration functionality

### Patch Changes

- Updated dependencies [26d9c91]
- Updated dependencies [26d9c91]
- Updated dependencies [26d9c91]
  - @oberoncms/plugin-turso@0.8.0
  - @oberoncms/plugin-uploadthing@0.7.0
  - @oberoncms/core@0.7.0

## 0.6.0

### Minor Changes

- c6960f3: Implement Adapter Plugins
  Refactor OberonProvider
  Add cleanup for uploadthing image removal
- eae691f: CAUTION BREAKING CHANGE
  databases created before this patch will need to be manually updated
  added updatedAt and updatedBy cloumns
  reset the drizzle database migrations

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
  - @oberoncms/plugin-turso@0.7.0
  - @oberoncms/plugin-uploadthing@0.6.0
  - @oberoncms/core@0.6.0
  - @tohuhono/puck-rich-text@0.5.0

## 0.5.0

### Minor Changes

- 77f07d0: Added Vercel Postgres adapter

### Patch Changes

- Updated dependencies [77f07d0]
- Updated dependencies [fcff95c]
  - @oberoncms/plugin-turso@0.6.0
  - @oberoncms/core@0.5.1
  - @oberoncms/plugin-uploadthing@0.5.1
  - @tohuhono/puck-rich-text@0.4.0

## 0.4.0

### Minor Changes

- eec8abb: Move auth to core

### Patch Changes

- d251149: Removed components package
- Updated dependencies [eec8abb]
- Updated dependencies [d251149]
  - @oberoncms/plugin-turso@0.5.0
  - @oberoncms/plugin-uploadthing@0.5.0
  - @oberoncms/core@0.5.0
  - @tohuhono/puck-rich-text@0.4.0

## 0.3.3

### Patch Changes

- 9cb9f27: Testing changeset app
- 541adb0: Test changeset app

## 0.3.2

### Patch Changes

- 7e7aa38: Fix dependencies and server loading of rich-text
- Updated dependencies [7e7aa38]
  - @oberoncms/plugin-turso@0.4.1
  - @oberoncms/plugin-uploadthing@0.4.1
  - @oberoncms/components@0.3.1
  - @oberoncms/auth@0.4.1
  - @oberoncms/core@0.4.1
  - @tohuhono/puck-rich-text@0.3.1

## 0.3.1

### Patch Changes

- Updated dependencies [d4f6a5b]
  - @oberoncms/plugin-turso@0.4.0
  - @oberoncms/plugin-uploadthing@0.4.0
  - @oberoncms/components@0.3.0
  - @oberoncms/auth@0.4.0
  - @oberoncms/core@0.4.0

## 0.3.0

### Minor Changes

- 5a0a961: Update theme
  Propogate theme to preview iframe
  Correctly invalidate server side cache on page mutate
  Add createPage oberon action
  Add example dashboard to recipe (maybe remvoe later?)
- e10807b: Impliment role based authorization

### Patch Changes

- Updated dependencies [dd9dc69]
- Updated dependencies [39b03d3]
- Updated dependencies [5a0a961]
- Updated dependencies [e10807b]
  - @oberoncms/plugin-turso@0.3.0
  - @oberoncms/core@0.3.0
  - @oberoncms/plugin-uploadthing@0.3.0
  - @oberoncms/auth@0.3.0
  - @oberoncms/components@0.2.1

## 0.2.0

### Minor Changes

- 63a21a9: Implemented Uploadthing Image Component.
  Next -> 14.2.
  Fixed turbo dev to correctly build dependencies.
  Changed from assets to images - this is a breaking change for oberon adapaters.
  Fixed dynamic tailwind to target preview iframe.

### Patch Changes

- Updated dependencies [63a21a9]
  - @oberoncms/plugin-turso@0.2.0
  - @oberoncms/plugin-uploadthing@0.2.0
  - @oberoncms/components@0.2.0
  - @oberoncms/auth@0.2.0
  - @oberoncms/core@0.2.0
