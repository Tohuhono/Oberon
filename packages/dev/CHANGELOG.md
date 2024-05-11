# @oberon/dev

## 0.6.0

### Minor Changes

- c6960f3: Implement Adapter Plugins
  Refactor OberonProvider
  Add cleanup for uploadthing image removal
- 4e6430b: Reverted to relative imports because typescript team refuses to transpile declaration files

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

- 63a21a9: Implemented Uploadthing Image Component.
  Next -> 14.2.
  Fixed turbo dev to correctly build dependencies.
  Changed from assets to images - this is a breaking change for oberon adapaters.
  Fixed dynamic tailwind to target preview iframe.
