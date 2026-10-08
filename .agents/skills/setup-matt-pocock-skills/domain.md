# Domain reference template

Use this outline for the root `## Agent skills` domain section. Adapt it to the existing files; do
not create another domain guide.

- Identify the shared glossary or context map.
- Link to public configuration and plugin documentation for behavior.
- Use the existing architecture reference document for repository wiring.
- Record the ADR location and create it only when a durable decision needs rationale.
- Surface conflicts with existing ADRs rather than silently overriding them.
- Keep repository policies in their existing coding, testing, and metadata documents.

In this repo, the glossary is `.agents/CONTEXT.md`, the reference index is
`.agents/ARCHITECTURE.md`, and optional ADRs belong under `.agents/adr/`. Do not create parallel
root glossaries or `docs/adr/` files.
