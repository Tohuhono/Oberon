## Essentials

This is the OberonCMS monorepo for the CMS core, plugins, documentation, website
and create-oberon-app script

- CRITICAL: Read [package.json](./package.json)
- CRITICAL: Read [ARCHITECTURE](.agents/ARCHITECTURE.md) before planning
- CRITICAL: Read [CODESTYLE](.agents/CODESTYLE.md) before any edits

# Pnpm and life cycle

- Run all lifecycle commands from repo root
- `pnpm` scripts are configured in base package.json and use turborepo to
  correctly manage and cache dependancies
- Avoid filtering, changing directory, or otherwise targeting specific packages
  (--filter, --dir) manually
- Use `pnpm check` to run lint, typecheck, build and tests which is cached for
  efficiency

# Temp files

- Prefer in-memory shell variables for transient state
- If a temporary file is unavoidable, use `.tmp/` inside the repo root

# Follow-up docs

- [coding style rules and guidelines](.agents/CODESTYLE.md)
- [design and archetectur](.agents/ARCHITECTURE.md)
- [common patterns and conventions](.agents/CONVENTIONS.md)
- [testing strategy and scope](.agents/TESTING.md)
