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
   - Include the intended branch changes only.
   - Leave unrelated user or out-of-scope changes untouched unless the user
     explicitly asks to include them.
2. Derive work metadata
   - Follow [METADATA](../../METADATA.md).
   - Summarise completed work outcomes, not workflow mechanics.
3. Ensure release metadata
   - Add or update a [changeset](https://github.com/changesets/changesets) for
     new package changes.
4. Commit
   - Stage intended files.
   - Commit with a very concise summary of completed work.
   - Avoid process wording like "update PR" or "latest changes".
5. Push current branch
   - Push to `origin` on the same branch.
   - Do not create a new branch.
   - Do not create a new PR.
6. Update PR
   - If the scope of the PR has increased, rewrite PR title/description to
     include the completed work outcome.

- Keep PR body to one sentence.
- Be very concise.

7. Report outcome
   - Share branch name, commit SHA, and push result.
   - If blocked, report the blocker and next required manual action.

## Decision Points

- Do not sweep unrelated user changes into the commit by default
- Do not run extra validations inside this skill, but do not assume correctness
  either: if fresh branch validation has not already completed with
  `pnpm validate`, stop and route back to implementation or review-response
- Always generate concise work-focused metadata via
  [METADATA](../../METADATA.md); do not ask for wording.
- Commit summary should be extremely brief; details are already captured in the
  changeset.
- Missing changeset: add/update changeset before committing.
- Push rejected (non-fast-forward): pull remote and merge, resolve conflicts,
  then retry push.
- Auth/permission error: stop and report exact failure.

## Completion Checks

- Current branch is preserved (no branch switch)
- All intended branch changes are included
- Changeset is present for new package changes
- Commit and PR metadata describe completed work outcomes (not workflow
  mechanics)
- Push to current branch succeeds
