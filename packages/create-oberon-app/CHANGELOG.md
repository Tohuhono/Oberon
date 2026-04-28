# create-oberon-app

## 0.11.0

### Minor Changes

- 20820f4: Promote the repo to the Better Auth model across core packages,
  plugins, docs, recipes, and app scaffolds.

  This release removes remaining Auth.js/NextAuth assumptions, standardizes auth
  adapter expectations, and aligns setup guidance around Better Auth as the
  supported path.

  Risks and implications:
  - Integrations still relying on Auth.js/NextAuth-specific behavior may require
    configuration and implementation updates.
  - Auth adapter implementations must match the updated user-table/auth contract
    expectations across sqlite and pgsql paths.
  - Existing user schemas with provider-specific fields may need to be reduced
    or remapped to the active Better Auth model.
  - Environment variables, callback handling, and session/user lifecycle
    behavior should be reviewed during upgrade to avoid auth regressions.

  Treat this as a coordinated upgrade across core, plugins, recipes, and app
  scaffolds rather than a piecemeal patch.

### Patch Changes

- fb4d240: Remove remaining Auth.js/NextAuth coupling from core and database
  plugins, standardize user-table methods under auth adapters for sqlite and
  pgsql, and align docs with the current auth model, including reducing auth
  user schemas to active columns only.

## 0.10.4

### Patch Changes

- ad993d0: Align CMS editor accessibility contracts and migrate Playwright CMS
  coverage to the shared test fixture layout, including playground-only
  className assertions.

## 0.10.3

### Patch Changes

- a73560b: Patch Vitest tag filtering so dynamic issue tags skip cleanly instead
  of failing repo-wide test runs.
- 8109ea8: Add a dynamic Tailwind plugin, expose public plugin settings through
  the core adapter, and scaffold the Tailwind plugin into new apps.
- b654991: Implement issue #294 E2E auth lane workflow with shared Playwright
  auth helpers, add COA login/provenance lane coverage and UI test commands, and
  fix email callback/session handling required for deterministic UI sign-in
  completion.
- c80fd22: Fix e2e test creating multiple SQLite databases by pinning
  SQLITE_FILE to an absolute path during scaffold build and start phases
- b654991: Stabilize Verdaccio provenance tests by writing Verdaccio HTTP logs
  to the mounted `/logs/verdaccio.log` path, clearing stale local
  `.playwright/logs/*.log` files before each container run, and making
  metadata/proxy log assertions tolerant to quote/method formatting differences
  while preserving fallback/proxy guarantees.
- a4578f6: Respect gitignore during shared Playwright test discovery, simplify
  shared auth redirect handling, and align the create-oberon-app test container
  with the shared Playwright defaults used across the repo.
- a011a89: Separate generated Tailwind artifacts into `.oberon/tailwind`, move
  the development SQLite database into `.oberon/db`, align the recipe and
  scaffold test container with the new paths, and tighten shared Turbo and
  Vitest defaults for more stable local and CI runs.
- 237d393: Replace the legacy create-oberon-app e2e lane with a Podman-based
  `test:coa` flow that builds a dedicated runner image (`podman build` with
  cacheable layers), starts Verdaccio for the full container lifetime, publishes
  workspace packages to that registry, scaffolds via
  `pnpm dlx create-oberon-app`, and runs the smoke test against the generated
  app.

  Keep workspace files unmounted while mounting only a named pnpm store volume
  for faster repeated dependency resolution across runs, and reset Verdaccio
  storage at startup so the local registry is always clean and same-version
  workspace packages can be republished each e2e run.

  Add `@tohuhono/utils/exec-async` and `@tohuhono/utils/wait-for-server` helper
  exports and use them in the COA global setup harness.

- c80fd22: Improve e2e global setup with cross-platform port killing (macOS +
  Linux), deterministic workspace-local runtime paths, safer teardown on setup
  failure, waitForServer progress logging, and Verdaccio startup hardening.
- 48de893: Add the key value store contract slice and sqlite persistence path,
  including the sqlite KV table, adapter get/put support, shared adapter KV test
  scaffolding, development-plugin coverage via prebuild, and migration path
  resolution updates for database plugins.
- 138dc59: Share fixed Playwright lane constants across playground and COA,
  improve OTP token parsing reliability from dev logs, and align E2E lane
  coverage for auth, login, CMS, and smoke flows.
- c80fd22: Move all e2e tests to a separate parallel CI job, removing them from
  `pnpm check` to speed up the main validate pipeline.
- bf90ed0: Fix package installation behavior in the app installer and align
  supporting CI/template updates used by generated projects.
- 237d393: Simplify local e2e publishing by using root recursive workspace
  publish to Verdaccio and removing extra setup complexity. Also remove
  package-level provenance defaults from publish configs so local recursive
  publish works in non-CI environments, while release provenance remains
  controlled by CI environment settings. Modernize GitHub Actions Node setup to
  use setup-node + Corepack pnpm caching, and run Verdaccio in `/opt/verdaccio`
  while keeping the create-oberon-app scaffold runtime in `/opt/coa`.
- a011a89: Make the shared CMS Playwright suite explicit in `dev/playwright`,
  keep the existing `@cms` lane as the shared authenticated behavior lane, add a
  real playground `@tdd` suite for red/green work, expose dedicated TDD UI
  commands, keep opt-in `@tdd` specs separate from shared CMS contract specs,
  and document the canonical root validation, completion gate, and grep workflow
  for agents.
- 8fad881: Align unit-test workflow with package-only runs by removing the
  unused create-oberon-app Vitest config and package-level `test:unit` script.

## 0.10.2

### Patch Changes

- f24ecd0: Fix a Node.js compatibility issue in the scaffolder by resolving
  template/plugin paths by documenting and enforcing a Node.js runtime
  requirement of 22+ in the package metadata and README.
- 8265abe: Normalize package `repository.url` metadata to the canonical GitHub
  repository URL used in npm provenance validation.
- 4a4ab91: Standardize unit test scripts by introducing `test:unit` and making
  `test` call `test:unit`.
  - rename direct unit test command from `test` to `test:unit`
  - keep `test` as the entrypoint by delegating to `pnpm test:unit`
  - add root `test:unit` orchestration for consistent workspace-level unit-test
    invocation
  - preserve existing e2e-oriented test scripts

## 0.10.1

### Patch Changes

- 35b86e7: Normalize package `repository.url` metadata to the canonical GitHub
  repository URL used in npm provenance validation.

## 0.10.0

### Minor Changes

- 53f1409: Remove the deprecated Vercel Postgres adapter from generated project
  options.
  - remove `@oberoncms/plugin-vercel-postgres` from scaffolder dependencies
  - remove the `vercel-postgres` database choice from installer config

### Patch Changes

- 53f1409: Refresh workspace dependencies to latest available versions with pnpm
  recursive update.

  Notable upgrades requiring follow-up migration work:
  - `flydrive` to v2
  - `react-dropzone` to v15
  - `@vercel/postgres` remains deprecated upstream

  Stability pins retained:
  - `eslint`/`@eslint/js` pinned to v9 for plugin compatibility
  - `@types/node` pinned to `24.10.1` for current Node 24 usage

- d78a3de: Migrate package publishing to npm trusted publishing with GitHub
  OIDC.
  - update release workflow permissions for OIDC token exchange
  - remove static `NPM_TOKEN` usage from publish job
  - enable npm provenance in CI and package publish metadata

- d78a3de: Use pnpm-native command execution in repository automation.
  - replace `npx turbo` with `pnpm exec turbo` in changed-package script
  - replace workflow `npx vercel` usage with pnpm-based execution

## 0.9.0

### Minor Changes

- 0c6f7a0: Bump minor package versions

### Patch Changes

- 8774704: Add a monorepo assertion-safety lint rule and remove type assertion
  usage across non-UI packages.
  - Added `@typescript-eslint/consistent-type-assertions` to shared ESLint
    config to discourage `as`/angle-bracket assertions.
  - Replaced non-UI assertion sites with structural typing, runtime guards, and
    typed locals in core, sqlite, flydrive, puck-blocks, puck-rich-text, and
    create-oberon-app.
  - Kept behavior consistent while improving type correctness around server
    action unwrapping, JSON parsing, and runtime value narrowing.

- 62ead8b: chore: align Node runtime and CI to Node 24 with pnpm-managed
  versions
- 1a4ce67: Include `plugins/**/*.ts` in `create-oberon-app` TypeScript config so
  plugin templates are typechecked.

  Also narrow unknown caught errors in the Sendgrid template to satisfy strict
  typechecking.

- d51da69: Split shared repo configs into dedicated internal packages and
  migrate all consumers:
  - add `@dev/eslint`, `@dev/typescript`, and `@dev/vite`
  - move workspace `eslint`, `tsconfig`, `tailwind`, and `vite` references to
    those packages
  - replace `@tohuhono/dev` with `@dev/scripts` and keep only the `odt` tooling
    export
  - modernize package `exports` maps with explicit `types`/`default` conditions
  - simplify `@dev/vite` to source export + typecheck-only workflow

## 0.8.0

### Minor Changes

- bce6613: Bump dependencies

### Patch Changes

- 38a8da8: Bump dependencies for all packages

## 0.7.0

### Minor Changes

- 22dd6fe: Bump @measured/puck to 16.2

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
