---
"@oberoncms/plugin-flydrive": patch
---

Fix infinite loop in getImageSize() that could hang the application when image
size cannot be determined. The function now tries once and falls back to default
size on error, instead of looping forever on a static buffer.
