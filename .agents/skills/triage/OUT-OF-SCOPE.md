# Out-of-Scope Records

Keep durable rejection decisions in `.agents/out-of-scope/<concept>.md`. Create the directory only
when the maintainer first rejects an enhancement as `wontfix`. Use one kebab-case file per concept,
with links to all related requests.

These records preserve the reason for a rejection and help triage identify repeated requests. Use
[CONTEXT.md](../../CONTEXT.md) for domain names and link to relevant public documentation or ADRs
rather than copying their contents.

## Record format

```markdown
# <Concept>

**Decision:** <What the maintainer ruled out.>

## Reason

<The durable scope, contract, or architectural reason for the decision.>

## Prior requests

- [<Request title>](<GitHub issue or PR URL>)
```

Record the actual approved decision. Examples in a skill are not product policy. Temporary lack of
time is a deferral, not a durable rejection.

## Check during triage

Read existing `.agents/out-of-scope/*.md` records when gathering context. Match by domain concept,
not just keywords. If a record resembles the request, present its decision and reason to the
maintainer.

- **Confirm:** append the new request to the record and close it with the approved explanation.
- **Reconsider:** update or remove the obsolete decision, then continue normal triage.
- **Different concept:** continue normal triage without treating the prior decision as binding.

An absent directory means no rejection records exist yet; do not create it just to inspect it.
Report other read failures.

## Record a rejection

Only record rejected enhancements, including explicitly named enhancement PRs. Bugs and requests
that are already implemented do not belong here. For already implemented behavior, link the existing
implementation in the closing comment.

1. Get the maintainer's rejection decision and durable reason.
2. Update a matching record, or create one for the concept.
3. Add the GitHub request link to "Prior requests".
4. Post the explanation using the triage disclaimer and link to the record.
5. Apply the category and `wontfix` state from [ISSUES.md](../../ISSUES.md), then close the item.

Use a repository link when the record is published. If it is still local, state its path and report
publication as follow-up instead of inventing a public link. Commit or push only when the user
requests it.

## Revisit a decision

When the maintainer reverses a rejection, update or remove the record so future triage does not
treat it as current policy. Continue with the new request; leave historical issues closed unless the
maintainer asks to reopen them.
