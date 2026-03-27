# PRD: Issue 314 - Dynamic Tailwind Plugin

## Purpose

Allow Oberon sites to publish DB-authored content that uses Tailwind utilities
without requiring developers to manually fold that content back into the
application build.

The CMS needs to let content teams ship styled published pages reliably, while
preserving the application's existing Tailwind workflow for developers and
templates. The feature should make DB-authored styling a supported product
capability, not a fragile runtime workaround, and it should do so in a way that
Oberon can maintain, scaffold, and evolve across adapters without growing more
Tailwind-specific behavior in core.

## Problem

Oberon needs a supported way for published DB-authored content to activate
Tailwind utilities without requiring developers to manually mirror that content
back into the application source tree.

Today, Oberon handles DB-authored Tailwind classes by exporting them during
prebuild into `.oberon/tailwind/tailwind.classes` and letting the normal app
stylesheet discover them at build time. There is no plugin-owned runtime
stylesheet, hashed asset serving path, or persistent Tailwind state in the
database adapters.

The product has to keep two CSS concerns distinct:

- the normal application Tailwind build
- the dynamic hashed CSS derived from DB content

If those concerns are not kept separate, several problems follow:

- content teams cannot rely on DB-authored utilities being available in the
  published site
- developers and templates risk losing the clarity of the existing build-time
  Tailwind workflow
- a runtime Tailwind path can easily expand into whole-app stylesheet ownership
  instead of staying additive
- without a generic plugin persistence surface, durable runtime asset state
  would push more feature-specific behavior into core and database adapters

## Goal

Deliver a dynamic Tailwind plugin with a clean two-asset model:

1. Asset one is the standard application Tailwind output built normally from
   file-discovered classes.
2. Asset two is a separate hashed utilities stylesheet generated from published
   DB page classes.

The plugin must own the behavior for asset two while relying on the generic
plugin settings primitive for persistence.

## Non-Goals

- replacing the normal application Tailwind build
- making the dynamic asset responsible for base, preflight, or whole-app theme
  CSS
- preserving the current `.oberon/tailwind/tailwind.classes` export flow as the
  long-term architecture
- solving exact shrinking behavior for class removals in the first slice

## Users

1. Site operators who need DB-authored content to pick up dynamic Tailwind
   utilities
2. Core maintainers who want Tailwind behavior out of core-owned persistence
3. App/template consumers who need the dynamic layer to be additive rather than
   a replacement for their normal stylesheet

## User Stories

1. As an app owner, I keep my normal Tailwind build and file discovery exactly
   as before.
2. As a CMS user, published DB content can activate a second stylesheet that
   contains the utilities needed for published DB classes.
3. As a CMS user, the public site can render with the standard stylesheet even
   if the dynamic hashed asset is missing.
4. As a maintainer, I can move Tailwind-specific behavior into a plugin instead
   of keeping persistence and lifecycle logic in core.

## Functional Requirements

### Two-asset model

- The normal build-time Tailwind asset must continue using standard file-based
  discovery, standard config, and standard PostCSS.
- The dynamic Tailwind asset must be a second stylesheet loaded after the
  standard one.
- The dynamic asset must be utilities-only.
- The standard asset must ignore DB content entirely.

### Dynamic asset generation

- The dynamic asset must be derived from the union of published DB page classes.
- Publish should generate the dynamic asset when that DB-derived class set
  changes.
- Prebuild or build reconciliation is also allowed to regenerate and retarget
  the active dynamic asset.
- Missing dynamic assets are non-fatal because the standard asset remains
  available.

### Persistence model

- The plugin must use the generic plugin settings primitive.
- Immutable dynamic asset entries are keyed by hash and store CSS payload only.
- Mutable plugin state stores at least the active hash and current DB-derived
  class list in separate keys.
- The first implementation accepts last-write-wins behavior.

### Routing and render contract

- Dynamic assets remain publicly fetchable by hash.
- Public renderers load the active hashed stylesheet outside core render.
- Dynamic styles are layered after the standard stylesheet.

## Success Criteria

1. The delivered design does not require core-specific persistence methods or
   tables for dynamic Tailwind behavior.
2. The standard application stylesheet remains unchanged in role and behavior.
3. The dynamic plugin can publish and reconcile hashed utility assets from DB
   content.
4. The plugin can degrade safely to the standard stylesheet when the hashed
   asset is absent.

## Deferred Work

1. smarter shrink behavior when the effective DB class set loses utilities
2. richer concurrency controls than last-write-wins
3. more generic plugin settings query capabilities such as prefix listing

## Open Questions

1. What should replace the current `.oberon/tailwind/tailwind.classes` plus
   `@source` flow as the plugin-owned source of dynamic utilities?
2. Should prebuild reconciliation remain in the same prebuild chain as welcome
   page initialization, or simply share the lifecycle without sharing the same
   code path?
3. What rollout path is needed from the current prebuild-export model to a
   plugin-owned runtime asset model in playground, recipes, and generated apps?

## Dependencies

- Depends on #318: Plugin Settings Primitive.

## Related Docs

- [issue-314-dynamic-tailwind-plugin-implementation-plan.md](./issue-314-dynamic-tailwind-plugin-implementation-plan.md)
- [issue-318-plugin-settings-primitive-prd.md](./issue-318-plugin-settings-primitive-prd.md)
- [issue-318-plugin-settings-primitive-implementation-plan.md](./issue-318-plugin-settings-primitive-implementation-plan.md)
