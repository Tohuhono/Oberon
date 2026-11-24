# Issue tracker: GitHub

Issues and specs for this repo live as GitHub issues. Use the `gh` CLI for all operations.

## Conventions

- **Create an issue**: `gh issue create --title "..." --body "..."`. Use a heredoc for multi-line
  bodies.
- **Read an issue**: `gh issue view <number> --json number,title,body,labels,comments`.
- **List issues**:
  `gh issue list --state open --json number,title,body,labels,comments --jq '[.[] | {number, title, body, labels: [.labels[].name], comments: [.comments[].body]}]'`
  with appropriate `--label` and `--state` filters.
- **Make an issue a sub-issue of a parent**: `gh issue create --parent <parent> ...`, or
  `gh issue edit <parent> --add-sub-issue <child>` afterwards (`gh` 2.94+). Older `gh`:
  `gh api --method POST repos/<owner>/<repo>/issues/<parent>/sub_issues -F sub_issue_id=<child-db-id>`
  (database id, as in **Blocking** below). Without sub-issues, put `Part of #<parent>` at the top of
  the child body.
- **Blocking**: Prefer GitHub's native issue dependencies. Use
  `gh issue create --blocked-by <n>,<n> ...` or `gh issue edit <child> --add-blocked-by <blocker>`
  (`gh` 2.94+). Older `gh`: use
  `gh api --method POST repos/<owner>/<repo>/issues/<child>/dependencies/blocked_by -F issue_id=<blocker-db-id>`.
  Get the numeric database ID with `gh api repos/<owner>/<repo>/issues/<n> --jq .id`. If native
  dependencies are not available, put `Blocked by: #<n>, #<n>` at the top of the child body.
- **Count open blockers**:
  `gh api repos/<owner>/<repo>/issues/<n> --jq .issue_dependencies_summary.blocked_by`. Zero means
  the issue is unblocked. If you use `gh issue view <n> --json blockedBy`, count only nodes with
  `state == "OPEN"`.
- **Comment on an issue**: `gh issue comment <number> --body "..."`
- **Apply / remove labels**: `gh issue edit <number> --add-label "..."` / `--remove-label "..."`
- **Close**: Post the explanation with `gh issue comment <number> --body "..."`, then run
  `gh issue close <number>`. `gh issue close --comment` drops the comment on already-closed issues.

Infer the repo from `git remote -v`; `gh` does this automatically when run inside a clone. Before
creating the first issue, check `gh repo view --json nameWithOwner`. A fork can default to its
upstream parent. Confirm the target with the user if it is not their repository.

## Pull requests as a triage surface

**PRs as a request surface: no.** _(Set to `yes` if this repo treats external PRs as feature
requests; `/triage` reads this flag.)_

When set to `yes`, PRs run through the same labels and states as issues, using the `gh pr`
equivalents:

- **Read a PR**: `gh pr view <number>` for the body, `gh pr view <number> --comments` for comments,
  and `gh pr diff <number>` for the diff.
- **List external PRs for triage**:
  `gh api --paginate 'repos/{owner}/{repo}/pulls?state=open' --jq '.[] | select(.author_association | IN("OWNER","MEMBER","COLLABORATOR") | not) | {number, title, author: .user.login, author_association, labels: [.labels[].name]}'`.
- **Comment / label / close**: `gh pr comment`, `gh pr edit --add-label`/`--remove-label`,
  `gh pr close`.

GitHub shares one number space across issues and PRs, so a bare `#42` may be either: resolve with
`gh pr view 42` and fall back to `gh issue view 42`.

## When a skill says "publish to the issue tracker"

Create a GitHub issue.

## When a skill says "fetch the relevant ticket"

Read it as in **Read an issue** above.

## Wayfinding operations

Used by `/wayfinder`. The **map** is a single issue with **child** issues as tickets.

- **Map**: a single issue labelled `wayfinder:map`, holding the Notes / Decisions-so-far / Fog body.
  `gh issue create --label wayfinder:map`.
- **Child ticket**: an issue linked to the map as a GitHub sub-issue (see **Make an issue a
  sub-issue of a parent**). Where sub-issues aren't enabled, add the child to a task list in the map
  body and put `Part of #<map>` at the top of the child body. Labels: `wayfinder:<type>`
  (`research`/`prototype`/`grilling`/`task`). Once claimed, the ticket is assigned to the driving
  dev.
- **Frontier query**: list the map's open children (`gh issue list --state open`, scoped to the
  map's sub-issues / task list), drop any with an open blocker (see **Count open blockers**, or
  check the issues in the `Blocked by` line) or an assignee; first in map order wins.
- **Claim**: `gh issue edit <n> --add-assignee @me`, the session's first write.
- **Resolve**: `gh issue comment <n> --body "<answer>"`, then `gh issue close <n>`, then append a
  context pointer (gist + link) to the map's Decisions-so-far.
