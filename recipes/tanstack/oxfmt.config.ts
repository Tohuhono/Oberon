import { defineConfig } from "oxfmt"

export default defineConfig({
  semi: false,
  trailingComma: "all",
  proseWrap: "always",
  ignorePatterns: ["src/routeTree.gen.ts", "*.d.ts"],
  sortImports: true,
})
