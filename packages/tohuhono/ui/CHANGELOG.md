# @oberon/ui

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
