import "server-cli-only"

import { createRequire } from "module"

type TailwindNodeModule = typeof import("@tailwindcss/node")

const require = createRequire(import.meta.url)

function hasCompile(value: unknown): value is TailwindNodeModule {
  return (
    typeof value === "object" &&
    value !== null &&
    "compile" in value &&
    typeof value.compile === "function"
  )
}

async function loadTailwindNode() {
  const module = require("@tailwindcss/node")

  if (!hasCompile(module)) {
    throw new Error("Failed to load @tailwindcss/node compiler")
  }

  return module
}

const tailwindEntry = [
  '@import "tailwindcss/theme" theme(reference);',
  '@import "tailwindcss/utilities";',
].join("\n")

export async function buildCss(classes: string[]) {
  const { compile } = await loadTailwindNode()
  const compiler = await compile(tailwindEntry, {
    base: process.cwd(),
    onDependency() {},
  })

  return compiler.build(classes)
}
