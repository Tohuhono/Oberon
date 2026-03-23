## Title

Restructure CMS E2E Testing Around Shared Contracts and an Agentic `@tdd`
Pattern

## Labels

`ai`, `prd`

## Problem Statement

The CMS currently has an effective but implicit E2E structure. The monorepo has
multiple expressions of the same product surface: a developer playground, a
documentation-mounted demo, and a freshly scaffolded installation created by the
app generator. The current happy-path suite has been curated carefully and
already covers core CMS behavior across some of these contexts, but the
ownership model is not explicit and the testing intent is overloaded.

This creates two problems.

First, the reusable CMS behavior suite is not clearly represented as a shared
product contract. Shared tests are physically tied to one host context even when
they are executed in others. That makes the boundary between product-level
behavior, host-specific wiring, and deployment smoke coverage harder to
understand and maintain.

Second, the existing E2E structure is not optimized for agentic red/green
feature development. Feature work usually happens at the package level, but
validation must happen through an app host. Developers and agents need fast,
targetable tests with clear intent, predictable tagging, and a reliable command
surface that respects workspace dependency builds. The current `@cms`, `@login`,
and `@smoke` lanes are designed for curated confidence coverage, not for a
large, fast-growing body of development-time feature regression tests.

## Solution

Introduce a two-layer CMS E2E model.

The first layer is a shared CMS contract suite. These tests describe reusable,
curated CMS behavior that should hold across relevant product expressions. They
live in the shared Playwright package as product-domain tests rather than being
implicitly owned by one app host.

The second layer is an opt-in `@tdd` suite for feature development. These tests
are also colocated in the shared CMS testing domain, but they are explicitly
tagged for targeted red/green iteration. They are designed for agents and
developers to run with grep targeting such as `@tdd @feature [@issue]`.

Playground becomes the default runtime host for `@tdd` because it offers the
narrowest practical dependency tree for day-to-day development while still
exercising the real CMS surface. The TDD command surface is owned by the
playground task graph so Turbo can build the correct dependency chain. The TDD
Playwright config is separated from the curated E2E config, but inherits the
playground runtime setup and shared auth bootstrap semantics.

Package-specific tests remain local. Container/bootstrap/provenance checks stay
with the app generator package. Docs-specific navigation and content assertions
stay with the documentation app. Documentation and scaffolded app contexts can
continue to participate in curated contract coverage where appropriate, but they
do not run the fast-growing `@tdd` layer by default.

## User Stories

1. As a CMS maintainer, I want a clear distinction between shared CMS behavior
   tests and package-specific wiring tests, so that test ownership matches
   product intent.
2. As a CMS maintainer, I want reusable CMS contract tests to live in a shared
   CMS testing domain, so that the suite no longer appears to belong only to one
   host app.
3. As a CMS maintainer, I want the curated happy-path suite to remain small and
   intentional, so that CI continues to cover core pain points quickly.
4. As a CMS maintainer, I want package-specific environment tests to stay local
   to the package that owns that behavior, so that infrastructure assertions do
   not pollute the shared CMS contract.
5. As a feature developer, I want a dedicated `@tdd` pattern for end-to-end
   development, so that I can iterate red/green on real CMS behavior without
   disturbing the curated CI suite.
6. As a feature developer, I want `@tdd` tests to be discoverable through a
   stable convention, so that I can quickly find or add feature-development
   specs.
7. As a feature developer, I want every TDD spec to carry a stable feature tag,
   so that I can target development runs precisely.
8. As a feature developer, I want the default TDD host to be the fastest useful
   CMS app context, so that dependency build time does not dominate iteration
   speed.
9. As a feature developer working in a package, I want to validate behavior
   through a real app host, so that package-level changes are exercised through
   the public CMS surface.
10. As an agent, I want a single root TDD command, so that I can run targeted
    feature tests without reconstructing workspace build dependencies manually.
11. As an agent, I want to combine `@tdd` with a stable feature tag and optional
    issue tag, so that I can focus on a tracer-bullet slice of behavior during
    implementation.
12. As an agent, I want the TDD command to support UI and non-UI modes, so that
    I can switch between automation and interactive debugging when necessary.
13. As an agent, I want the TDD config to inherit the normal playground runtime
    setup, so that TDD behavior stays aligned with the real CMS host.
14. As a CMS maintainer, I want the TDD config to reuse shared auth bootstrap
    semantics, so that authenticated feature tests do not invent a second login
    model.
15. As a CMS maintainer, I want the `@tdd` suite to remain opt-in by default, so
    that rapid feature experimentation does not automatically expand the curated
    CI budget.
16. As a CMS maintainer, I want bare TDD runs to execute the full TDD surface,
    so that I can use them as a broader confidence run when needed.
17. As a feature developer, I want fast targeted runs to come from grep
    conventions rather than ad-hoc file placement, so that the workflow scales
    as the TDD suite grows.
18. As a documentation maintainer, I want docs-specific assertions to remain
    local, so that content and navigation checks are not mistaken for CMS
    product contract.
19. As a create-app maintainer, I want container, bootstrap, publishing, and
    provenance tests to remain package-specific, so that generator
    infrastructure concerns stay separated from shared CMS behavior.
20. As a CMS maintainer, I want the documentation app to eventually participate
    in curated contract coverage, so that multiple expressions of the product
    can verify the same core CMS guarantees.
21. As a CMS maintainer, I want the shared Playwright package to be explicitly
    recognized as CMS-specific infrastructure, so that shared configs, lanes,
    deployed smoke coverage, and shared specs can evolve together coherently.
22. As a feature developer, I want the TDD suite to optimize for intent
    signaling, so that `@tdd` communicates development workflow rather than
    curated coverage class.
23. As a future contributor, I want written guidance for where shared, TDD, and
    package-specific tests belong, so that I do not have to infer the structure
    from incidental discovery behavior.
24. As a future contributor, I want guidance for when a behavior belongs in the
    curated shared suite versus the opt-in TDD suite, so that the curated suite
    remains disciplined over time.
25. As a repo maintainer, I want the testing model documented in agent-facing
    instructions, so that automated contributors follow the intended red/green
    workflow instead of creating inconsistent patterns.

## Implementation Decisions

- The monorepo E2E model will distinguish between shared CMS contract coverage
  and agent-oriented feature-development coverage.
- Shared CMS contract specs will move into the shared Playwright package and be
  treated as a product-domain suite rather than an app-owned suite.
- The shared Playwright package is considered CMS-specific infrastructure and is
  an appropriate home for shared CMS specs, lane definitions, deployed smoke
  coverage, fixtures, and helper flows.
- A dedicated `tdd` area will be introduced alongside a broader shared area
  inside the shared Playwright package.
- The default host context for agentic `@tdd` runs will be the developer
  playground because it provides the narrowest practical dependency tree for
  feature work while still exercising the real CMS surface.
- The runnable TDD task will be owned by the playground task graph so that Turbo
  can build the required dependency chain before execution.
- A separate TDD Playwright config will be added for the playground host.
- The TDD config will inherit from the normal playground config via object
  spread/destructuring rather than rebuilding host runtime details
  independently.
- The TDD config will reuse the existing auth bootstrap semantics rather than
  introducing a second authenticated setup model.
- The TDD config will expose the full project set plus a TDD project so that one
  command can be used for a broader confidence run while still supporting
  grep-based fast iteration.
- The TDD workflow will rely primarily on grep targeting rather than a reduced
  discovered universe.
- `@tdd` is an intent tag and lane for development workflow; it is not a synonym
  for existing curated CMS coverage tags.
- Every TDD spec must follow the tag convention `@tdd @feature [@issue]`.
- Stable feature tags are mandatory so targeted runs remain predictable and
  scalable.
- Optional issue tags may be added to support work-item-specific targeting
  without becoming the primary discovery convention.
- Bare `test:tdd` runs will execute the full TDD configuration; the expected
  fast path is to add grep filters for focused development work.
- The root command surface will include a non-UI TDD command and a UI TDD
  command.
- Package-specific tests will remain local when they verify environment
  orchestration, package-specific infrastructure, generator provenance, or
  docs-only behavior.
- Documentation will not run the TDD layer by default.
- The scaffolded-app package will not run the TDD layer by default.
- Documentation should be able to participate in curated CMS contract coverage
  over time where the product surface genuinely overlaps.
- There is no automatic promotion path from TDD tests to curated shared tests.
  Promotion remains an explicit design decision.
- Discovery guidance must be documented clearly for humans and agents so the
  test taxonomy remains stable as the suite grows.
- Agent-facing workflow guidance should be updated to explain how to use shared
  contract tests, `@tdd`, grep targeting, and the root command surface.

## Testing Decisions

- Good tests verify externally observable behavior through public CMS interfaces
  and real host flows, not implementation details.
- Shared CMS contract tests should continue to focus on durable product
  behaviors such as authenticated CMS navigation, editing flows, page actions,
  image/site actions, and other core CMS happy paths.
- Package-specific tests should continue to focus on behavior that is owned by
  that package and cannot reasonably be expressed as shared CMS product
  contract.
- TDD tests should be written as targeted feature-development regressions and
  specifications that can be executed quickly through the default playground
  host.
- TDD tests should be small enough to support tracer-bullet development with
  grep-targeted runs and stable enough to describe externally visible behavior.
- Shared auth bootstrap behavior should be reused by both curated and TDD suites
  where authenticated setup is required.
- The main modules to test are the shared Playwright test surface, the
  playground host runtime composition for TDD execution, shared
  authentication/bootstrap behavior, and package-specific environment flows
  where applicable.
- Prior art for the shared CMS contract suite is the existing curated CMS
  happy-path behavior suite that is already reused across multiple runtime
  contexts.
- Prior art for package-specific tests is the current generator
  container/bootstrap/provenance coverage and the current docs-specific smoke
  coverage.
- Agent-facing TDD workflow guidance should follow behavior-first principles:
  test through public interfaces, avoid implementation-coupled assertions, and
  use vertical slices rather than bulk test authoring.
- The testing docs should clearly describe what makes a good test: externally
  observable behavior, public interface validation, resilience to refactors, and
  avoidance of internal implementation assertions.

## Out of Scope

- Replacing the existing curated CMS coverage philosophy with exhaustive
  end-to-end coverage.
- Automatically promoting all TDD tests into the curated shared suite.
- Making documentation or scaffolded-app contexts run the TDD layer by default.
- Reworking package-specific container/bootstrap/provenance tests into shared
  CMS contract tests.
- Designing a second independent authentication model for TDD execution.
- Solving every possible future placement rule for non-CMS test types outside
  the shared Playwright/testing domain.
- Defining issue-specific implementation details for a particular CMS feature
  beyond the shared TDD convention.

## Further Notes

- The core product is the CMS across the entire monorepo, even though it appears
  through different host contexts.
- The shared Playwright package already acts as CMS-specific test
  infrastructure, including shared config, shared lane definitions, and deployed
  smoke coverage, so expanding it to own shared CMS specs is consistent with the
  existing architecture.
- The main performance constraint is not just test execution, but the dependency
  build cost required to validate package-level changes through an app host.
- Playground is the default TDD host because it offers the best balance between
  realistic CMS behavior and development-time speed.
- The success of the `@tdd` pattern depends on strict tag discipline and clear
  agent-facing guidance.
