# Issues

## Issue tracker

Issues and PRDs for this repo live as GitHub issues. Use the `gh` CLI for all operations.

- **Create an issue**: `gh issue create --title "..." --body "..."`. Use a heredoc for multi-line
  bodies.
- **Read an issue**: `gh issue view <number> --comments`, including labels when they are relevant.
- **List issues**: `gh issue list --state open --json number,title,body,labels,comments` with
  appropriate `--label` and `--state` filters.
- **Comment on an issue**: `gh issue comment <number> --body "..."`
- **Apply / remove labels**: `gh issue edit <number> --add-label "..."` /
  `gh issue edit <number> --remove-label "..."`
- **Close**: `gh issue close <number> --comment "..."`

Infer the repository from `git remote -v`; `gh` does this automatically inside this clone.

When a skill says to publish to the issue tracker, create a GitHub issue. When it says to fetch the
relevant ticket, run `gh issue view <number> --comments`.

## Triage labels

The triage skill uses two category roles and five state roles. Each triaged issue must carry exactly
one category and one state:

| Role in the skills | Label in this repository | Meaning                                      |
| ------------------ | ------------------------ | -------------------------------------------- |
| `bug`              | `bug`                    | Something is broken                          |
| `enhancement`      | `enhancement`            | New feature or improvement                   |
| `needs-triage`     | `needs-triage`           | Maintainer needs to evaluate this issue      |
| `needs-info`       | `needs-info`             | Waiting on the reporter for more information |
| `ready-for-agent`  | `ready-for-agent`        | Fully specified and ready for an agent       |
| `ready-for-human`  | `ready-for-human`        | Requires human implementation                |
| `wontfix`          | `wontfix`                | Will not be actioned                         |

When a skill names a triage role, use its mapped label. Update the right-hand column if repository
label names change.

Verify labels with `gh label list --limit 100 --json name,description` during setup. If an approved
label is missing, create it with `gh label create` before using it; do not claim setup is complete
while labels are missing. Preserve existing labels and their metadata.
