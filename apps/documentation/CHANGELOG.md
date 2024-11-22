# @oberon/docs

## 0.10.0

### Minor Changes

- 22dd6fe: Bump @measured/puck to 16.2

### Patch Changes

- Updated dependencies [22dd6fe]
  - @tohuhono/puck-rich-text@0.11.0
  - @tohuhono/puck-blocks@0.10.0
  - @oberoncms/core@0.14.0

## 0.9.3

### Patch Changes

- f81809b: Bump dependancies
- f336edf: Move demo components to puck-components
- a49cf41: Bump dependancies
- Updated dependencies [93ecf7f]
- Updated dependencies [f81809b]
- Updated dependencies [f336edf]
- Updated dependencies [a49cf41]
- Updated dependencies [ed43e37]
  - @tohuhono/puck-blocks@0.9.2
  - @oberoncms/core@0.13.1
  - @tohuhono/puck-rich-text@0.10.0

## 0.9.2

### Patch Changes

- 8b62b9d: Bump sample components to remove local image dependency
- b6d32fa: Move sample components into monorepo
- Updated dependencies [9bb8cb7]
- Updated dependencies [8b62b9d]
- Updated dependencies [b6d32fa]
  - @oberoncms/core@0.13.0
  - @tohuhono/puck-blocks@0.9.1
  - @tohuhono/puck-rich-text@0.9.1

## 0.9.1

### Patch Changes

- Updated dependencies [635748a]
  - @tohuhono/puck-rich-text@0.9.1

## 0.9.0

### Minor Changes

- a8d2554: BREAKING CHANGE Removed initActions Removed initAdapter initOberon
  now returns an object with the intitialised adapter and handlers Clarified
  types - OberonActions is now OberonAdapter
- a8d2554: BREAKING CHANGE move all auth including login to Oberon Client

### Patch Changes

- Updated dependencies [a8d2554]
- Updated dependencies [a8d2554]
  - @tohuhono/puck-rich-text@0.9.0
  - @oberoncms/core@0.12.0

## 0.8.0

### Minor Changes

- d89bb71: fix export nested field

### Patch Changes

- a2d1a58: Update documentation
- Updated dependencies [a2d1a58]
  - @tohuhono/puck-rich-text@0.8.2
  - @oberoncms/core@0.11.1

## 0.7.0

### Minor Changes

- d233d9a: Wrap server actions to retain error messages in production Add
  Toaster component to surface action errors
- 19e0f04: Move signOut to adapter

### Patch Changes

- 19e0f04: Move demo into documentation
- Updated dependencies [d233d9a]
- Updated dependencies [19e0f04]
- Updated dependencies [19e0f04]
- Updated dependencies [85f2f55]
- Updated dependencies [634cc82]
  - @oberoncms/core@0.11.0

## 0.6.2

### Patch Changes

- e28293f: Fix create-oberon-app with development fallbacks
- 01fde22: Move development fallback to wrappers Move local sqlite to separate
  plugin

## 0.6.1

### Patch Changes

- b8ed573: Reorder type definitions for readability

## 0.6.0

### Minor Changes

- 693824e: Moved packages and added create-oberon-app

## 0.5.0

### Minor Changes

- 4767eb7: Moved plugins and renamed packages

## 0.4.0

### Minor Changes

- eec8abb: Move auth to core

## 0.3.1

### Patch Changes

- 7e7aa38: Fix dependencies and server loading of rich-text

## 0.3.0

### Minor Changes

- d4f6a5b: Publish dependant packages

## 0.2.0

### Minor Changes

- 63a21a9: Implemented Uploadthing Image Component. Next -> 14.2. Fixed turbo
  dev to correctly build dependencies. Changed from assets to images - this is a
  breaking change for oberon adapaters. Fixed dynamic tailwind to target preview
  iframe.
