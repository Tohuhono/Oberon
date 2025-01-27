# @oberon/playground

## 0.9.1

### Patch Changes

- Updated dependencies [a75ba57]
  - @tohuhono/puck-blocks@0.12.0
  - @oberoncms/plugin-development@0.6.0
  - @oberoncms/plugin-uploadthing@0.15.0
  - @oberoncms/core@0.16.0
  - @oberoncms/plugin-turso@0.16.0

## 0.9.0

### Minor Changes

- bce6613: Bump dependencies

### Patch Changes

- 38a8da8: Bump dependencies for all packages
- Updated dependencies [38a8da8]
- Updated dependencies [bce6613]
  - @tohuhono/puck-blocks@0.11.0
  - @oberoncms/plugin-development@0.5.0
  - @oberoncms/plugin-uploadthing@0.14.0
  - @oberoncms/core@0.15.0
  - @oberoncms/plugin-turso@0.15.0

## 0.8.0

### Minor Changes

- 22dd6fe: Bump @measured/puck to 16.2

### Patch Changes

- Updated dependencies [22dd6fe]
  - @tohuhono/puck-blocks@0.10.0
  - @oberoncms/plugin-development@0.4.0
  - @oberoncms/plugin-uploadthing@0.13.0
  - @oberoncms/core@0.14.0
  - @oberoncms/plugin-turso@0.14.0

## 0.7.1

### Patch Changes

- 93ecf7f: More example components
- f81809b: Bump dependancies
- f336edf: Move demo components to puck-components
- a49cf41: Bump dependancies
- Updated dependencies [93ecf7f]
- Updated dependencies [f81809b]
- Updated dependencies [f336edf]
- Updated dependencies [a49cf41]
  - @tohuhono/puck-blocks@0.9.2
  - @oberoncms/core@0.13.1
  - @oberoncms/plugin-development@0.3.2
  - @oberoncms/plugin-uploadthing@0.12.1
  - @oberoncms/plugin-turso@0.13.2

## 0.7.0

### Minor Changes

- 9bb8cb7: Move all handlers to single api handler endpoint under cms

### Patch Changes

- 8b62b9d: Bump sample components to remove local image dependency
- Updated dependencies [9bb8cb7]
- Updated dependencies [8b62b9d]
- Updated dependencies [b6d32fa]
  - @oberoncms/plugin-uploadthing@0.12.0
  - @oberoncms/core@0.13.0
  - @oberoncms/plugin-development@0.3.1
  - @oberoncms/plugin-turso@0.13.1

## 0.6.0

### Minor Changes

- a8d2554: BREAKING CHANGE Removed initActions Removed initAdapter initOberon
  now returns an object with the intitialised adapter and handlers Clarified
  types - OberonActions is now OberonAdapter
- a8d2554: BREAKING CHANGE move all auth including login to Oberon Client

### Patch Changes

- Updated dependencies [a8d2554]
- Updated dependencies [a8d2554]
  - @oberoncms/plugin-development@0.3.0
  - @oberoncms/plugin-uploadthing@0.11.0
  - @oberoncms/core@0.12.0
  - @oberoncms/plugin-turso@0.13.0

## 0.5.1

### Patch Changes

- a2d1a58: Update documentation
- Updated dependencies [a2d1a58]
  - @oberoncms/plugin-uploadthing@0.10.7
  - @oberoncms/core@0.11.1
  - @oberoncms/plugin-turso@0.12.1
  - @oberoncms/plugin-development@0.2.1

## 0.5.0

### Minor Changes

- d233d9a: Wrap server actions to retain error messages in production Add
  Toaster component to surface action errors
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
  - @oberoncms/plugin-turso@0.12.0
  - @oberoncms/plugin-uploadthing@0.10.6

## 0.4.7

### Patch Changes

- 3d8e16b: Fix tsx regression for unqualified imports in sub modules
  - @oberoncms/core@0.10.4
  - @oberoncms/plugin-sqlite@0.1.1
  - @oberoncms/plugin-turso@0.11.5
  - @oberoncms/plugin-uploadthing@0.10.5

## 0.4.6

### Patch Changes

- e28293f: Fix create-oberon-app with development fallbacks
- 01fde22: Move development fallback to wrappers Move local sqlite to separate
  plugin
- Updated dependencies [e28293f]
- Updated dependencies [01fde22]
- Updated dependencies [e8c2c24]
  - @oberoncms/core@0.10.4
  - @oberoncms/plugin-sqlite@0.1.1
  - @oberoncms/plugin-turso@0.11.5
  - @oberoncms/plugin-uploadthing@0.10.5

## 0.4.5

### Patch Changes

- 2aebcf6: Add welcome page during database initialisation
- Updated dependencies [2aebcf6]
  - @oberoncms/core@0.10.3
  - @oberoncms/plugin-turso@0.11.4
  - @oberoncms/plugin-uploadthing@0.10.4

## 0.4.4

### Patch Changes

- 753fcc2: Fix vercel postgre installer

## 0.4.3

### Patch Changes

- eae0eab: Fix create-oberon-app not installing plugin dependencies
- Updated dependencies [eae0eab]
  - @oberoncms/plugin-uploadthing@0.10.3
  - @oberoncms/plugin-turso@0.11.3

## 0.4.2

### Patch Changes

- Updated dependencies [b8ed573]
  - @oberoncms/core@0.10.2
  - @oberoncms/plugin-turso@0.11.2
  - @oberoncms/plugin-uploadthing@0.10.2

## 0.4.1

### Patch Changes

- 9ce4e84: Improve developer tooling
- Updated dependencies [9ce4e84]
- Updated dependencies [9ce4e84]
  - @oberoncms/plugin-turso@0.11.1
  - @tohuhono/puck-rich-text@0.8.1
  - @oberoncms/plugin-uploadthing@0.10.1
  - @oberoncms/core@0.10.1

## 0.4.0

### Minor Changes

- 982a202: Moved initialisation for plugins into adapter prebuild function

### Patch Changes

- 982a202: fix turbo build filter
- 982a202: Fix build command
- Updated dependencies [982a202]
- Updated dependencies [982a202]
- Updated dependencies [982a202]
- Updated dependencies [982a202]
  - @tohuhono/puck-rich-text@0.8.0
  - @oberoncms/plugin-uploadthing@0.10.0
  - @oberoncms/core@0.10.0
  - @oberoncms/plugin-turso@0.11.0

## 0.3.3

### Patch Changes

- d2ece32: fix turbo build filter
- d2ece32: Fix build command
- Updated dependencies [d2ece32]
- Updated dependencies [d2ece32]
- Updated dependencies [d2ece32]
  - @tohuhono/puck-rich-text@0.7.2
  - @oberoncms/plugin-uploadthing@0.9.3
  - @oberoncms/core@0.9.3
  - @oberoncms/plugin-turso@0.10.3

## 0.3.2

### Patch Changes

- f218952: Fix build command
- Updated dependencies [f218952]
- Updated dependencies [f218952]
  - @tohuhono/puck-rich-text@0.7.1
  - @oberoncms/plugin-uploadthing@0.9.2
  - @oberoncms/core@0.9.2
  - @oberoncms/plugin-turso@0.10.2

## 0.3.1

### Patch Changes

- Updated dependencies [d6e52e0]
  - @oberoncms/plugin-uploadthing@0.9.1
  - @oberoncms/core@0.9.1
  - @oberoncms/plugin-turso@0.10.1
  - @tohuhono/puck-rich-text@0.7.0

## 0.3.0

### Minor Changes

- 693824e: Moved packages and added create-oberon-app

### Patch Changes

- Updated dependencies [693824e]
  - @tohuhono/puck-rich-text@0.7.0
  - @oberoncms/plugin-uploadthing@0.9.0
  - @oberoncms/core@0.9.0
  - @oberoncms/plugin-turso@0.10.0

## 0.2.0

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
  - @oberoncms/plugin-uploadthing@0.8.0
  - @oberoncms/plugin-turso@0.9.0
  - @oberoncms/core@0.8.0
  - @tohuhono/puck-rich-text@0.6.0

## 0.1.1

### Patch Changes

- Updated dependencies [e48bd75]
  - @oberoncms/plugin-uploadthing@0.7.1
