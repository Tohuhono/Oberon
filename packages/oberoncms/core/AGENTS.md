# @oberoncms/core AGENTS

Follow the [root instructions](../../../AGENTS.md). Use the
[architecture references](../../../.agents/ARCHITECTURE.md) for public API documentation and
[testing guidance](../../../.agents/TESTING.md) for shared fixtures and test scope.

Keep framework-specific routing, caching, and cookie behavior in framework integrations. The core
must not depend on Next.js or TanStack runtime APIs.
