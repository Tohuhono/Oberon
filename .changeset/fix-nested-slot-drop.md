---
"@oberoncms/core": patch
"@oberoncms/plugin-shared-components": patch
---

Fix drag and drop into nested slots in every editor. The preview container and the preview iframe
had the same `preview-frame` id, so Puck found the container and did not detect nested drop zones.
The preview container now has the `oberon-preview` id.

Add browser coverage to drop Text into an empty Container slot in a Shared component source, and
into an empty per-instance slot of a Shared component on a Page.
