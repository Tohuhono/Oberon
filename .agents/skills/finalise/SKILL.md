---
name: finalise
description:
  "Finalise completed work into a PR from fresh main. Use when the user says
  finalise/finalize. Handles syncing main, creating a new branch from main,
  including all current work, ensuring changeset coverage, committing, pushing,
  and opening a PR against main."
argument-hint: What work should be finalised?
---

# Finalise Workflow

Run a finalisation flow that packages the current work state into a PR from
fresh main. This skill does not run validation; it assumes validation is already
complete.

Operate in the user's current checkout. Do not create or use a separate git
worktree unless the user explicitly asks for one.

## When to Use

- User asks to finalise/finalize work

## Procedure

1. Capture source context
   - Record current branch and working tree state.
   - Include all current work, including uncommitted tracked changes, deletions,
     and explicitly intended new files.
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
   - Work in the current checkout, not a separate worktree.
   - Create a new branch from latest `origin/main` in the current checkout.
   - Branch name format: `finalise/<timestamp>-<work-slug>`
   - `work-slug` should reflect the work area and outcome.
6. Integrate source branch work
   - The intent is to package all current work into the fresh final branch, not
     to preserve the pre-finalise branch state.
   - Carry over the full current work state, including uncommitted changes, onto
     the fresh final branch.
   - Use the current checkout as the source of truth; do not replay the diff in
     a separate checkout.
   - Do not use `git merge --squash`. Squash is a PR merge strategy, not the
     mechanism for assembling the fresh final branch.
   - Do not create a helper commit on the source branch just to transport the
     tree state onto the fresh final branch.
   - Prefer in-memory shell state when possible. If a temporary patch or
     snapshot file is unavoidable, keep it under `.tmp/` inside the repo root.
   - Preferred integration shape: snapshot the current tree state, move the
     checkout to a fresh branch from `origin/main`, restore that tree state, and
     then create one commit on the fresh final branch.
   - Create one commit representing the net-new logical work.
7. Commit and push
   - Stage all changes included in the current work state.
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
- If the current work state is empty relative to `origin/main`, stop and report
  no changes to finalise.
- If package changes exist without a changeset, add a changeset.
- Do not create or use a temporary worktree.
- Do not use `git merge --squash` during finalise.
- Do not create intermediate source-branch commits purely as transport for the
  final branch.
- It is acceptable for finalise to move the user's current checkout onto the new
  final branch.
- Use `gh pr create`.
- If `gh` is unavailable or unauthenticated, stop and report the blocker.
- If there are conflicts, attempt to resolve; If unsure how to resolve or unable
  to resolve , stop and report the conflicts.
- Auth/permission error: stop and report exact failure.

## Completion Checks

- Final branch starts from latest `origin/main`
- All current work is included by content
- Final branch commit history reflects net-new logical work only
- Finalise ran in the current checkout without creating a separate worktree
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
