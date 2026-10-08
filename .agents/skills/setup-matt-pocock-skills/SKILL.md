---
name: setup-matt-pocock-skills
description:
  Configures repository references for engineering skills without duplicating existing guidance. Use
  when setting up issue workflows, triage labels, or domain documentation for Matt Pocock's skills,
  or when those skills lack repository context.
disable-model-invocation: true
---

# Setup Matt Pocock's skills

Keep product behavior in public documentation. Record tracker configuration in `.agents/ISSUES.md`
and domain paths in the root `## Agent skills` section.

## 1. Inspect

Read the root `AGENTS.md` and any `CLAUDE.md` before changing either. Inspect existing guidance
rather than assuming an upstream layout:

- `.agents/ISSUES.md` and `.agents/METADATA.md`
- `.agents/CONTEXT.md`, `.agents/ARCHITECTURE.md`, and any `.agents/CONTEXT-MAP.md`
- `.agents/CODESTYLE.md`, `.agents/TESTING.md`, and relevant `.agents/adr/` decisions
- The public documentation linked from those files
- `git remote -v` to identify the tracker
- `gh label list --limit 100 --json name,description` for GitHub labels

## 2. Confirm decisions

Explain and ask about one decision at a time. Preserve approved settings on reruns unless the user
requests a change.

1. **Tracker:** GitHub (`gh`), GitLab (`glab`), local markdown, or a described external workflow.
   For local markdown, confirm a durable location rather than using `.tmp/`.
2. **Labels:** Map category roles `bug` and `enhancement`, and state roles `needs-triage`,
   `needs-info`, `ready-for-agent`, `ready-for-human`, and `wontfix`. Each triaged issue needs one
   category and one state. Identify missing tracker labels.
3. **Domain docs:** Confirm the existing glossary, architecture references, and ADR paths. This repo
   uses `.agents/CONTEXT.md` and optional `.agents/adr/`, not parallel root or `docs/` files.

## 3. Show the draft

Present the root section and `.agents/ISSUES.md` changes before writing. Keep existing policy and
product explanations in their current documents. Use these templates only where the selected tracker
needs them:

- [GitHub](issue-tracker-github.md)
- [GitLab](issue-tracker-gitlab.md)
- [Local markdown](issue-tracker-local.md)
- [Label mapping](triage-labels.md)
- [Domain references](domain.md)

## 4. Write

Update the existing root instruction file: `CLAUDE.md` if present, otherwise `AGENTS.md`. If neither
exists, ask which one to create. Do not create a second instruction file. Update `## Agent skills`
in place without overwriting surrounding guidance.

Combine tracker operations and labels in `.agents/ISSUES.md`. Record domain paths and ADR rules in
the root section. Link to public documentation for product behavior. Do not create separate tracker,
label, or domain guides.

For GitHub, create missing approved labels:

```sh
gh label create "<label>" --description "<meaning>" --color "<six-digit hex>"
```

Preserve existing labels and their metadata. Do not use `--force`.

## 5. Verify

Confirm that the mapped labels exist in the tracker. Run `pnpm format` and `pnpm validate` from the
root. Report the changed references and verification results.
