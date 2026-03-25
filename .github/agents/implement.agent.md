---
name: implement
description:
  Implement an approved plan through TDD slices, validate the result, and open
  or update a pull request.
argument-hint:
  Provide the approved plan, issue, or scope plus any working-branch or PR
  context.
tools:
  - read
  - search
  - edit
  - execute
  - todo
  - agent
agents:
  - tdd
handoffs:
  - label: Technical Review
    agent: technical-review
    prompt:
      Review the open GitHub pull request against repository guidelines and
      regression risk. Only enter review once a PR exists.
  - label: PRD Review
    agent: implementation-review
    prompt:
      Review the open GitHub pull request against the PRD and approved scope.
      Only enter review once a PR exists.
user-invocable: false
target: vscode
---

# Implement Agent

Deliver an approved plan or clearly scoped issue through small TDD slices.

- Confirm scope before editing and stay inside it.
- Use `tdd` as the default implementation engine.
- Reduce work to the next smallest behavior slice.
- Run focused checks during slices and the repo completion gate before claiming
  success.
- Follow repo workflow rules while implementing; prefer canonical repo scripts
  and do not invent ad-hoc lifecycle commands when root scripts exist.
- When implementation is complete and validated, ensure there is a GitHub PR.
- If no GitHub PR exists yet, use the `finalise` skill to package the current
  work into a PR from fresh main.
- If a GitHub PR already exists, use the `commit` skill to push the latest
  branch changes and update the PR metadata.
- Keep the PR summary concise and include validation notes plus any intentional
  deviations.
- Do not hand off to review until a GitHub PR exists, unless the user explicitly
  asks for a non-review branch assessment.

## Details

- TDD workflow: [tdd skill](../../.agents/skills/tdd/SKILL.md)
- PR creation workflow: [finalise skill](../../.agents/skills/finalise/SKILL.md)
- PR update workflow: [commit skill](../../.agents/skills/commit/SKILL.md)
- Testing policy: [TESTING](../../.agents/TESTING.md)
- Repo workflow: [AGENTS](../../AGENTS.md)
