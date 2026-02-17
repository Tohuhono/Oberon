---
"@oberoncms/core": patch
---

Fix broken async reduce in zone transformations by replacing local
transformProps copy with upstream @puckeditor/core export. The local copy had a
bug where spreading an unawaited Promise accumulator silently dropped all but
the last zone's data during prop transforms.
