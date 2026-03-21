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
2. Ensure release metadata
   - Add a [changeset](https://github.com/changesets/changesets) for any new
     package changes.
3. Fetch origin
   - Ensure we have all remote changes in this branch and main
4. Create fresh final branch
   - Create a new branch from main
5. Commit and push
   - Stage all changes
   - Commit with a very concise summary
   - Push branch to origin
6. Open PR against main
   - Create PR targeting `main`.
   - Include a concise summary of the finalised change set.

## Decision Points

- Do not run validations or checks; assume the code is correct
- Commit summary chould be very short; details are already captured in the
  changeset
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
