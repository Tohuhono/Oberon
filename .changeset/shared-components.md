---
"@oberoncms/core": minor
"@oberoncms/plugin-nextjs": minor
"@oberoncms/plugin-tailwind": minor
---

Add a Shared components library so authors can reuse published trees with per-instance props and
slots. Shared components use the `shared` Component type. Publication validates references and
cycles, and blocks deletion while a published Component uses the Shared component. Editors and
public routes render instances from the current published Shared component. Tailwind style assets
include styles from Shared components and content owned by their instances.
