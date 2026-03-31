import "server-cli-only"

import { compile } from "@tailwindcss/node"

export async function buildCss(entry: string, classes: string[]) {
  const compiler = await compile(entry, {
    base: process.cwd(),
    onDependency() {},
  })

  return compiler.build(classes)
}
