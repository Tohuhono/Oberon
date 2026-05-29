import { defineConfig } from "oxfmt"

export default defineConfig({
  semi: false,
  trailingComma: "all",
  proseWrap: "always",
  ignorePatterns: ["*.d.ts", "**/meta/**"],
  sortImports: true,
})
