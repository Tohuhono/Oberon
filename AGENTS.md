This is the OberonCMS monorepo for the CMS core, plugins, documentation, website and
create-oberon-app script

- CRITICAL: Read [CODESTYLE](.agents/CODESTYLE.md) before any edits
- CRITICAL: - Lint, Typecheck, Build and test always use `pnpm validate` it is dependency checked,
  and optimally cached.

## Constraints

- Run all lifecycle commands from repo root
- Use canonical root `pnpm` scripts below rather than reconstructing task graphs manually.
- If the existing root scripts do not cover your lifecycle need, stop and ask to add or update a
  root script instead of working around it with package-local scripts, or ad-hoc filtered commands
- Avoid filtering, changing directory, or otherwise targeting specific packages (--filter, --dir)
  manually
- Document durable repo guidance in `.agents/` rather than agent memory
- Temporary files stay in the repo, use `.tmp/`

# Potential Follow-up docs

- [coding style rules and guidelines](.agents/CODESTYLE.md)
- [testing strategy and scope](.agents/TESTING.md)
- [design and architecture](.agents/ARCHITECTURE.md)
- [git and github metadata](.agents/METADATA.md)
- [Ubiquitous Language and glossary of terms](.agents/CONTEXT.md)
- [Puck API questions or source changes](https://puckeditor.com/docs)
