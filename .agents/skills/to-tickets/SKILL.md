---
name: to-tickets
description:
  Break a plan, spec, or conversation into tracer-bullet GitHub issues for Oberon, with category and
  state labels, sub-issues, and blocking relationships.
disable-model-invocation: true
---

# To Tickets

Break a plan, spec, or conversation into a set of **tickets**: tracer-bullet vertical slices, each
declaring the tickets that **block** it.

Use the `gh` CLI and [ISSUES.md](../../ISSUES.md) for issue operations, sub-issues, blocking
relationships, and labels.

## Process

### 1. Gather context

Work from whatever is already in the conversation context. If the user passes a reference (a spec
path, an issue number or URL) as an argument, fetch it and read its full body and comments. For
GitHub issues, use the read operation in [ISSUES.md](../../ISSUES.md).

### 2. Explore the codebase (optional)

If you have not already explored the codebase, do so to understand the current state of the code.
Use [CONTEXT.md](../../CONTEXT.md) for names, [ARCHITECTURE.md](../../ARCHITECTURE.md) for runtime
and integration references, and relevant decisions under `.agents/adr/`.

Look for opportunities to prefactor the code to make the implementation easier. "Make the change
easy, then make the easy change."

### 3. Draft vertical slices

Break the work into **tracer bullet** tickets.

<vertical-slice-rules>

- Each slice delivers a complete behavior through all affected layers, not one horizontal layer
- A completed slice is demoable or verifiable on its own
- Each slice is sized to fit in a single fresh context window
- Any prefactoring should be done first
- Include affected Plugins, Framework integrations, Playgrounds, Recipes, and public documentation
  where the behavior requires them. Use [TESTING.md](../../TESTING.md) to define verification.

</vertical-slice-rules>

Give each ticket its **blocking edges**: the other tickets that must complete before it can start. A
ticket with no blockers can start immediately.

**Wide refactors are the exception to vertical slicing.** A **wide refactor** is one mechanical
change (rename a column, retype a shared symbol) whose **blast radius** fans across the whole
codebase, so a single edit breaks thousands of call sites at once and no vertical slice can land
green. Don't force it into a tracer bullet; sequence it as **expand–contract**. First expand: add
the new form beside the old so nothing breaks. Then migrate the call sites over in batches sized by
blast radius (per package, per directory), each batch its own ticket blocked by the expand, keeping
CI green batch to batch because the old form still exists. Finally contract: delete the old form
once no caller remains, in a ticket blocked by every migrate batch. When even the batches can't stay
green alone, keep the sequence but let them share an integration branch that all block a final
integrate-and-verify ticket; green is promised only there.

### 4. Quiz the user

Present the proposed breakdown as a numbered list. For each ticket, show:

- **Title**: short descriptive name
- **Blocked by**: which other tickets (if any) must complete first
- **What it delivers**: the end-to-end behaviour this ticket makes work
- **Category**: `bug` or `enhancement`, using the roles in [ISSUES.md](../../ISSUES.md)

Ask the user:

- Does the granularity feel right? (too coarse / too fine)
- Are the blocking edges correct: does each ticket only depend on tickets that genuinely gate it?
- Should any tickets be merged or split further?

Iterate until the user approves the breakdown.

### 5. Publish the GitHub issues

Publish one issue per approved ticket in dependency order, so blockers have issue numbers before
dependent tickets are created.

- Apply exactly one category label and one state label from [ISSUES.md](../../ISSUES.md). Use the
  approved category and `ready-for-agent` unless the user specifies another state.
- If the source is an existing issue, attach each ticket as its sub-issue.
- Set native blocking relationships with the operations in [ISSUES.md](../../ISSUES.md). Use its
  body conventions only when GitHub does not support the relationship. Report authentication,
  permission, and network errors instead of treating them as unsupported features.
- Preserve the parent issue's body, labels, and open state. Only add the approved sub-issue
  relationships.
- Read back the created issues, labels, parent links, and blockers. Report their URLs and any
  incomplete operations. Do not claim publication is complete while a required operation failed.

Work the **frontier**: any ticket whose blockers are all done. For a purely linear chain that means
top to bottom.

<issue-template>

## Parent

A reference to the parent GitHub issue (if the source was an existing issue, otherwise omit this
section).

## What to build

The end-to-end behaviour this ticket makes work, from the user's perspective, not layer-by-layer
implementation.

## Acceptance criteria

- [ ] Criterion 1
- [ ] Criterion 2

## Blocked by

- A reference to each blocking ticket, or "None (can start immediately)". Omit this section when
  blockers were set as native edges.

</issue-template>

In the issue body, avoid specific file paths or code snippets: they go stale fast. Exception: if a
prototype produced a snippet that encodes a decision more precisely than prose can (state machine,
reducer, schema, type shape), inline it and note briefly that it came from a prototype. Trim to the
decision-rich parts, not a working demo, just the important bits.
