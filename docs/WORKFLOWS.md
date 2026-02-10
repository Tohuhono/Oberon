# Agent workflows

## Plan mode

- Plan mode required before edits. Keep plan ultra-concise (telegraphic style).
- End each plan with unresolved questions list (if none, say “None”).
- Validate with `pnpm check`; iterate until warnings/errors are resolved.
- Validate with `pnpm build`; iterate until warnings/errors are resolved.
- Create changeset

## Finalise

If asked to finalise then skip plan mode assume the task is complete and
validated, instead perform the following tasks without further prompting:

- Make sure main has all changes from remote
- Checkout a new branch from main
- Add all changes
- Add or update [changeset](https://github.com/changesets/changesets) for any
  new changes.
- Commit and push changes; the commit message should be concise; the changeset
  is the description.
- Open a PR against `main`
