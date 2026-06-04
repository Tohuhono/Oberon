import { readdir, readFile } from "node:fs/promises"
import { basename, extname, join, relative } from "node:path"

import { describe, expect, it } from "vitest"

const coreRoot = new URL("..", import.meta.url)
const srcRoot = new URL(".", import.meta.url)

async function collectSourceFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = await Promise.all(
    entries.map((entry) => {
      const path = join(directory, entry.name)

      if (entry.isDirectory()) {
        return collectSourceFiles(path)
      }

      if (
        [".ts", ".tsx"].includes(extname(entry.name)) &&
        !basename(entry.name).includes(".test.")
      ) {
        return [path]
      }

      return []
    }),
  )

  return files.flat()
}

describe("dependency boundaries", { tags: ["ai", "feature-remove-nextjs-from-core"] }, () => {
  it("does not import or declare Next.js from core", async () => {
    const sourceFiles = await collectSourceFiles(srcRoot.pathname)
    const nextImports: string[] = []

    for (const file of sourceFiles) {
      const content = await readFile(file, "utf8")

      if (
        /from\s+["']next(?:[/'"])/.test(content) ||
        /import\s*\(\s*["']next(?:[/'"])/.test(content)
      ) {
        nextImports.push(relative(coreRoot.pathname, file))
      }
    }

    const packageJson = JSON.parse(await readFile(new URL("package.json", coreRoot), "utf8"))
    const dependencySections = [
      packageJson.dependencies,
      packageJson.peerDependencies,
      packageJson.optionalDependencies,
    ]

    expect(nextImports).toEqual([])
    expect(dependencySections.some((dependencies) => dependencies && "next" in dependencies)).toBe(
      false,
    )
  })
})
