# CONTEXT.md Format

Update [CONTEXT.md](../../CONTEXT.md) in place. Keep the existing sections and table format.

## Structure

```md
| Term               | Definition                                | Aliases to avoid        |
| ------------------ | ----------------------------------------- | ----------------------- |
| **Canonical term** | A short definition of the domain concept. | ambiguous name, synonym |
```

## Rules

- **Choose one name.** Put the canonical name in the first column and ambiguous alternatives in
  "Aliases to avoid".
- **Keep definitions tight.** One or two sentences max. Define what it IS, not what it does.
- **Only include terms specific to this project's context.** General programming concepts (timeouts,
  error types, utility patterns) don't belong even if the project uses them extensively. Before
  adding a term, ask: is this a concept unique to this context, or a general programming concept?
  Only the former belongs.
- **Use the existing groups.** Add terms to Runtime and integration, Content, or Project surfaces as
  appropriate. Keep Invariants and Ambiguous terms consistent when a resolved term affects them.
- **Separate names from behavior.** Link to public documentation for behavior and contracts. Record
  architectural rationale in `.agents/adr/`, not in glossary definitions.
