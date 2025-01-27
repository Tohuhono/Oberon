# @oberoncms/plugin-vercel-postgres

## 0.11.1

### Patch Changes

- Updated dependencies [a75ba57]
  - @oberoncms/core@0.16.0
  - @oberoncms/plugin-pgsql@0.8.1

## 0.11.0

### Minor Changes

- bce6613: Bump dependencies

### Patch Changes

- 38a8da8: Bump dependencies for all packages
- Updated dependencies [38a8da8]
- Updated dependencies [bce6613]
  - @oberoncms/core@0.15.0
  - @oberoncms/plugin-pgsql@0.8.0

## 0.10.0

### Minor Changes

- 22dd6fe: Bump @measured/puck to 16.2

### Patch Changes

- Updated dependencies [22dd6fe]
  - @oberoncms/core@0.14.0
  - @oberoncms/plugin-pgsql@0.7.0

## 0.9.2

### Patch Changes

- f81809b: Bump dependancies
- a49cf41: Bump dependancies
- Updated dependencies [93ecf7f]
- Updated dependencies [f81809b]
- Updated dependencies [a49cf41]
  - @oberoncms/core@0.13.1
  - @oberoncms/plugin-pgsql@0.6.2

## 0.9.1

### Patch Changes

- Updated dependencies [9bb8cb7]
- Updated dependencies [8b62b9d]
- Updated dependencies [b6d32fa]
- Updated dependencies [1219464]
  - @oberoncms/core@0.13.0
  - @oberoncms/plugin-pgsql@0.6.1

## 0.9.0

### Minor Changes

- a8d2554: BREAKING CHANGE Removed initActions Removed initAdapter initOberon
  now returns an object with the intitialised adapter and handlers Clarified
  types - OberonActions is now OberonAdapter

### Patch Changes

- Updated dependencies [a8d2554]
- Updated dependencies [a8d2554]
  - @oberoncms/core@0.12.0
  - @oberoncms/plugin-pgsql@0.6.0

## 0.8.1

### Patch Changes

- a2d1a58: Update documentation
- Updated dependencies [a2d1a58]
  - @oberoncms/core@0.11.1
  - @oberoncms/plugin-pgsql@0.5.1

## 0.8.0

### Minor Changes

- d233d9a: Wrap server actions to retain error messages in production Add
  Toaster component to surface action errors
- 19e0f04: Move signOut to adapter
- 85f2f55: Create a development plugin

### Patch Changes

- 19e0f04: Move demo into documentation
- Updated dependencies [d233d9a]
- Updated dependencies [19e0f04]
- Updated dependencies [19e0f04]
- Updated dependencies [85f2f55]
- Updated dependencies [634cc82]
  - @oberoncms/core@0.11.0
  - @oberoncms/plugin-pgsql@0.5.0

## 0.7.4

### Patch Changes

- e28293f: Fix create-oberon-app with development fallbacks
- 01fde22: Move development fallback to wrappers Move local sqlite to separate
  plugin
- e8c2c24: Fix dynamically load client after initialisation
- Updated dependencies [e28293f]
- Updated dependencies [01fde22]
- Updated dependencies [e8c2c24]
  - @oberoncms/plugin-pgsql@0.4.5

## 0.7.3

### Patch Changes

- 753fcc2: Fix vercel postgre installer

## 0.7.2

### Patch Changes

- eae0eab: Fix create-oberon-app not installing plugin dependencies

## 0.7.1

### Patch Changes

- 9ce4e84: Improve plugin initialisation
- 9ce4e84: Improve developer tooling

## 0.7.0

### Minor Changes

- 982a202: Moved initialisation for plugins into adapter prebuild function

### Patch Changes

- 982a202: fix turbo build filter
- 982a202: Fix build command
- 982a202: Fix dist not included in published packages

## 0.6.3

### Patch Changes

- d2ece32: fix turbo build filter
- d2ece32: Fix build command
- d2ece32: Fix dist not included in published packages

## 0.6.2

### Patch Changes

- f218952: Fix build command
- f218952: Fix dist not included in published packages

## 0.6.1

### Patch Changes

- d6e52e0: Fix dist not included in published packages

## 0.6.0

### Minor Changes

- 693824e: Moved packages and added create-oberon-app

## 0.5.0

### Minor Changes

- 4767eb7: Moved plugins and renamed packages
- d13cecf: Change all adapters to be plugins

## 0.4.0

### Minor Changes

- 26d9c91: Updated adapter-vercel-postgres for site config and version support
- 26d9c91: Added site manager page and page data migration functionality

## 0.3.0

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

- 3f4d414: fix vercel postgres drizzle migration
- c6960f3: Fixing adapter plugin
- 25bb5bf: Bump packages, improve View Page validation

## 0.2.0

### Minor Changes

- 77f07d0: Added Vercel Postgres adapter
- 77f07d0: Implement vercel postgres adapter
