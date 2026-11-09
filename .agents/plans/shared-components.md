# Shared components

Status: working design. The agreed first delivery slice is fragment storage and the core lifecycle.
Shared component authoring follows that slice. This document records the plan; implementation starts
as a separate task.

## Aim

Separate authored component data from Page ownership. Let authors build reusable component trees and
use them as components inside Pages or other Shared components.

Examples include Main navigation, a Site header that contains Main navigation, and an Article layout
with instance-owned content. SEO and metadata are example consumers, not separate design primitives.
The design should accept registered Puck components rather than a fixed set of content types.

Use [CONTEXT.md](../CONTEXT.md) for the agreed vocabulary.

## Agreed direction

- Use one authored container for one or more Puck components. A single configured Navigation does
  not need a separate record type from an assembled Header.
- Surface each Shared component as a Puck component in the consumer's component tree.
- Allow references between Shared components. Main navigation can remain shared inside Site header,
  which can appear inside Article.
- Let authors compose these trees visually. A library near the existing component palette is a
  plausible UI; its tab, location, and layout are not requirements.
- Expose selected internal component props as ordinary props on the generated component. Reuse Puck
  field definitions where practical, including slot fields.
- Give Exposed props public names and map them to internal component props. Naming and reconnecting
  these props through an authoring UI are outside the first POC.
- Use ordinary Puck defaults for Exposed props: seed values on insertion and retain instance-owned
  values after insertion. Changing a default does not replace existing instance values.
- Keep unexposed authored content shared. The intended behavior is that publishing shared changes
  updates consumers without separately publishing each Page. Cache and publication mechanics are not
  yet settled.
- Treat an Article template as a use of Shared components, rather than requiring a separate
  primitive before the experiment. Full Template propagation is not a POC acceptance requirement.
- Prefer the same registered component definitions in Page and Shared component authoring. Full
  compatibility is not a first-POC requirement.

## First delivery slice: fragment storage and core lifecycle

Generalise the current Page lifecycle so that a later Shared Plugin can use the same operations.
Pages remain the production consumer in this slice. Use a route-free test fixture to prove that the
common operations support another type.

### Fragment record

A fragment is an independently addressable, authored Puck tree. Store one record per fragment:

| Field       | Storage and meaning                                |
| ----------- | -------------------------------------------------- |
| `key`       | Text primary key, unique across all fragment types |
| `type`      | Indexed text that selects the applicable rules     |
| `data`      | Current published Puck JSON                        |
| `updatedAt` | Update timestamp                                   |
| `updatedBy` | Author identifier                                  |

For a Page, `type` is `page` and `key` remains its public path. Other types can use keys that are
not paths. Type classifies the record; the key alone identifies it.

Read one fragment by its key. Filter listings by type and return metadata without loading the Puck
trees. Preserve indexed Page reads and lightweight Page listings.

### Core changes

Replace the Page operations and update all callers in the same change:

| Current operation | Replacement           |
| ----------------- | --------------------- |
| `addPage`         | `addFragment`         |
| `getPageData`     | `getFragmentData`     |
| `getAllPages`     | `getAllFragments`     |
| `updatePageData`  | `updateFragmentData`  |
| `deletePage`      | `deleteFragment`      |
| `publishPageData` | `publishFragmentData` |

- Update core schemas, types, Adapter composition, Oberon actions and tests to use the fragment
  record and operations. Replace the old names directly.
- Let Plugins apply validation and effects based on the fragment type. Apply Page path validation
  when the type is `page`; carry the type through the composed write lifecycle.
- Keep authorization and Request authority in the existing composed flow, including Oberon action
  transports and attached Plugin hooks.
- Update database Plugins and their schemas. Migrate existing Page rows to type `page`, preserving
  their keys, Puck data and update metadata.
- Update Next.js and TanStack action transports, editor publication, bootstrap and other callers.
  Keep the existing Pages UI, browser-local drafts, Preview and public rendering.
- Make Page lists, path enumeration, metadata and public route resolution select Page records. Apply
  Page route effects only to those records.
- Update content-write hooks and published-content readers. Tailwind prepares styles from published
  fragment trees. The shared traversal work remains a separate task.
- Update existing component-transform callers to the new operations as part of the rename. Database
  schema migration is the migration work in this slice.

### Completion checks

- Create, read, publish and delete both a Page and a route-free test fragment through the composed
  operations. Verify metadata and global key uniqueness.
- Verify type-filtered metadata listings and exact-key reads. Keep full Puck trees out of list
  queries.
- Verify Page path validation, authorization, publication effects and public route resolution. A
  route-free fragment stays outside Page lists, public routes and Page route effects.
- Exercise Add Page, editing, browser-local drafts, Publish, Preview, View, copy and delete in both
  Playgrounds with the new operations.
- Verify that database schema migration preserves existing Page records.
- Run root `pnpm format` and `pnpm validate`.

### Following slices

Implement Shared component authoring and consumption in a Plugin that uses these operations. That
Plugin supplies reference resolution, Exposed prop validation and the authoring UI described below.

History is a later feature with a separate table linked to the fragment key. Rename must preserve
history ownership when that feature is added. See the
[Page history draft](https://github.com/Tohuhono/Oberon/issues/389).

## Architecture sketch

### Authored definition

A definition needs a stable identity, a display name, its authored Puck tree, and exposure
information. This is a conceptual shape, not a decision about the database schema.

An exposure connects a public prop name to an internal component and prop. For example:

| Public prop | Internal target   | Puck field |
| ----------- | ----------------- | ---------- |
| title       | Heading text      | text       |
| body        | Container content | slot       |

The surrounding Header, Footer, and spacing can remain unexposed shared content.

### Generated component config

Build a Puck component config from the definition and its exposure information. It supplies the
label, exposed fields, insertion defaults, and a render function. Use the same definitions to
prepare editor and public-render configuration.

The first experiment can hard-code the definition and exposure information. It must still render an
authored tree, rather than only demonstrate a hand-written React layout with slots.

### Shared component instance

The consumer stores the Shared component's identity and its instance prop values through the
component representation. Slot children belong to the instance. Do not require a Page route for the
authored definition or copy the shared tree into every Page as the architectural default.

The encoding of identity in Puck component types versus a reference prop remains an implementation
choice. Generated configs for each Shared component are the initial hypothesis, not a finalized
storage API.

### Render bridge

Apply instance values to exposed targets without changing the shared stored definition. Render
unexposed content from the definition. Render exposed slot content with the consumer instance's
editing ownership.

Keep this bridge separate from storage and palette UI so the first experiment can test it alone.

## Puck evidence and open technical risks

Research used the installed Puck 0.23.0 source and upstream documentation. These are source-based
findings, not results from a working Shared component prototype.

- [ComponentConfig](https://puckeditor.com/docs/api-reference/configuration/component-config)
  provides fields, defaults, rendering, and resolution hooks.
- [Slots](https://puckeditor.com/docs/api-reference/fields/slot) store nested component data in
  props and supply callable slot components during rendering.
- [DropZone-to-slot migration](https://puckeditor.com/docs/guides/migrations/dropzones-to-slots)
  explains the difference between legacy instance-scoped zone keys and inline slot data. Use the
  slot model for the initial experiment.
- A nested [Render](https://puckeditor.com/docs/api-reference/components/render) creates its own
  rendering context. In the installed editor source, forwarding an outer editable slot beneath that
  context does not preserve its component owner. Nested Render alone is not the bridge.
- The installed editor transforms slots from the component config's fields. Define exposed slots in
  the generated static fields; do not assume resolveFields alone creates working slots.
- Reusing a field definition does not prove that its callbacks, resolvers, or runtime dependencies
  work unchanged at a Shared component boundary. Test compatibility incrementally.
- Puck runtime metadata is not SEO metadata.
  [Issue 1201](https://github.com/puckeditor/puck/issues/1201) concerns passing runtime context to
  resolveAllData, not an SEO or shared-content system.

Oberon's public renderer currently passes only components from its Puck config. Audit editor and
public-render parity when testing the bridge. Arbitrary component support does not itself define how
a host framework extracts metadata; revisit that with a concrete consumer after the seam works.

## Proposed roadmap

### 1. Deliver fragment storage and the core lifecycle

Complete the first delivery slice above. Pages exercise the production flow; test fixtures prove
that route-free authored trees can use the same operations.

### 2. Prove the rendering seam

Use one fixed authored tree and a hard-coded exposure map. Generate one Shared component with a text
field and a slot. Insert two instances in a Page.

Completion evidence:

- Each instance retains its own text and slot children.
- Drop, move, duplicate, and delete operations preserve the correct instance ownership.
- Undo/redo and save/reload preserve the same structure and values.
- Editor preview and public rendering agree.
- Updating unexposed fixture content changes both instances without overwriting their props.
- Rendering uses no persisted functions and does not mutate the shared definition.

If the bridge needs unsupported Puck internals, document that constraint and reconsider the
rendering approach before adding persistence or UI. Do not claim a working seam from source
inspection alone.

### 3. Exercise shared authoring

Replace the fixed definition with independently stored, visually authored content. Add the minimum
library workflow needed to create, find, edit, and insert it. Exercise Article to Site header to
Main navigation references.

Keep exposure configuration hard-coded if useful. Inline versus separate editing is not an
acceptance constraint. Use the fragment storage and core operations from the first slice.

Completion evidence: shared authored changes reach the example consumers while instance-owned
content stays independent. Reject cyclic references and show an actionable missing-reference error
for the demonstrated workflow.

### 4. Explore exposure authoring

Add field selection, public names, labels, and defaults to the Shared component editor. Preserve
instance values when an author reconnects an exposure to a compatible internal field. Explore
library presentation and additional Puck field types through real authoring examples.

### 5. Plan production contracts

Decide Shared publication visibility and cache invalidation, dependency tracking, deletion rules,
permissions, config loading, and framework parity. Validate a metadata consumer here without making
it the content abstraction.

## First-POC exclusions

The rendering experiment does not require an exposure editor, automatic reconnection, prop renaming
migrations, an override-inheritance system, a new Template record type, a specific library layout,
production publishing, or complete support for all Puck fields and component behaviors.

Confirm the roadmap before feature implementation. Record an ADR only after the rendering experiment
establishes a consequential trade-off that needs durable rationale.
