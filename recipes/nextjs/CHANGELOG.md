# oberon-cms-example

## 0.3.3

### Patch Changes

- 9cb9f27: Testing changeset app
- 541adb0: Test changeset app

## 0.3.2

### Patch Changes

- 7e7aa38: Fix dependencies and server loading of rich-text
- Updated dependencies [7e7aa38]
  - @oberoncms/adapter-turso@0.4.1
  - @oberoncms/upload-thing@0.4.1
  - @oberoncms/components@0.3.1
  - @oberoncms/auth@0.4.1
  - @oberoncms/core@0.4.1
  - @tohuhono/puck-rich-text@0.3.1

## 0.3.1

### Patch Changes

- Updated dependencies [d4f6a5b]
  - @oberoncms/adapter-turso@0.4.0
  - @oberoncms/upload-thing@0.4.0
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
  - @oberoncms/adapter-turso@0.3.0
  - @oberoncms/core@0.3.0
  - @oberoncms/upload-thing@0.3.0
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
  - @oberoncms/adapter-turso@0.2.0
  - @oberoncms/upload-thing@0.2.0
  - @oberoncms/components@0.2.0
  - @oberoncms/auth@0.2.0
  - @oberoncms/core@0.2.0
