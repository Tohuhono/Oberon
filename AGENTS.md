## Essentials

This is the OberonCMS monorepo for the CMS core, plugins, and Next.js apps.

- Use pnpm workspaces with turborepo.
- Non-standard check: `pnpm check` runs lint + typecheck.

# Agent workflows

## Plan mode

- Read `agents/ARCHITECTURE.md` before planning.
- Plan mode required before edits. Keep plan ultra-concise (telegraphic style).
- End each plan with unresolved questions list (if none, say “None”).
- If you are unsure, ask for clarification.

## Edit mode

- Read `agents/CODESTYLE.md` before any edits.
- Execute plan, if uncertain ask.
- Validate with `pnpm check`; iterate until warnings/errors are resolved.
- Validate with `pnpm build`; iterate until warnings/errors are resolved.
- Run `pnpm test`; iterate until passing.
- Create changeset

## Finalise

If asked to finalise then skip plan mode and assume the task is complete and
validated, instead perform the following tasks without further prompting:

- Make sure main has all changes from remote
- Checkout a new branch from main
- Include all changes, not just files touched in the current task
- Add or update [changeset](https://github.com/changesets/changesets) for any
  new changes
- Commit and push changes; the commit message should be concise; the changeset
  is the description
- Open a PR against `main`

## Guardrails

- Never use `--lockfile-only`; use plain `pnpm install` (it refreshes the
  lockfile).
- Never use `pnpm --filter`; use turborepo commands (`pnpm check`, `pnpm build`)
  which handle dependency ordering automatically.
- Never use '-f' for rm; Try to remove without forcing.

# Follow-up docs

- `agents/CODESTYLE.md` (coding style rules)
- `agents/ARCHITECTURE.md` (adapter/plugin system + data flow)
- `agents/CONVENTIONS.md` (Next.js + Oberon wiring patterns)
- `agents/TESTING.md` (unit testing strategy and scope)
