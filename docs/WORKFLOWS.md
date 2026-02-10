# Agent workflows

## Plan -> execute -> validate -> test -> commit ->

- Plan mode required before edits. Keep plan ultra-concise (telegraphic style).
- End each plan with unresolved questions list (if none, say “None”).
- Validate with `pnpm check`; iterate until warnings/errors are resolved.
- Confirm with `pnpm build`; iterate until warnings/errors are resolved.

## Common dev commands

- `pnpm dev:oberon` (playground + dependencies)
- `pnpm dev:docs` (documentation app)
- `pnpm dev:rte` (rich-text demo)
- `pnpm tsc`, `pnpm lint:fix`, `pnpm build`

## Finalise

If asked to finalise skip plan mode, assume the task is complete and validated,
instead perform the following tasks without further prompting:

- Make sure main has all changes from remote
- Checkout a new branch from main
- Add all changes
- Add a [changeset](https://github.com/changesets/changesets) for all changes.
- Commit and push changes the commit message should be concise; the changeset is
  the description.
- Open a PR against `main`
