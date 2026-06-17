# TanStack Playground Later Gate: Caching/Revalidation Plugin Story

## Goal

Define and implement the caching/revalidation story required before the TanStack Playground can
replace the Next.js Playground as the canonical Playground.

## Scope

This is a later replacement gate, not an early CMS parity slice.

In scope when this gate is reached:

- identifying which rendered data must be cached or invalidated for TanStack replacement
- deciding which Plugin or Plugins provide the behavior
- validating mutation-to-visible-route freshness in the TanStack Playground

Out of scope for early slices:

- new Adapter methods solely for cache behavior
- baking caching/revalidation into `@oberoncms/plugin-tanstack` before a concrete need appears
- treating Next.js cache tag semantics as the canonical model

## Architectural Position

Caching/revalidation should work like every other Plugin behavior. A Plugin may provide any
combination of behavior, and plugin order remains the composition contract. Do not special-case this
as a separate architectural category unless implementation evidence forces that change.

## Candidate Investigation Areas

- Current Next.js behavior in `@oberoncms/plugin-nextjs`, which wraps reads and mutations with
  `unstable_cache`, `revalidatePath`, and `updateTag`.
- TanStack Start caching, static rendering, ISR, or platform-hosted cache primitives.
- Public Render route freshness after Page publish/delete.
- CMS list freshness after Page/User/Image/Site mutations.

## Testing Plan

- Start with user-visible freshness tests, not implementation-specific cache assertions.
- Use root scripts only. The likely narrow loop remains `pnpm test:e2e:new`, with final confidence
  through `pnpm validate`.
- Add shared tests only when the behavior is intended to apply to both Next.js and TanStack
  Playgrounds.

## Acceptance Criteria

- The TanStack Playground has a documented, implemented caching/revalidation Plugin story.
- Mutations that affect public rendering or CMS-visible lists produce fresh visible data without
  relying on Next.js-specific behavior.
- The implementation remains consistent with normal Plugin composition semantics.

## Risks and Mitigations

- Risk: TanStack or deployment-platform cache primitives require different semantics than Next.js.
  Mitigation: drive the design from user-visible freshness and Plugin composition, not from Next.js
  tag names.
- Risk: adding cache-specific Adapter methods too early hardens the wrong abstraction. Mitigation:
  only add new contracts after a concrete behavior cannot be expressed through normal Plugin
  composition.
