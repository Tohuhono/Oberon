---
"@oberoncms/plugin-uploadthing": patch
---

Add memory limit (128KB) to stream processing in getImageSize() to prevent
unbounded memory consumption. Large image uploads now abort gracefully after
reading sufficient data for header detection, preventing OOM crashes while
maintaining backward compatibility.
