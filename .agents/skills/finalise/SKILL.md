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
   - List commits ahead of `origin/main` for the source branch.
   - Include all source branch changes (not only files from the latest task).
2. Ensure release metadata
   - Add a [changeset](https://github.com/changesets/changesets) for any new
     package changes.
3. Stash changes
   - Stash all current changes including untracked files
4. Sync main from remote
   - Fetch origin.
   - Checkout `main`.
   - Fast-forward to `origin/main`.
5. Create fresh final branch
   - Create a new branch from main
6. Replay changes into this branch
   - Pop the changes from stash
   - If conflicts appear, resolve them before proceeding.
7. Commit and push
   - Stage all changes.
   - Commit with a concise message.
   - Push branch to origin.
8. Open PR against main
   - Create PR targeting `main`.
   - Include a concise summary of the finalised change set.

## Decision Points

- Do not run validations or checks; assume the code is correct
- If there are uncommitted changes, include them even when they are outside the
  scope of the current plan.
- If source branch is clean and has no commits ahead of `origin/main`, stop and
  report no changes to finalise.
- If package changes exist without a changeset, add a changeset.
- Use `gh pr create`.
- If `gh` is unavailable or unauthenticated, stop and report the blocker.
- If there are conflicts, attempt to resolve; If unsure how to resolve or unable
  to resolve , stop and report the conflicts.
- Auth/permission error: stop and report exact failure.

## Completion Checks

- Final branch starts from latest `origin/main`
- All source branch changes are included
- No cherry-pick mode is used
- Required changeset exists
- Commit is created and pushed
- PR is open against `main`

## Output

- Final branch name
- Commit SHA
- PR URL
- Any blockers or manual follow-up steps
