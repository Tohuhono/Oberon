//@ts-check

import { initConfig } from "@dev/vite"
import { defineConfig } from "vite"
import { generateTemplates } from "./scripts/generate-templates"

const base = initConfig()
export default defineConfig({
  ...base,
  plugins: [
    ...(base.plugins || []),
    {
      name: "prebuild-lugin",
      async buildStart() {
        await generateTemplates()
      },
    },
  ],
})
