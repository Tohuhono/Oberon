import "server-cli-only"

import { compile } from "@tailwindcss/node"

const tailwindEntry = [
  '@import "tailwindcss/theme" theme(reference);',
  '@import "tailwindcss/utilities";',
].join("\n")

export async function buildCss(classes: string[]) {
  const compiler = await compile(tailwindEntry, {
    base: process.cwd(),
    onDependency() {},
  })

  return compiler.build(classes)
}
