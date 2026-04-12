# 2026-04-12 Remote Resume Handover

## Snapshot

- branch: `finalise/20260409-022313-puck-editor-shell-alignment`
- repo status: dirty working tree with editor shell, theme switcher, and UI
  theme changes in progress
- latest validation: not run for the latest iteration; user explicitly chose
  dev-mode iteration instead
- current discussion state: no active implementation started for the theme
  remount problem yet; the last work was analysis and repo exploration

## Working Tree Summary

Modified files:

- `packages/oberoncms/core/src/components/editor.tsx`
- `packages/oberoncms/core/src/components/editor/header.tsx`
- `packages/oberoncms/core/src/components/editor/preview.tsx`
- `packages/oberoncms/core/src/components/editor/sidebar.tsx`
- `packages/oberoncms/core/src/components/menu.tsx`
- `packages/oberoncms/core/src/editor.tsx`
- `packages/oberoncms/core/src/lib/utils.ts`
- `packages/tohuhono/ui/src/components/button.tsx`
- `packages/tohuhono/ui/src/components/toaster.tsx`
- `packages/tohuhono/ui/src/theme.ts`
- `packages/tohuhono/ui/src/theme/default-theme.ts`
- `packages/tohuhono/ui/src/theme/mode-toggle.tsx`
- `packages/tohuhono/ui/tailwind.css`
- `packages/tohuhono/utils/src/index.ts`

Untracked files:

- `packages/tohuhono/ui/src/plugin/corner-shape.ts`
- `packages/tohuhono/ui/src/theme/theme-switcher-menu.tsx`
- `packages/tohuhono/ui/src/theme/themes.ts`

## What Changed In This Session

- explored the preview bevel styling in the editor and iterated several times
- user manually adjusted the editor preview frame to the currently preferred
  look
- converted the frame shadow styling toward Tailwind-class usage during
  iteration, but the user later undid some of those edits
- investigated why the new theme switcher loses its selected preset during
  navigation

## Current Product / UX Conclusion

The user wants the theme switcher to remain ephemeral.

- do not persist the selected theme preset in localStorage
- do not persist the preset in any durable storage
- preserving the switcher state across CMS navigation is still desired
- user preference is to avoid remounting the header menu rather than solving it
  with persistence

## Root Cause Analysis Captured

The selected preset is currently local component state inside
`ThemeSwitcherMenu`, so every remount resets it.

Relevant code landmarks:

- `packages/tohuhono/ui/src/theme/theme-switcher-menu.tsx`
- `packages/oberoncms/core/src/components/menu.tsx`
- `packages/oberoncms/core/src/components/editor/header.tsx`
- `packages/oberoncms/core/src/editor.tsx`

The CMS route structure currently renders the CMS from per-page entries, so
navigation replaces the page subtree:

- `apps/playground/app/(oberon)/cms/[[...path]]/page.tsx`
- `apps/documentation/src/app/cms/[[...path]]/page.tsx`

That means keeping the menu mounted is not a local editor-header change. If the
menu must truly survive navigation without persistence, it needs to live in a
shared client shell mounted from a CMS layout boundary above the catch-all page.

## Best Restart Options

### Option A: Fix It The Way The User Asked

Prevent menu remounts by introducing a shared CMS layout/client shell.

Expected shape:

1. add a CMS layout above `page.tsx` for the `[[...path]]` route
2. mount a persistent client shell there
3. render the menu once in that shell
4. swap only the inner page content on navigation
5. keep theme preset state in-memory inside that persistent shell or a child
   store

This matches the user request because the menu itself stops remounting.

### Option B: Smaller Technical Fix If Scope Changes Later

Use an in-memory shared store in `@tohuhono/ui/theme` so remounts no longer
matter during SPA navigation, but still reset on full reload.

This was discussed but is currently not the user's preferred direction.

## Important Constraints For The Next Session

- keep the theme switcher ephemeral
- do not use localStorage for the theme preset
- do not claim the problem is solved by persistence
- if implementing the menu-stays-mounted approach, do it at the route/layout
  boundary, not by only moving pieces around inside `Editor`

## Current Editor State To Be Aware Of

- `packages/oberoncms/core/src/components/editor.tsx` currently contains the
  user-tuned preview frame styling and editor shell changes
- the file currently logs `"A componlement was inserted:"` on insert; note the
  typo if touching that code again
- the current frame shadow class in the editor uses
  `shadow-foreground h-full shadow-[0_0_3px_1px]`

## Open Risks / Things To Re-check Before Editing

- `packages/tohuhono/ui/tailwind.css` has broad theme-token edits in the dirty
  tree and should be read carefully before making unrelated UI changes
- the current working tree includes multiple user-driven style experiments; do
  not revert broadly
- no fresh `pnpm validate` run exists for the latest state

## Suggested Restart Point

Start by designing the persistent CMS shell needed to keep `Menu` mounted across
navigation.

Concrete first steps:

1. inspect whether a `layout.tsx` can be added under each CMS catch-all route
   without breaking existing server data flow
2. decide what data belongs in the persistent client shell versus the route page
   payload
3. only after the shell boundary is clear, move the theme switcher state to that
   persistent layer
