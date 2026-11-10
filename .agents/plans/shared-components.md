# Shared components

Status: plan. Not implemented.

## Outcome

Authors build a design once and reuse it in Pages and in other Shared components. A Shared component
is a named, authored Puck tree. Each use of it is a Shared component instance. Authors choose which
internal props each instance can change. Everything else stays shared, and a published change to the
source reaches every instance without publishing each Page again.

Examples:

- **Main navigation:** fully shared. Every Page shows the same navigation.
- **Site header:** contains Main navigation. A change to Main navigation reaches every Site header.
- **Article:** a shared header and layout with an exposed Body slot. Each Article instance has its
  own Body content.
- **Call to action:** shared styling with an exposed headline. Each instance starts with the source
  headline and can change it.

Shared components is core CMS behavior. Build it in `@oberoncms/core`, not as a Plugin. A host gets
it with no extra configuration.

The author experience is specified in [Shared components UI](shared-components-ui.md). Use
[CONTEXT.md](../CONTEXT.md) for vocabulary.

## Puck usage

Build on Puck 0.24.0. It is the latest release and Oberon already uses it, so no upgrade is
necessary. Puck has no built-in shared, linked or symbol component, so Shared components is an
Oberon feature that sits on top of documented Puck APIs.

Keep our maintenance exposure small:

- Use a documented Puck API when one exists. Do not write a parallel version of Puck behavior, such
  as a tree walk, a data resolver, a migration or a palette.
- Import only from the public `@puckeditor/core` entry. Do not import Puck internals or depend on
  Puck DOM structure, class names or element IDs.
- When no documented API fits, keep the custom code small and isolate it in one module. Add a
  comment that names the gap and links the Puck page that you checked.
- When a rule depends on Puck behavior that the docs do not state, add a test that fails if Puck
  changes it.
- On each Puck upgrade, read the release notes against the [Puck APIs used](#puck-apis-used) table
  and the [Puck constraints](#puck-constraints).

## Rules

These rules are the acceptance criteria for the feature.

### Sources

- A Shared component has a stable identity, a display name, an authored Puck tree and a set of
  Exposed props. Renaming it does not change its identity.
- Authors build sources with the same registered Puck components as Pages, including other Shared
  components.
- References compose: Article → Site header → Main navigation. Reject a source that references
  itself directly or through other sources.
- Publishing a source saves its tree and its Exposed props together. Source publication is separate
  from Page publication.
- Do not delete a source while a published Page or another source references it.
- Reject a publish when the source changed since the author loaded it. Do not overwrite concurrent
  edits silently.
- Reading sources follows the Pages read permission. Publishing and deleting sources need the Pages
  write permission. There is no separate Shared permission group.

### Exposed props

- An Exposed prop targets one authored node, by its stable `props.id`, and one prop name on that
  node. It has a stable key and an author-facing label.
- Changing a label keeps the key, so existing instance values stay connected.
- Making a prop shared removes its exposure. Exposing it again creates a new key, so an old instance
  value does not silently become active again.
- A source with no Exposed props is fully shared. Its instances have no editable props or slots.
- Reserved identity and runtime props, such as `id`, cannot be exposed.
- Exposing a prop is a yes/no choice for each prop of an authored component. The instance edits an
  Exposed prop with the target component's own Puck field, under the Exposed prop label. Any prop
  can be exposed, including slots.
- An exposed slot is an ownership boundary. The same source cannot also expose a target inside that
  slot's authored default children. To keep a child's design shared inside owned content, use a
  nested Shared component.
- A parent source does not re-expose the Exposed props of a nested Shared component.

### Defaults

Resolve the default for an Exposed prop in this order:

1. An explicit default in the source's `defaults` record, including falsy values.
2. The authored target node's own prop value.
3. The registered component's `defaultProps` value.
4. An empty array for a slot, otherwise an empty string.

Insertion copies the defaults into the instance. Slot defaults get new, independent descendant IDs.
When a source gains a new Exposed prop, the editor fills the missing value on existing instances
from the current default. It never replaces a value that the instance already has. The filled value
becomes Consumer data when the Consumer is next saved; publishing a source does not rewrite stored
Consumers.

### Instances

- An instance stores the source identity and a value for each Exposed prop. It does not store a copy
  of the shared tree.
- An unexposed prop belongs to the source. A published source change reaches every instance.
- An exposed scalar prop belongs to the instance. A later change to the source default does not
  replace a stored instance value.
- An exposed slot belongs to the instance, including all its children. The component that holds the
  slot keeps its shared props, such as styling.
- A Shared component instance inside an instance-owned slot keeps its own shared design. Its
  placement belongs to the outer instance.
- When an exposure is removed, stored instance values for it stay in the Consumer JSON but do not
  render.

### Validation

Reject a source publish, with an actionable message, for:

- duplicate source identities, or duplicate authored node IDs within one source;
- a missing registered component or a missing referenced source;
- a reference cycle;
- a missing or incompatible exposure target, or an invalid or reserved key;
- two exposures that target the same node prop;
- duplicate labels within one source, compared case-insensitively;
- overlapping slot ownership;
- an exposure key that is a slot in one source and a scalar in another.

### Editing and rendering

- The Page editor, Preview and public rendering show the same output for the same data.
- Drop, move, duplicate, delete, undo and redo keep ownership correct. Authors can drop components
  into an exposed slot of an instance.
- Stored data stays plain JSON. Rendering never changes a stored source.
- Tailwind style assets include classes from sources and from instance-owned content.

## Design

### Fragment storage

Store Pages and Shared components as Fragments. A Fragment is an independently addressable, authored
Puck tree. Store one record per Fragment:

| Field       | Storage and meaning                                |
| ----------- | -------------------------------------------------- |
| `key`       | Text primary key, unique across all Fragment types |
| `type`      | Indexed text that selects the applicable rules     |
| `data`      | Current published Puck JSON                        |
| `updatedAt` | Update timestamp                                   |
| `updatedBy` | Author identifier                                  |

- A Page has type `page`. Its key is its public path.
- A Shared component has type `shared`. Its key is its stable identity, independent of its name.
- Read one Fragment by key. List Fragments by type, returning metadata only, without Puck trees.

### Shared component record

A Shared component has this shape:

| Field                    | Meaning                                                                        |
| ------------------------ | ------------------------------------------------------------------------------ |
| `id`                     | Stable, nonempty identity, independent of the display name                     |
| `name`                   | Nonempty display name; duplicate names are allowed                             |
| `data`                   | Authored Puck data with `root` and `content`; nodes have `type` and `props.id` |
| `exposures`              | Record from stable instance-field key to `{ node, prop, kind, label? }`        |
| `defaults`               | Record of explicit defaults by instance-field key; `{}` when there are none    |
| `updatedAt`, `updatedBy` | Publication metadata: timestamp and current user email                         |

- `node` is the target's `props.id`. `prop` is the target prop name. `kind` is `text`, `prop` or
  `slot`.
- New exposure keys are `instance_` followed by a UUID with underscores in place of hyphens.
- The Shared component `id` is the Fragment key. The Fragment `data` holds the authored Puck tree.
  `updatedAt` and `updatedBy` come from the Fragment record.
- Decide in slice 2 where `name`, `exposures` and `defaults` live in the Fragment, so that one write
  publishes them with the tree. Do not add a second record for them.

### Instance

A stored instance is an ordinary Puck component node:

| Location                  | Value                                                           |
| ------------------------- | --------------------------------------------------------------- |
| `type`                    | `SharedComponent`                                               |
| `props.id`                | Identity of this instance                                       |
| `props.definitionId`      | Identity of the referenced Shared component                     |
| `props[instanceFieldKey]` | Scalar value, or an inline Puck child array for an exposed slot |

Do not copy the shared design into the Consumer. Nested Shared references use the same shape. Stored
data contains no render functions or callable slots.

### Editor session

Prepare an editor session from the library. Pass the library to Puck as `metadata`, so
`resolveData`, `resolveFields` and `render` read it from Puck. Do not use a parallel React context.

1. Validate the library. Generate one Puck component config for each Shared component:
   - `label`: the Shared component name.
   - `fields`: the Exposed prop fields. Each field is the target component's own field with the
     Exposed prop label.
   - `defaultProps`: the insertion defaults.
   - Put the generated configs in a "Shared components" group with `config.categories`.
2. Register each generated config under a session alias, `SharedPalette_${encodeURIComponent(id)}`.
   Puck has no presets or templates, so one config entry for each Shared component is the documented
   way to give each one its own palette entry and its own static slot fields. Use
   `overrides.drawerItem` only to style the entry, not to change insertion.
3. Fill missing Exposed prop values in the generated `resolveData` when `trigger` is `"insert"`. Do
   not dispatch a separate normalization step. Slot templates omit descendant IDs so that Puck
   assigns them on insert.
4. Map aliases back to `SharedComponent` before saving a browser draft or publishing, and map
   `SharedComponent` to aliases when the session loads. Use `walkTree` for both directions. Aliases
   are never stored.

Declare exposed slots as static `slot` fields. In 0.24, Puck finds slots only in the static `fields`
of a component config, not in `resolveFields`. The docs do not state this, so add a test for it. Use
`resolveFields` for non-slot field changes only.

Keep the canonical `SharedComponent` registration stable in a separate draft config while the
library changes.

### Exposure panel

Build the exposure controls with documented editor APIs:

- Read the selection with `useGetPuck` or `createUsePuck` (`selectedItem`, `appState`).
- Write changes with `dispatch` actions such as `replace` and `setData`, so that undo and redo work.
- Place the panel with `overrides.fields` or a `plugins` entry, as the
  [Shared components UI](shared-components-ui.md) shows.

### Instance rendering

The `SharedComponent` render function reads the source from `puck.metadata` and renders it with the
instance values. Rendering never mutates the stored Shared component and never writes the source
into the Consumer.

Start Slice 2 with a spike. Render the source with a nested `<Render config data metadata>` inside
the instance render function, and check in the Page editor that:

- the Consumer can drop, select and reorder children in an exposed slot;
- the outline shows instance-owned children under the instance;
- undo and redo work for those children.

If the nested `Render` passes, use it, and use `fieldTransforms` to make shared nodes read-only. If
it fails, write a small Instance rendering module. Record the failure and the Puck version in its
header comment. The module:

- calls the registered component render functions for the source `data.content`;
- builds callable slots for shared authored children;
- replaces exposed targets with the instance values;
- uses the slots that Puck supplies from the generated static fields for exposed instance slots, so
  the Consumer keeps ownership of drops, selection and outline entries;
- renders the ordinary shared nodes as non-editable at the instance boundary;
- resolves nested Shared references recursively;
- namespaces rendered authored IDs under the Shared component instance;
- omits editor-only slot markers from public output.

Public `Render` gets the library as `metadata` and calls `resolveAllData(data, config, metadata)`
before the server render. Client Preview uses the same `metadata`. Keep Instance rendering separate
from storage and UI, so ownership and rendering can be tested alone.

### Publication effects

After a source publish or delete, notify the Framework integration that content changed. Public
rendering resolves references against the current library and does not rewrite Consumers. The first
delivery can invalidate rendered output broadly instead of tracking each dependent Page.

### Finding references

Validation, cycle checks, delete checks, publication effects and style assets all need the
`SharedComponent` nodes and the class names in a tree. Find them with Puck
`walkTree(data, config, callback)`. It visits `content`, root slots and slots at any depth. Run Puck
`migrate(data, config)` on stored data first, so that legacy `zones` become slots. Do not write a
separate tree walk.

### Data changes

Change stored props with Puck `transformProps`. Use it when an Oberon release renames a
`SharedComponent` prop or changes the exposure value shape.

### Puck constraints

- Puck 0.24 always gives its preview iframe the ID `preview-frame` and finds the frame with
  `#preview-frame`. The core editor passes `id="preview-frame"` to `Puck.Preview`, which gives the
  wrapper the same ID. Puck then reads the host document, and drops into nested slots fail with no
  error. Use `<Puck.Preview />` with its default ID. Do this before the Shared editor work.
- Puck finds slots only in static component `fields`.
- Puck moves the drop target into a nested slot only after the pointer rests over that slot for a
  short time. Acceptance tests must wait for Puck's status announcement that names the target zone,
  then wait about 500 ms before release.
- Puck runtime metadata is not SEO metadata.

### Puck APIs used

| Need                         | Puck API                                                                   |
| ---------------------------- | -------------------------------------------------------------------------- |
| Palette entry and group      | [ComponentConfig][component-config], [`categories`][config]                |
| Palette style                | [`overrides.drawerItem`][overrides]                                        |
| Exposed slots                | [Slot field][slot]                                                         |
| Insertion values             | `defaultProps`, [`resolveData`][resolve-data] `trigger`                    |
| Instance field changes       | [`resolveFields`][resolve-fields]                                          |
| Library in editor and render | [`metadata`][metadata]                                                     |
| Server resolution            | [`resolveAllData`][resolve-all-data]                                       |
| Public render                | [`Render`][render]                                                         |
| Read-only shared nodes       | [Field transforms][field-transforms]                                       |
| Exposure panel               | [`overrides`][overrides], [Plugins][plugins], [`useGetPuck`][use-get-puck] |
| Editor writes with undo      | [`dispatch`][dispatch]                                                     |
| Find references              | [`walkTree`][walk-tree]                                                    |
| Legacy zones                 | [`migrate`][migrate]                                                       |
| Prop migrations              | [`transformProps`][transform-props]                                        |
| Preview frame                | [`Puck.Preview`][puck-preview]                                             |

[component-config]: https://puckeditor.com/docs/api-reference/configuration/component-config
[config]: https://puckeditor.com/docs/api-reference/configuration/config
[overrides]: https://puckeditor.com/docs/api-reference/overrides
[slot]: https://puckeditor.com/docs/api-reference/fields/slot
[resolve-data]:
  https://puckeditor.com/docs/api-reference/configuration/component-config#resolvedatadata-params
[resolve-fields]:
  https://puckeditor.com/docs/api-reference/configuration/component-config#resolvefieldsdata-params
[metadata]: https://puckeditor.com/docs/api-reference/components/puck#metadata
[resolve-all-data]: https://puckeditor.com/docs/api-reference/functions/resolve-all-data
[render]: https://puckeditor.com/docs/api-reference/components/render
[field-transforms]: https://puckeditor.com/docs/extending-puck/field-transforms
[plugins]: https://puckeditor.com/docs/extending-puck/plugins
[use-get-puck]: https://puckeditor.com/docs/api-reference/functions/use-get-puck
[dispatch]: https://puckeditor.com/docs/api-reference/puck-api#dispatchaction
[walk-tree]: https://puckeditor.com/docs/api-reference/functions/walk-tree
[migrate]: https://puckeditor.com/docs/api-reference/functions/migrate
[transform-props]: https://puckeditor.com/docs/api-reference/functions/transform-props
[puck-preview]: https://puckeditor.com/docs/api-reference/components/puck-preview

## Delivery

### Slice 1: Fragment storage and lifecycle

Replace the Page operations with Fragment operations and update all callers in the same change:

| Current operation | Replacement           |
| ----------------- | --------------------- |
| `addPage`         | `addFragment`         |
| `getPageData`     | `getFragmentData`     |
| `getAllPages`     | `getAllFragments`     |
| `updatePageData`  | `updateFragmentData`  |
| `deletePage`      | `deleteFragment`      |
| `publishPageData` | `publishFragmentData` |

- Update core schemas, types, Adapter composition, Oberon actions and tests.
- Apply Page path validation only to type `page`. Carry the type through the write lifecycle so
  Plugins can apply effects by type.
- Keep authorization and Request authority in the existing composed flow.
- Add an optional `expectedUpdatedAt` to publish and delete. Reject the write when it does not
  match.
- Update the database Plugins. Migrate existing Page rows to type `page`, keeping keys, data and
  update metadata.
- Update the Next.js and TanStack transports, editor publication and bootstrap.
- Page lists, path enumeration, metadata and public routes select only type `page`. Page route
  effects apply only to Pages.

Done when:

- A Page and a route-free test Fragment can be created, read, published and deleted through the
  composed operations. Keys are unique across types.
- Lists filter by type and do not load Puck trees.
- A non-Page Fragment never appears in Page lists or public routes.
- Add Page, editing, browser drafts, Publish, Preview, View, copy and delete work in both
  Playgrounds.
- Migration keeps existing Pages.

### Slice 2: Shared components vertical slice

Build in core: the Shared component model and validation, reference finding, the editor session,
Instance rendering, `metadata` for every render path, publication effects, the library, the source
editor and the exposure panel. Follow the [Shared components UI](shared-components-ui.md) and
[Puck usage](#puck-usage).

Start with two decisions:

1. The Fragment mapping for `name`, `exposures` and `defaults`.
2. The Instance rendering spike: nested `Render` or a small custom module.

Done when:

- An author creates the Article example from the library, exposes its Body slot, and publishes.
- Two Article instances on one Page keep separate Body children and separate scalar values after
  publish and reload.
- A source change reaches both instances without a Page publish and keeps their values.
- Site header with nested Main navigation renders correctly inside an Article Body.
- Editor, Preview and public output match.
- Cycles, missing sources, invalid exposures and blocked deletes show actionable messages.
- No module walks Puck trees, resolves Puck data or migrates Puck data outside the documented Puck
  functions. Each custom Puck-adjacent module names its Puck gap.
- A test fails if Puck stops finding slots in static fields, or if Puck changes the preview frame
  ID.
- Playwright covers nested-slot drops in the Page editor, the source editor and an exposed slot on a
  Page. It also covers move, duplicate, delete, undo and redo for instances.

### Slice 3: Hardening

- Verify publication and cache effects in each Framework integration and database Plugin.
- Verify Tailwind style assets for source and instance-owned classes.
- Validate a metadata consumer, without making metadata a content type.

## Out of scope

- Fragment history. It will use a separate table linked to the Fragment key. See the
  [Page history draft](https://github.com/Tohuhono/Oberon/issues/389).
- A separate Template record type and override inheritance.
- Automatic reconnection or migration of Exposed props after the source tree changes.
- Version pins and multi-source atomic publication.
