This is the OberonCMS monorepo for the CMS core, plugins, documentation, website
and create-oberon-app script

- CRITICAL: Read [CODESTYLE](.agents/CODESTYLE.md) before any edits
- CRITICAL: Try to map your task to `pnpm validate` including: lint, check
  types, build or run tests

## Constraints

- Run all lifecycle commands from repo root
- For Puck API questions or source changes, check the current official docs
  first: https://puckeditor.com/docs
- If you want to lint, check types, build or run all tests then `pnpm validate`
  will do all these, dependency checked, cached correctly and stop at the first
  failure for you to review
- `pnpm` scripts are configured in base package.json and use turborepo to
  correctly manage and cache dependancies
- Use canonical root scripts below rather than reconstructing task graphs
  manually
- Reproduction must stay inside approved test scripts; do not use build or start
  scripts to reproduce, debug, or validate behavior
- If the existing root scripts do not cover your lifecycle need, stop and ask to
  add or update a root script instead of working around it with package-local
  scripts, or ad-hoc filtered commands
- Avoid filtering, changing directory, or otherwise targeting specific packages
  (--filter, --dir) manually
- Prefer in-memory shell variables for transient state
- Prefer documenting durable repo guidance in `.agents/` rather than relying on
  opaque background memory; repo-visible instructions are the maintainable
  source of truth
- Never use `/tmp` or other external temp directories for session artifacts
- If a temporary file is unavoidable, use `.tmp/` inside the repo root

# Potential Follow-up docs

- [coding style rules and guidelines](.agents/CODESTYLE.md)
- [common patterns and conventions](.agents/CONVENTIONS.md)
- [testing strategy and scope](.agents/TESTING.md)
- [design and architecture](.agents/ARCHITECTURE.md)
- [git and github metadata](.agents/METADATA.md)
