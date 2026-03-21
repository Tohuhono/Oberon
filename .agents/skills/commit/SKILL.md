---
name: commit
description:
  Update the current branch by ensuring all branch changes are included, adding
  required changesets, then committing and pushing. Use when user asks to
  commit, update a PR, refresh an open PR, or push latest work to the current PR
  branch.
argument-hint: What should be included in this PR update?
---

# Commit changes

Commit the current work state and update pull request. This workflow assumes
implementation and validation are already complete.

## When to Use

- User asks to "commit", "update PR", "refresh PR", or "push latest changes"
- There is already an open pull request for the current branch

## Procedure

1. Confirm branch context
   - Capture current branch and working tree status.
   - Include all changes, even if they are from the user or out of scope of the
     task
2. Ensure release metadata
   - Add or update a [changeset](https://github.com/changesets/changesets) for
     new package changes.
3. Commit
   - Stage intended files.
   - Commit with a very concise summary
4. Push current branch
   - Push to `origin` on the same branch.
   - Do not create a new branch.
   - Do not create a new PR.
5. Update PR
   - If the scope of the PR has increased, rewright the description to include
     our changes. Be very concise
6. Report outcome
   - Share branch name, commit SHA, and push result.
   - If blocked, report the blocker and next required manual action.

## Decision Points

- Do not run validations or checks; assume the code is correct
- Commit summary chould be extremely brief; details are already captured in the
  changeset
- Missing changeset: add/update changeset before committing.
- Push rejected (non-fast-forward): pull remote and merge, resolve conflicts,
  then retry push.
- Auth/permission error: stop and report exact failure.

## Completion Checks

- Current branch is preserved (no branch switch)
- All intended branch changes are included
- Changeset is present for new package changes
- Commit is created with a concise message
- Push to current branch succeeds
