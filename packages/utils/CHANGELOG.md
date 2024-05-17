# @oberon/utils

## 0.5.0

### Minor Changes

- 26d9c91: Updated adapter-vercel-postgres for site config and version support
- 26d9c91: Added site manager page and page data migration functionality

## 0.4.0

### Minor Changes

- 2deb902: Added updatedAt and updatedBy to images
  Resolved uploadingthing type declaration error
- 4e6430b: Reverted to relative imports because typescript team refuses to transpile declaration files

## 0.3.0

### Minor Changes

- eec8abb: Move auth to core

## 0.2.1

### Patch Changes

- 7e7aa38: Fix dependencies and server loading of rich-text

## 0.2.0

### Minor Changes

- d4f6a5b: Publish dependant packages

## 0.1.0

### Minor Changes

- 63a21a9: Implemented Uploadthing Image Component.
  Next -> 14.2.
  Fixed turbo dev to correctly build dependencies.
  Changed from assets to images - this is a breaking change for oberon adapaters.
  Fixed dynamic tailwind to target preview iframe.
