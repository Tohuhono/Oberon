# @oberoncms/core

## 0.11.0

### Minor Changes

- d233d9a: Wrap server actions to retain error messages in production Add
  Toaster component to surface action errors
- 19e0f04: Move signOut to adapter
- 85f2f55: Create a development plugin

### Patch Changes

- 19e0f04: Move demo into documentation
- 634cc82: Improve error handling to support redirects
- Updated dependencies [d233d9a]
  - @tohuhono/utils@0.9.0
  - @tohuhono/ui@0.10.0

## 0.10.4

### Patch Changes

- e28293f: Fix create-oberon-app with development fallbacks
- 01fde22: Move development fallback to wrappers Move local sqlite to separate
  plugin

## 0.10.3

### Patch Changes

- 2aebcf6: Add welcome page during database initialisation

## 0.10.2

### Patch Changes

- b8ed573: Reorder type definitions for readability

## 0.10.1

### Patch Changes

- 9ce4e84: Improve developer tooling
- Updated dependencies [9ce4e84]
  - @tohuhono/utils@0.8.1
  - @tohuhono/ui@0.9.1

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
  - @tohuhono/utils@0.8.0
  - @tohuhono/ui@0.9.0

## 0.9.3

### Patch Changes

- d2ece32: fix turbo build filter
- d2ece32: Fix build command
- d2ece32: Fix dist not included in published packages
- Updated dependencies [d2ece32]
- Updated dependencies [d2ece32]
- Updated dependencies [d2ece32]
  - @tohuhono/utils@0.7.3
  - @tohuhono/ui@0.8.3

## 0.9.2

### Patch Changes

- f218952: Fix build command
- f218952: Fix dist not included in published packages
- Updated dependencies [f218952]
- Updated dependencies [f218952]
  - @tohuhono/utils@0.7.2
  - @tohuhono/ui@0.8.2

## 0.9.1

### Patch Changes

- d6e52e0: Fix dist not included in published packages
- Updated dependencies [d6e52e0]
  - @tohuhono/utils@0.7.1
  - @tohuhono/ui@0.8.1

## 0.9.0

### Minor Changes

- 693824e: Moved packages and added create-oberon-app

### Patch Changes

- Updated dependencies [693824e]
  - @tohuhono/utils@0.7.0
  - @tohuhono/ui@0.8.0

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
  - @tohuhono/ui@0.7.0
  - @tohuhono/utils@0.6.0

## 0.7.0

### Minor Changes

- 26d9c91: Updated adapter-vercel-postgres for site config and version support
- 26d9c91: Added site manager page and page data migration functionality
- 26d9c91: BREAKING CHANGE changed sqlite columns storing json data to use new
  mode

### Patch Changes

- Updated dependencies [26d9c91]
- Updated dependencies [26d9c91]
  - @tohuhono/utils@0.5.0
  - @tohuhono/ui@0.6.0

## 0.6.0

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

- c6960f3: Fixing adapter plugin
- a5e6827: Publish button feedback
- 25bb5bf: Bump packages, improve View Page validation
- Updated dependencies [c6960f3]
- Updated dependencies [2deb902]
- Updated dependencies [4e6430b]
- Updated dependencies [a5e6827]
- Updated dependencies [25bb5bf]
  - @tohuhono/ui@0.5.0
  - @tohuhono/utils@0.4.0

## 0.5.1

### Patch Changes

- fcff95c: Bump nextauth version
  - @tohuhono/ui@0.4.0
  - @tohuhono/utils@0.3.0

## 0.5.0

### Minor Changes

- eec8abb: Move auth to core

### Patch Changes

- d251149: Removed components package
- Updated dependencies [eec8abb]
  - @tohuhono/utils@0.3.0
  - @tohuhono/ui@0.4.0

## 0.4.1

### Patch Changes

- 7e7aa38: Fix dependencies and server loading of rich-text
- Updated dependencies [7e7aa38]
  - @tohuhono/utils@0.2.1
  - @tohuhono/ui@0.3.1

## 0.4.0

### Minor Changes

- d4f6a5b: Publish dependant packages

### Patch Changes

- Updated dependencies [d4f6a5b]
  - @tohuhono/utils@0.2.0
  - @tohuhono/ui@0.3.0

## 0.3.0

### Minor Changes

- dd9dc69: Implement optimistic pages
- 39b03d3: Optimistically update the ui for oberon users
- 5a0a961: Update theme Propogate theme to preview iframe Correctly invalidate
  server side cache on page mutate Add createPage oberon action Add example
  dashboard to recipe (maybe remvoe later?)
- e10807b: Impliment role based authorization

### Patch Changes

- Updated dependencies [39b03d3]
- Updated dependencies [5a0a961]
  - @oberon/ui@0.2.0
  - @oberon/utils@0.1.0

## 0.2.0

### Minor Changes

- 63a21a9: Implemented Uploadthing Image Component. Next -> 14.2. Fixed turbo
  dev to correctly build dependencies. Changed from assets to images - this is a
  breaking change for oberon adapaters. Fixed dynamic tailwind to target preview
  iframe.

### Patch Changes

- Updated dependencies [63a21a9]
  - @oberon/utils@0.1.0
  - @oberon/ui@0.1.0

## 0.1.0

### Minor Changes

- a38fe03: Initial publish
