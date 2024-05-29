# @oberoncms/plugin-vercel-postgres

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

- c6960f3: Implement Adapter Plugins
  Refactor OberonProvider
  Add cleanup for uploadthing image removal
- 2deb902: Added updatedAt and updatedBy to images
  Resolved uploadingthing type declaration error
- eae691f: CAUTION BREAKING CHANGE
  databases created before this patch will need to be manually updated
  added updatedAt and updatedBy cloumns
  reset the drizzle database migrations
- 4e6430b: Reverted to relative imports because typescript team refuses to transpile declaration files

### Patch Changes

- 3f4d414: fix vercel postgres drizzle migration
- c6960f3: Fixing adapter plugin
- 25bb5bf: Bump packages, improve View Page validation

## 0.2.0

### Minor Changes

- 77f07d0: Added Vercel Postgres adapter
- 77f07d0: Implement vercel postgres adapter
