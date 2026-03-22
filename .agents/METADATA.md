# Metadata policy

Use this policy for branch names, commit summaries, PR titles, and PR bodies.

## Core rule

- Summarise the work that has already happened.
- Do not describe workflow mechanics (for example: "finalise", "update PR",
  "latest changes").

## Style

- Keep metadata concise and freeform.
- Prefer user-visible outcomes when possible.

## Inputs

- Use available context to infer the summary (changesets, diff, commits).
- No rigid source ordering is required.

## Generation behavior

- Always generate metadata; do not pause to ask for wording.
- Use a one-sentence summary for the PR body.
- If the work closes an issue, mention it in the PR body using an issue-closing
  reference (for example: `Closes #123`).
