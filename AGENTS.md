This is the OberonCMS monorepo for the CMS core, plugins, documentation, website and
create-oberon-app script

- CRITICAL: Read [CODESTYLE](.agents/CODESTYLE.md) before any edits.
- CRITICAL: Lint, Typecheck, Build and test always use `pnpm validate` it is dependency checked, and
  optimally cached.
- CRITICAL: Format always use `pnpm format` from root to format files. Do not filter, just run on
  all.

## Constraints

- Run all lifecycle commands from repo root
- Use canonical root `pnpm` scripts below rather than reconstructing task graphs manually.
- If the existing root scripts do not cover your lifecycle need, stop and ask to add or update a
  root script instead of working around it with package-local scripts, or ad-hoc filtered commands
- Avoid filtering, changing directory, or otherwise targeting specific packages (--filter, --dir)
  manually
- Document durable repo guidance in `.agents/` rather than agent memory
- Temporary files stay in the repo, use `.tmp/`
- Use public documentation for product behavior. Link to it from agent guidance instead of repeating
  it; keep only agent-specific constraints here.

# Potential Follow-up docs

- [coding style rules and guidelines](.agents/CODESTYLE.md)
- [testing strategy and scope](.agents/TESTING.md)
- [architecture references](.agents/ARCHITECTURE.md)
- [git and github metadata](.agents/METADATA.md)
- [Ubiquitous Language and glossary of terms](.agents/CONTEXT.md)
- [Puck API questions or source changes](https://puckeditor.com/docs)

## Agent skills

### Issues

Use GitHub Issues through the `gh` CLI. Tracker operations and triage labels are documented in
[ISSUES.md](.agents/ISSUES.md).

### Domain docs

This is a single-context repo. Read [CONTEXT.md](.agents/CONTEXT.md) for domain vocabulary. Use
[ARCHITECTURE.md](.agents/ARCHITECTURE.md) to find the composition and runtime documentation.

Read relevant ADRs under `.agents/adr/` when present. Create that directory only when a durable
architectural decision needs its rationale recorded; surface conflicts with existing ADRs rather
than silently overriding them. Do not create a parallel root glossary or `docs/adr/` directory.

If the repo is deliberately split into multiple contexts, record their locations in
`.agents/CONTEXT-MAP.md` and update this guidance.

These repository paths and the existing coding, testing, and metadata policies take precedence over
generic examples in skill instructions.

<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may
differ from your training data. Resolve the `turbo` package from this file's directory or relevant
workspace; in monorepos, it may not be visible from the repository root. For example, run
`node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its
`docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices.
These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is
detected. In the Turborepo source repository, its template is defined in
`crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are
enabled means a later qualifying invocation will add it again. Set `"agentGuidance": false` in the
root `turbo.json` or `turbo.jsonc` to opt out; this does not remove an existing block. Keep the
block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->
