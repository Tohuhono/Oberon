## Essentials

This is the OberonCMS monorepo for the CMS core, plugins, documentation, website
and create-oberon-app script

- CRITICAL: Read [ARCHITECTURE](.agents/ARCHITECTURE.md)
- CRITICAL: Read [CODESTYLE](.agents/CODESTYLE.md) before any edits

# Life cycle

- Run all lifecycle commands from repo root
- `pnpm` scripts are configured in base package.json and use turborepo to
  correctly manage and cache dependancies
- Use canonical root scripts below rather than reconstructing task graphs
  manually
- If the existing root scripts do not cover your lifecycle need, stop and ask to
  add or update a root script instead of working around it with package-local
  scripts, or ad-hoc filtered commands
- Avoid filtering, changing directory, or otherwise targeting specific packages
  (--filter, --dir) manually

## Script index

Validation and tests:

- `pnpm check` - cached repo health: lint, tsc, unit
- `pnpm validate` - cached validation wrapper: All linting and testing
- `pnpm test` - unit + e2e aggregate
- `pnpm test:unit` - workspace unit tests
- `pnpm test:e2e` - curated local app e2e
- `pnpm test:tdd` - playground TDD lane
- `pnpm test:tdd:ui` - playground TDD UI
- `pnpm test:coa` - create-oberon-app e2e
- `pnpm test:coa:ui` - create-oberon-app e2e UI
- `pnpm test:smoke` - deployed smoke lane
- `pnpm test:ui` - local Playwright UI

Build and dev:

- `pnpm build` - full workspace build
- `pnpm build:packages` - packages-only build
- `pnpm build:docs` - docs build
- `pnpm build:oberon` - playground build
- `pnpm build:nextjs` - recipe-nextjs build
- `pnpm build:coa` - create-app build + recipe generation
- `pnpm dev` - full workspace dev
- `pnpm dev:packages` - packages-only dev
- `pnpm dev:docs` - package + docs dev
- `pnpm dev:oberon` - package + playground dev
- `pnpm dev:nextjs` - package + recipe-nextjs dev
- `pnpm start:oberon` - start built playground
- `pnpm start:docs` - start built docs
- `pnpm tsc` - workspace typecheck

Code quality:

- `pnpm lint` - workspace lint
- `pnpm lint:fix` - lint autofix
- `pnpm prettier` - prettier check
- `pnpm prettier:fix` - prettier write

Generation, release, cleanup:

- `pnpm generate:migrations` - generate db migrations
- `pnpm generate:recipes` - refresh generated recipes
- `pnpm change` - add changeset
- `pnpm release` - publish release packages
- `pnpm deploy` - deploy wrapper
- `pnpm clean` - workspace clean
- `pnpm clean:next` - remove Next build outputs
- `pnpm clean:node` - remove node_modules
- `pnpm clean:e2e` - remove e2e sqlite artifacts
- `pnpm manypkg` - dependency policy check
- `pnpm manypkg:fix` - dependency policy autofix
- `pnpm postinstall` - workspace dependency policy hook
- `pnpm prepare` - husky setup

# Completion gate

- If you changed branch content and are about to claim the work is complete,
  fixed, or ready to commit/push/review, run `pnpm validate` from repo root
  without filtering unless the user explicitly waives it

# Temp files

- Prefer in-memory shell variables for transient state
- If a temporary file is unavoidable, use `.tmp/` inside the repo root

# Follow-up docs

- [coding style rules and guidelines](.agents/CODESTYLE.md)
- [design and archetectur](.agents/ARCHITECTURE.md)
- [common patterns and conventions](.agents/CONVENTIONS.md)
- [testing strategy and scope](.agents/TESTING.md)
