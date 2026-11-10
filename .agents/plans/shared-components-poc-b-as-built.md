# Shared components: PoC B as built

Status: functional baseline for the next implementation, recorded on 2026-11-10. This describes the
working PoC B in `.tmp/shared-reference` on branch `poc/shared-reference`. It is not a released API
or a requirement to copy the prototype code. Source paths below are relative to that worktree.

Read this record when implementing Shared component behavior, storage, reference resolution, or core
extension support. The [plan](shared-components.md) retains the agreed Fragment lifecycle slice. PoC
B uses KV storage and does not implement that slice.

This record is historical. Shared components is now core behavior, not Plugin-owned, and the
[Shared components UI](shared-components-ui.md) is agreed. The [plan](shared-components.md) records
these decisions.

## Outcome and scope

PoC B demonstrates a Plugin-owned Shared component feature. Core supplies generic extension support;
it does not own the Shared definition schema, reference type, exposure rules, or library. Shared
components are authored Puck trees, not hand-written layouts or copies expanded into Pages.

The next step is an implementation that we can iterate on, using this functionality as its baseline.
The experiment does not establish a good UI. Tab placement, labels, panels, navigation, and the
source-editing presentation remain open. The distinctions between source authoring, instance
editing, insertion, and publication are functional distinctions, not layout requirements.

## Functional behavior

- Authors create and edit named Shared components using registered Puck components.
- Pages and Shared components can contain Shared component instances. References compose, such as
  Article → Site header → Main navigation. Cyclic references are rejected.
- Each instance references a stable Shared component identity and stores its own Exposed prop
  values. A display-name change does not change that identity.
- An unexposed prop belongs to the Shared component. Publishing a change updates consumers without a
  separate Page publish.
- An Exposed prop belongs to the instance. Its initial value comes from the source default; later
  source-default changes do not replace a stored instance value.
- An exposed slot owns its child tree per instance. Ordinary Containers and Text inside that slot
  remain local to the instance. The enclosing Shared Container can retain shared styling while its
  content is instance-owned.
- A Shared component reference inside an instance-owned Container retains its own shared design.
  Placement belongs to the instance; the referenced design still belongs to its source.
- Authors can make eligible props shared or per-instance and give Exposed props labels. Publishing
  saves the authored tree and exposure map together. A component with no exposures is wholly shared;
  its instances have no editable Exposed props or owned slots.
- Native Puck insertion and slot editing work alongside normal Pages, Add Page, Publish, Preview,
  View, and public rendering. The feature does not replace the Page workflow.

## Responsibility boundaries

| Owner                       | As-built responsibility                                                                                                                    |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Shared-components Plugin    | Definition schema, library, exposure validation, reference resolution, editor session, render bridge, and Handler                          |
| Core package                | Generic authoring contributions, reusable Page editor, content preparation, change notification, existing permissions and Handler dispatch |
| Database Plugin             | Existing namespaced JSON KV operations; normal Page persistence remains separate                                                           |
| Framework integration       | Request authority, Handler routing, and framework cache invalidation                                                                       |
| Registered component config | Field definitions, insertion defaults, and component render functions                                                                      |

The server Plugin is `packages/plugins/shared-components/src/index.ts`; its browser entrypoint is
`src/client.tsx`. The Playground registers the Plugin in `apps/playground/oberon/config.ts` and the
authoring contributions in `client.config.tsx`. The component registry has a server-safe entrypoint
so server preparation does not import editor CSS.

### Generic core support exercised

- `prepareContent({ config, data })` returns prepared Puck config and data. Its default is identity;
  Plugin hooks compose through `next`. The Shared Plugin prepares the result of earlier hooks.
- `contentChanged()` notifies integrations after non-Page content changes. It carries no Shared
  component schema or identity. In the Next.js experiment it revalidates the root layout.
- `OberonClientConfig.authoring.Editor` and `.Preview` select browser authoring contributions.
- The reusable `PageEditor` accepts data preparation before Page publication, a publication override
  for source editing, a separate draft key/config, and generic contribution points.

Core public `Render` calls `prepareContent` before Puck's server renderer when the caller supplies
the Adapter. The Playground public route supplies it; callers that omit it bypass preparation.
Client Preview prepares its own session from the same model/runtime. The Plugin must be installed
wherever canonical Shared references are rendered. These seams are proven mechanisms, not finalized
public APIs.

## Stored data and identity

### Shared definition

`src/model.ts` defines and parses the following JSON structure:

| Field                    | As-built meaning                                                               |
| ------------------------ | ------------------------------------------------------------------------------ |
| `id`                     | Stable, nonempty string identity, independent of display name                  |
| `name`                   | Nonempty display name; duplicate names are allowed                             |
| `data`                   | Authored Puck data with `root` and `content`; nodes have `type` and `props.id` |
| `exposures`              | Record from stable instance-field key to `{ node, prop, kind, label? }`        |
| `defaults`               | Record of explicit defaults by instance-field key, defaulting to `{}`          |
| `updatedAt`, `updatedBy` | Optional metadata; publication supplies timestamp and current user email       |

An exposure targets the authored node's stable `props.id` and its prop name. `kind` is `text`,
`prop`, or `slot`. It is metadata for supported fields, not another authored content tree.

New exposure keys use `instance_` plus a UUID with underscores. `label` is the author-facing field
name; changing it preserves the storage key and existing instance values. The earlier `title` and
`body` keys remain supported. A definition's name, an exposure's label, and either identity are
separate concepts.

Making a prop shared removes its exposure. Stored instance props can remain in consumer JSON, but
the render bridge no longer applies them. Exposing the prop again creates a fresh key, so an old
override does not silently become active again. Reconnecting an exposure to a different target is
not an implemented authoring operation.

### Canonical instance

A persisted instance is an ordinary Puck component node:

| Location                  | Value                                                          |
| ------------------------- | -------------------------------------------------------------- |
| `type`                    | `SharedComponent`                                              |
| `props.id`                | Identity of this consumer instance                             |
| `props.definitionId`      | Identity of the referenced Shared definition                   |
| `props[instanceFieldKey]` | Scalar override or inline Puck child array for an exposed slot |

Shared design data is not copied into the Page. Only the reference and instance-owned values are
stored there. Nested Shared references use the same representation. Stored data contains no render
functions or callable slots.

### Prototype persistence

The complete library is one JSON array in KV, with namespace `oberon-shared-components` and key
`definitions`. There is no enclosing `definitions` object. Bootstrap seeds example definitions only
when that KV key is absent. The local Playground uses its existing SQLite database.

No database schema or Shared-specific database Adapter methods were added. This is a prototype
storage policy, not a decision to retain a single library record. The planned Fragment storage would
instead supply independently addressable records and the common authored-content lifecycle. The PoC
does not establish a migration or final encoding for that integration.

## Exposure and default semantics

The implemented exposure surface is static, top-level registered fields of type `text`, `textarea`,
`number`, `select`, `radio`, or `slot`. Reserved identity/runtime props are excluded. The generated
field reuses the registered field configuration, changing its label. This preserves settings such as
options and slot restrictions; it is not proof that every field callback or resolver works across
the boundary.

Defaults resolve in this order:

1. An own property in the definition's `defaults` record, including falsey values.
2. The authored target node's own prop.
3. The registered component's `defaultProps` value.
4. An empty array for a slot, otherwise an empty string.

The source-publish workflow currently writes `defaults: {}`. Authored target props therefore act as
defaults in normal use; the explicit-default record exists in the model but has no separate
authoring workflow.

Insertion copies defaults into the instance. Slot defaults receive independent descendant IDs.
Editor/session normalization fills a missing active Exposed prop from current defaults, including
new exposures added after a reference was created. It preserves any existing own value and does not
keep resetting the instance on later normalization. That initialization becomes consumer data when
the Page or containing Shared component is saved; publishing an exposure does not migrate all stored
consumers eagerly.

Exposing a slot establishes an ownership boundary around its children. The same definition cannot
also expose a target inside that slot's authored default subtree. A nested Shared reference is the
way to keep a child's design shared inside owned content. The exposure authoring workflow does not
re-expose a nested Shared component's props through its parent definition.

## Editor session and render bridge

`src/runtime.tsx` provides `prepareSession`. Its main transformations are:

1. Validate the library and register a generated component config for each definition.
2. Map canonical references to session aliases of the form
   `SharedPalette_${encodeURIComponent(definition.id)}`. Each alias has the definition's label,
   fields, and insertion defaults. Puck can insert the intended definition directly.
3. Normalize newly inserted references and initialize missing instance values. Slot templates omit
   descendant IDs so native Puck insertion can assign them.
4. Convert aliases back to canonical `SharedComponent` nodes with `read()` before saving local Page
   drafts or publishing authored data. Aliases are session representations, not stored identity.

Mapping uses copy-on-write traversal through inline component slots, configured root slots, and
legacy `zones`. A separate `draftConfig` keeps the canonical component registration stable as the
library changes. Normalization does not add an undo-history entry.

Rendering does not nest a complete Puck `Render` for each definition. The custom bridge walks the
definition's `data.content`, calls registered component render functions, constructs callable slots
for authored shared children, and replaces exposed targets with instance values. Puck supplies the
exposed instance slots from their generated static field definitions, retaining consumer ownership.
Ordinary nodes in the shared design are rendered non-editable at the consumer boundary.

The bridge resolves nested Shared references recursively, namespaces rendered authored IDs under the
consumer instance, and does not mutate the definition. Editor-only slot markers are absent from
public rendering. This works for the demonstrated components; it is not a complete replacement for
every Puck render/resolution behavior.

## Publication, validation, and permissions

The Plugin Handler is mounted at `/cms/api/shared-components`:

| Method   | Behavior                                                                                                                                    |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET`    | Read the library, subject to existing Pages read permission                                                                                 |
| `POST`   | Parse a definition, replace its same-ID record, validate the resulting library, add update metadata, write KV, then call `contentChanged()` |
| `DELETE` | Validate the remaining library, scan stored Pages for references, then write KV and notify; reject a referenced source                      |

Writes use Pages write permission through `adapter.can`. Reads follow the configured Pages read
policy; they are not unconditionally authenticated. The experiment has no separate Shared component
permission group or per-definition ownership policy.

Validation rejects duplicate definition IDs, duplicate authored node IDs within a definition,
missing registered components or referenced definitions, reference cycles, missing/incompatible
exposure targets, invalid/reserved keys, duplicate target mappings, duplicate case-insensitive
labels, and overlapping slot ownership. The canonical field union also requires each exposure key to
be consistently slot or scalar across the library. Labels need only be unique within a definition.

Source publication stores the authored tree and exposure metadata independently of Page publication.
Public rendering resolves references against the current library; it does not rewrite consumer Page
rows. The Next.js change hook broadly invalidates rendered output rather than tracking each
dependent Page. Source-editing transitions preserve the in-memory Page draft.

## Evidence

The model tests in `src/model.test.ts` cover canonical round-trips, nested slot mapping, independent
defaults and IDs, alias identity, label changes, remove/re-add behavior, native field settings,
new-slot initialization, and library validation. The browser suite in
`dev/playwright/test/cms/shared-components.spec.ts` exercises normal CMS workflows, native
insertion, independent props and slots, source changes, publication, reload, public output, and
rejection paths.

The completed PoC validation run reported 96/96 tasks, including 13 model tests and Playground
browser results of 47 passed and 1 skipped. It ran in the disposable validation checkout, not
against the author's live database. These are historical PoC results, not validation of the future
implementation or a fresh run caused by this documentation change.

A separate live browser check used the existing local database and a dedicated
`/sharing_proof_20261110` Page. It demonstrated two distinct headlines and child trees, one shared
announcement update reaching both, and an independently updated Shared badge inside one instance's
owned Container. Editor reload and public output retained those results without republishing the
Page after source updates. This is behavioral evidence, not a UI recommendation or a durable test
fixture; the local Page and worktree can be removed.

## Limits to carry into implementation

- **Persistence and publication:** whole-library writes have no revision check, dependency index, or
  transaction spanning validation, reference scans, writes, and invalidation. Concurrent edits can
  overwrite each other. There are no published releases, version pins, or multi-source atomic
  publication. Deletion checks stored content, not unsaved browser drafts.
- **Traversal:** runtime mapping covers more shapes than model validation/deletion traversal.
  `visitNodes` starts at `data.content`, omits root slots, and rejects nonempty legacy zones.
  Root-slot references can escape those checks; legacy Page zones can block deletion. This needs one
  coherent traversal contract. The definition render bridge renders `content`, not a definition root
  layout.
- **Puck compatibility:** richtext, custom/external fields, nested object/array fields, dynamic
  field schemas, and component resolution behavior are not generally proven. Full
  move/duplicate/delete and undo/redo parity needs explicit implementation acceptance coverage, not
  inference from native controls. Exposure metadata currently sits outside Puck design undo and is
  discarded on leaving source editing without publication.
- **Effects and frameworks:** live proof used Next.js and local SQLite. Other Framework
  integrations, storage Plugins, deployment caches, metadata consumers, and static output remain to
  verify. Generic invalidation alone does not establish complete Tailwind style-asset generation
  from referenced trees; published Fragment traversal must account for shared and instance-owned
  content.
- **Lifecycle:** source creation persists a starter immediately. There is no separate server-side
  draft/history lifecycle, automatic exposure reconnection, or removal migration for stale instance
  props. These shortcuts are not requirements for the implementation.

## Implementation hand-off

Retain the demonstrated ownership rules and canonical-reference behavior as acceptance criteria.
Deliver the agreed Fragment lifecycle and then integrate a Plugin-owned Shared component feature
with it. Use a vertical slice that proves source publication, two independent instances, an owned
slot with nested Shared content, and editor/public-render parity before expanding field support.

Decide the production extension contracts, persistence mapping, traversal rules, publication
effects, and failure/concurrency behavior in that implementation. The PoC supplies concrete evidence
and constraints for those decisions, not a mandate to retain its KV array, custom bridge
implementation, endpoint shape, or UI. UI design can be iterated separately without changing content
ownership.
