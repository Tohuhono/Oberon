# create-oberon-app

## 0.6.1

### Patch Changes

- f81809b: Bump dependancies
- a49cf41: Bump dependancies

## 0.6.0

### Minor Changes

- 9bb8cb7: Move all handlers to single api handler endpoint under cms

## 0.5.1

### Patch Changes

- 94cadff: Fix create-oberon-app dependencies

## 0.5.0

### Minor Changes

- a8d2554: BREAKING CHANGE Removed initActions Removed initAdapter initOberon
  now returns an object with the intitialised adapter and handlers Clarified
  types - OberonActions is now OberonAdapter
- a8d2554: BREAKING CHANGE move all auth including login to Oberon Client

### Patch Changes

- Updated dependencies [a8d2554]
- Updated dependencies [a8d2554]
  - @oberon/recipe-nextjs@0.12.0

## 0.4.1

### Patch Changes

- a2d1a58: Update documentation
- ecdcc22: Fix default disable custom plugins in development

## 0.4.0

### Minor Changes

- d233d9a: Wrap server actions to retain error messages in production Add
  Toaster component to surface action errors
- 85f2f55: Create a development plugin

## 0.3.8

### Patch Changes

- e803dd5: Fix create oberon app missing dev dependency

## 0.3.7

### Patch Changes

- e28293f: Fix create-oberon-app with development fallbacks
- 01fde22: Move development fallback to wrappers Move local sqlite to separate
  plugin
- e8c2c24: Fix dynamically load client after initialisation

## 0.3.6

### Patch Changes

- 2aebcf6: Add welcome page during database initialisation

## 0.3.5

### Patch Changes

- 753fcc2: Fix vercel postgre installer

## 0.3.4

### Patch Changes

- 4eccc4b: Fix pnpm install @libsql/client

## 0.3.3

### Patch Changes

- eae0eab: Fix create-oberon-app not installing plugin dependencies

## 0.3.2

### Patch Changes

- 9ce4e84: Improve developer tooling
- 9ce4e84: Fix missing dependencies

## 0.3.1

### Patch Changes

- 638cb69: Fix adapter template location

## 0.3.0

### Minor Changes

- 982a202: Moved initialisation for plugins into adapter prebuild function

### Patch Changes

- 982a202: fix turbo build filter
- 982a202: Fix build command
- 982a202: Fix dist not included in published packages

## 0.2.3

### Patch Changes

- d2ece32: fix turbo build filter
- d2ece32: Fix build command
- d2ece32: Fix dist not included in published packages

## 0.2.2

### Patch Changes

- f218952: Fix build command
- f218952: Fix dist not included in published packages

## 0.2.1

### Patch Changes

- d6e52e0: Fix dist not included in published packages

## 0.2.0

### Minor Changes

- 2931919: Implement create-oberon-app
- 693824e: Moved packages and added create-oberon-app

## 0.1.0

### Minor Changes

- 4767eb7: Moved plugins and renamed packages

## 0.0.3

### Patch Changes

- 4ce94f8: Minor bump
