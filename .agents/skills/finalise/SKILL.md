---
name: finalise
description:
  "Finalise completed work into a PR from fresh main. Use when the user says
  finalise/finalize. Handles syncing main, creating a new branch from main,
  including all branch changes, ensuring changeset coverage, committing,
  pushing, and opening a PR against main."
argument-hint: What work should be finalised?
---

# Finalise Workflow

Run a finalisation flow that packages the current work state into a PR from
fresh main. This skill does not run validation; it assumes validation is already
complete.

## When to Use

- User asks to finalise/finalize work

## Procedure

1. Capture source context
   - Record current branch and working tree state.
   - Include all changes, even if they are from the user or out of scope of the
     task
2. Derive work metadata
   - Follow [METADATA](../../METADATA.md).
   - Keep branch/commit/PR wording concise and focused on completed work
     outcomes.
3. Ensure release metadata
   - Add a [changeset](https://github.com/changesets/changesets) for any package
     changes.
4. Fetch origin
   - Ensure we have all remote changes in this branch and main.
   - This should happen before creating the final branch.
5. Create fresh final branch
   - Create a new branch from latest `origin/main`.
   - Branch name format: `finalise/<timestamp>-<work-slug>`
   - `work-slug` should reflect the work area and outcome.
6. Integrate source branch work
   - Keep source branch history untouched.
   - Apply the source-vs-main net diff onto the fresh final branch.
   - Create one commit representing the net-new logical work.
7. Commit and push
   - Stage all changes from the replayed diff.
   - Commit with a concise summary of completed work (not finalisation
     mechanics).
   - Push branch to origin
8. Open PR against main
   - Create PR targeting `main`.
   - Title and description must describe completed work outcomes, not workflow
     steps.

## Decision Points

- Do not run validations or checks; assume the code is correct
- Always generate concise work-focused metadata via
  [METADATA](../../METADATA.md); do not ask for wording.
- Missing changeset: add/update changeset before committing.
- If source branch is clean and has no commits ahead of `origin/main`, stop and
  report no changes to finalise.
- If package changes exist without a changeset, add a changeset.
- Do not rewrite source branch history.
- Use `gh pr create`.
- If `gh` is unavailable or unauthenticated, stop and report the blocker.
- If there are conflicts, attempt to resolve; If unsure how to resolve or unable
  to resolve , stop and report the conflicts.
- Auth/permission error: stop and report exact failure.

## Completion Checks

- Final branch starts from latest `origin/main`
- All source branch changes are included by content
- Final branch commit history reflects net-new logical work only
- Source branch history is unchanged
- Required changeset exists
- Commit is created and pushed
- PR is open against `main`
- Branch name, commit summary, PR title, and PR body describe completed work
  outcomes (not workflow mechanics)

## Output

- Final branch name
- Commit SHA
- PR URL
- Derived work summary used for branch/PR metadata
- Any blockers or manual follow-up steps
