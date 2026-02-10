# Agent workflows

## Plan -> execute -> test -> commit ->

- Plan mode required before edits. Keep plan ultra-concise (telegraphic style).
- End each plan with unresolved questions list (if none, say “None”).
- Validate with `pnpm check`; iterate until warnings/errors are resolved.
- Confirm with `pnpm build`; iterate until warnings/errors are resolved.
- Finalize and raise a PR:
  - Make sure main has all changes from remote
  - Checkout a new branch from main
  - Add a [changeset](https://github.com/changesets/changesets) for all changes.
  - Commit all changes, then open a PR against `main` once validated.

## Common dev commands

- `pnpm dev:oberon` (playground + dependencies)
- `pnpm dev:docs` (documentation app)
- `pnpm dev:rte` (rich-text demo)
- `pnpm tsc`, `pnpm lint:fix`, `pnpm build`
