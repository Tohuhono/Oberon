# UI Prototype

Generate **several radically different UI variations** on a single route, switchable from a floating
bottom bar. The user flips between variants in the browser, picks one (or steals bits from each),
then throws the rest away.

If the question is about logic/state rather than what something looks like, this is the wrong
branch. Use [LOGIC.md](LOGIC.md).

## When this is the right shape

- "What should this page look like?"
- "I want to see a few options for this dashboard before committing."
- "Try a different layout for the settings screen."
- Any time the user would otherwise spend a day picking between three vague mockups in their head.

## Two sub-shapes: strongly prefer sub-shape A

Choose the affected Next.js or TanStack Playground using [ARCHITECTURE.md](../../ARCHITECTURE.md).
Use the framework named by the user or the existing host page; ask if the target is unclear. Work in
the Documentation app only when it is the requested surface.

A UI prototype is much easier to judge when it's **butting up against the rest of the app**: real
header, real sidebar, real data, real density. A throwaway route on its own is a vacuum: every
variant looks fine in isolation. Default to sub-shape A whenever there's a plausible existing page
to host the variants. Only reach for sub-shape B if the prototype genuinely has no nearby home.

### Sub-shape A: adjustment to an existing page (preferred)

The route already exists. Variants are rendered **on the same route**, gated by a `?variant=` URL
search param. The existing data fetching, params, and auth all stay. Only the rendering swaps. This
is the default; pick it unless there's a specific reason not to.

If the prototype is for something that doesn't yet have a page but _would naturally live inside one_
(a new section of the dashboard, a new card on the settings screen, a new step in an existing flow),
it's still sub-shape A. Mount the variants inside the host page.

### Sub-shape B: a new page (last resort)

Only use this when the thing being prototyped genuinely has no existing page to live inside (e.g. an
entirely new top-level surface, or a flow that can't be embedded anywhere sensible).

Create a **throwaway route** following whatever routing convention the project already uses. Don't
invent a new top-level structure. Name it so it's obviously a prototype (e.g. include the word
`prototype` in the path or filename). Same `?variant=` pattern.

Before committing to sub-shape B, sanity-check: is there really no existing page this could be
embedded in? An empty route hides design problems that a populated one would expose.

In both sub-shapes the floating bottom bar is identical.

## Process

### 1. State the question and pick N

Default to **3 variants**. More than 5 stops being radically different and starts being noise, so
cap there.

State the plan in one line in the handoff:

> "Three variants of the Pages control page, switchable via `?variant=`, in the existing Playground
> route."

This works whether the user is here to push back or not.

### 2. Generate radically different variants

Draft each variant. Hold each one to:

- The page's purpose and the data it has access to.
- Existing `@tohuhono/ui` components, Tailwind styles, theme tokens, and the host's layout.
- A clear exported component name, e.g. `VariantA`, `VariantB`, `VariantC`.

Variants must be **structurally different**: different layout, different information hierarchy,
different primary affordance, not just different colours. Three slightly-tweaked card grids isn't a
UI prototype, it's wallpaper. If two drafts come out too similar, redo one with explicit "do not use
a card grid" guidance.

### 3. Wire them together

Read `variant` with the host's existing search-parameter handling. Render the selected variant and
one switcher on the route. Keep variant selection and all prototype-only UI development-only;
production must render the normal page, or omit a prototype-only route.

For sub-shape A (existing page): keep all the existing data fetching above the switcher; only the
rendered subtree changes per variant.

For sub-shape B (new page): the throwaway route under `/prototype/<name>` mounts the same switcher.

### 4. Build the floating switcher

A small fixed-position bar at the bottom-centre of the screen with three pieces:

- **Left arrow**: cycles to the previous variant (wraps around).
- **Variant label**: shows the current variant key and, if the variant exports a name, that name
  too. e.g. `B (Sidebar layout)`.
- **Right arrow**: cycles forward (wraps around).

Behaviour:

- Clicking an arrow uses the host's Next.js or TanStack router to update `variant`, preserving other
  search parameters. The selected variant must survive reloads.
- Keyboard: `←` and `→` arrow keys also cycle. Don't intercept arrow keys when an `<input>`,
  `<textarea>`, or `[contenteditable]` is focused.
- Visually distinct from the page (e.g. high-contrast pill, subtle shadow) so it's obviously not
  part of the design being evaluated.
- Use the host's development guard for both the switcher and the variants, not just the bar.

Keep the switcher local to the prototype in its Playground or requested Documentation app. Reuse
existing shared UI components without adding prototype-only exports to `@tohuhono/ui`.

### 5. Hand it over

Use the root development command from [SKILL.md](SKILL.md). Verify that the host responds, then
check variant switching, keyboard behavior, and reloads in the browser. Surface the URL and
`?variant=` keys. The user will flip through whenever they get to it. The interesting feedback is
usually **"I want the header from B with the sidebar from C"**, which is the actual design they
want.

### 6. Capture the answer and clean up

Record the answer (which variant and why), then follow [SKILL.md](SKILL.md) to get the user's choice
of integration or optional branch preservation. If they request integration:

- **Sub-shape A**: fold the winner into the existing page; drop the losing variants and the switcher
  from main.
- **Sub-shape B**: promote the winning variant to a real route; drop the throwaway route and the
  switcher from main.

Keep any archived variants on a throwaway branch only when requested. The production change keeps
the validated design and its tests, not the prototype scaffolding.

## Anti-patterns

- **Variants that differ only in colour or copy.** That's a tweak, not a prototype. Real variants
  disagree about structure.
- **Sharing too much code between variants.** A shared `<Header>` is fine; a shared `<Layout>`
  defeats the point. Each variant should be free to throw out the layout.
- **Wiring variants to real mutations.** Read-only prototypes are fine. If a variant needs to
  mutate, point it at a stub: the question is "what should this look like", not "does the backend
  work".
- **Promoting the prototype directly to production.** The variant code was written under prototype
  constraints (no tests, minimal error handling). Rewrite it properly when you fold it in.
