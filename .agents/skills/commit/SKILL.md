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

## Quick Checklist

1. Confirm branch context
   - Capture current branch and working tree status.
   - If the current branch is `main` then stop and report no branch.
   - If there are no local changes and no commits ahead of remote, stop and
     report nothing to update.
2. Include all branch changes
   - Include all current branch changes, not only files touched in the latest
     task.
3. Ensure changeset coverage
   - Add or update a [changeset](https://github.com/changesets/changesets) for
     new package changes.
4. Commit
   - Stage intended files.
   - Commit with a concise message.
5. Push current branch
   - Push to `origin` on the same branch.
   - Do not create a new branch.
   - Do not create a new PR.
6. Update PR
   - Update the PR to include a concise summary the updated changeset.
7. Report outcome
   - Share branch name, commit SHA, and push result.
   - If blocked, report the blocker and next required manual action.

## Decision Points

- Missing changeset: add/update changeset before committing.
- Wrong branch: if the current branch is `main` then stop and report no branch.
- No-op update: if branch is clean with no local commits ahead of remote, stop
  and report no changes to update.
- Push rejected (non-fast-forward): pull remote and merge, resolve conflicts,
  then retry push.
- Auth/permission error: stop and report exact failure.

## Completion Checks

- Current branch is preserved (no branch switch)
- All intended branch changes are included
- Changeset is present for new package changes
- Commit is created with a concise message
- Push to current branch succeeds
