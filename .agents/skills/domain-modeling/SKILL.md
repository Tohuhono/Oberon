---
name: domain-modeling
description:
  Build and sharpen Oberon's domain model. Use when discussing codebase terminology, editing
  .agents/CONTEXT.md, or recording or revisiting an ADR.
---

# Domain Modeling

Actively build and sharpen Oberon's domain model as you design. This is the _active_ discipline:
challenging terms, inventing edge-case scenarios, and writing the glossary and decisions down the
moment they crystallise. (Merely _reading_ [CONTEXT.md](../../CONTEXT.md) for vocabulary is not this
skill: that's a one-line habit any skill can do. This skill is for when you're changing the model,
not just consuming it.)

## File structure

Use [CONTEXT.md](../../CONTEXT.md) as the single glossary and preserve its tables. Consult
[ARCHITECTURE.md](../../ARCHITECTURE.md) and its public documentation links for behavior and runtime
contracts. Read relevant ADRs under `.agents/adr/` before proposing changes to decisions.

Create `.agents/adr/` only when the first ADR is needed. Keep domain guidance in these existing
locations.

## During the session

### Challenge against the glossary

When the user uses a term that conflicts with [CONTEXT.md](../../CONTEXT.md), surface the
difference. For example, distinguish the composed Adapter from a Plugin adapter.

### Sharpen fuzzy language

When the user uses vague or overloaded terms, propose a precise canonical term. For example,
distinguish a Playground from a Starter app, or an Oberon config from Site state.

### Discuss concrete scenarios

When domain relationships are being discussed, stress-test them with specific scenarios. Invent
scenarios that probe edge cases and force the user to be precise about the boundaries between
concepts.

### Cross-reference with code

When the user states how something works, check whether the code and public documentation agree.
Surface contradictions before recording a term or decision.

### Update CONTEXT.md inline

When a term is resolved, update [CONTEXT.md](../../CONTEXT.md) immediately. Use the table format in
[CONTEXT-FORMAT.md](CONTEXT-FORMAT.md).

Keep definitions and aliases in the glossary. Put behavior and API contracts in the public
documentation linked from [ARCHITECTURE.md](../../ARCHITECTURE.md), and durable decision rationale
in ADRs. The glossary is not a plan or a record of implementation details.

### Offer ADRs sparingly

Only offer to create an ADR when all three are true:

1. **Hard to reverse**: the cost of changing your mind later is meaningful
2. **Surprising without context**: a future reader will wonder "why did they do it this way?"
3. **The result of a real trade-off**: there were genuine alternatives and you picked one for
   specific reasons

If any of the three is missing, skip the ADR. Use the format in [ADR-FORMAT.md](./ADR-FORMAT.md).
