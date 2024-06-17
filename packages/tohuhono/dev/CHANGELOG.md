# @oberon/dev

## 0.10.0

### Minor Changes

- a8d2554: BREAKING CHANGE Removed initActions Removed initAdapter initOberon
  now returns an object with the intitialised adapter and handlers Clarified
  types - OberonActions is now OberonAdapter

## 0.9.3

### Patch Changes

- a2d1a58: Update documentation

## 0.9.2

### Patch Changes

- 3d8e16b: Fix tsx regression for unqualified imports in sub modules

## 0.9.1

### Patch Changes

- 9ce4e84: Improve developer tooling

## 0.9.0

### Minor Changes

- 982a202: Moved initialisation for plugins into adapter prebuild function

### Patch Changes

- 982a202: fix turbo build filter
- 982a202: Fix build command
- 982a202: Fix dist not included in published packages

## 0.8.3

### Patch Changes

- d2ece32: fix turbo build filter
- d2ece32: Fix build command
- d2ece32: Fix dist not included in published packages

## 0.8.2

### Patch Changes

- f218952: Fix build command
- f218952: Fix dist not included in published packages

## 0.8.1

### Patch Changes

- d6e52e0: Fix dist not included in published packages

## 0.8.0

### Minor Changes

- 693824e: Moved packages and added create-oberon-app

## 0.7.0

### Minor Changes

- 4767eb7: Moved plugins and renamed packages

## 0.6.0

### Minor Changes

- c6960f3: Implement Adapter Plugins Refactor OberonProvider Add cleanup for
  uploadthing image removal
- 4e6430b: Reverted to relative imports because typescript team refuses to
  transpile declaration files

### Patch Changes

- c6960f3: Fixing adapter plugin
- 25bb5bf: Bump packages, improve View Page validation

## 0.5.0

### Minor Changes

- 77f07d0: Added Vercel Postgres adapter

### Patch Changes

- fcff95c: Bump nextauth version

## 0.4.0

### Minor Changes

- eec8abb: Move auth to core

## 0.3.1

### Patch Changes

- bafbec6: Fix test status for changeset PR

## 0.3.0

### Minor Changes

- d4f6a5b: Publish dependant packages

## 0.2.0

### Minor Changes

- 39b03d3: Optimistically update the ui for oberon users

## 0.1.0

### Minor Changes

- 63a21a9: Implemented Uploadthing Image Component. Next -> 14.2. Fixed turbo
  dev to correctly build dependencies. Changed from assets to images - this is a
  breaking change for oberon adapaters. Fixed dynamic tailwind to target preview
  iframe.
