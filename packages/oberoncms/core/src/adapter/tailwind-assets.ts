import { createHash } from "crypto"
import { access, readFile } from "fs/promises"
import { createRequire } from "module"
import { dirname, isAbsolute, join, resolve } from "path"
import { pathToFileURL } from "url"
import { type Data } from "@puckeditor/core"
import { compile } from "tailwindcss"
import { walkAsyncStep } from "walkjs"
import type { OberonTailwindAsset } from "../lib/dtd"

const importModuleAtRuntime = Function(
  "specifier",
  "return import(specifier)",
) as (specifier: string) => Promise<Record<string, unknown>>

function getBaseRequire(base: string) {
  return createRequire(pathToFileURL(join(base, "__tailwind_loader__.js")).href)
}

function resolveTailwindImport(id: string, base: string) {
  if (id.startsWith(".") || id.startsWith("/")) {
    return resolve(base, id)
  }

  return getBaseRequire(base).resolve(id)
}

async function findClosestPackageJson(path: string) {
  let current = dirname(path)

  while (current !== dirname(current)) {
    const packageJsonPath = join(current, "package.json")

    try {
      await access(packageJsonPath)
      return packageJsonPath
    } catch {
      current = dirname(current)
    }
  }

  return null
}

async function resolveTailwindStylesheetImport(id: string, base: string) {
  const resolvedPath = resolveTailwindImport(id, base)

  if (resolvedPath.endsWith(".css")) {
    return resolvedPath
  }

  const packageJsonPath = await findClosestPackageJson(resolvedPath)

  if (!packageJsonPath) {
    return resolvedPath
  }

  const packageJson = JSON.parse(await readFile(packageJsonPath, "utf8")) as {
    style?: string
    exports?: string | Record<string, string | Record<string, string>>
  }
  const rootExport =
    typeof packageJson.exports === "object" ? packageJson.exports["."] : null
  const stylesheetPath =
    packageJson.style ??
    (typeof rootExport === "string"
      ? rootExport.endsWith(".css")
        ? rootExport
        : null
      : (rootExport?.style ?? null))

  return stylesheetPath
    ? resolve(dirname(packageJsonPath), stylesheetPath)
    : resolvedPath
}

export function normalizeTailwindClassList(classList: Iterable<string>) {
  return [...new Set(classList)].filter(Boolean).sort()
}

export function mergeTailwindClassLists(
  classLists: Iterable<Iterable<string>>,
) {
  const merged = new Set<string>()

  for (const classList of classLists) {
    for (const className of classList) {
      if (className) {
        merged.add(className)
      }
    }
  }

  return normalizeTailwindClassList(merged)
}

export function activeTailwindAssetCoversClassList({
  activeClassList,
  effectiveClassList,
}: {
  activeClassList: string[]
  effectiveClassList: string[]
}) {
  const activeClassSet = new Set(activeClassList)

  return effectiveClassList.every((className) => activeClassSet.has(className))
}

export function getTailwindAssetDecision({
  activeClassList,
  publishedClassLists,
  submittedClassList,
}: {
  activeClassList?: string[] | null
  publishedClassLists: Iterable<Iterable<string>>
  submittedClassList: Iterable<string>
}) {
  const effectiveClassList = mergeTailwindClassLists([
    submittedClassList,
    ...publishedClassLists,
  ])

  return {
    effectiveClassList,
    shouldCompile:
      effectiveClassList.length > 0 &&
      !(
        activeClassList &&
        activeTailwindAssetCoversClassList({
          activeClassList,
          effectiveClassList,
        })
      ),
  }
}

export async function getTailwindClassList(data: Data) {
  const classList = new Set<string>()

  for await (const node of walkAsyncStep(data)) {
    if (node.key !== "className" || typeof node.val !== "string") {
      continue
    }

    for (const candidate of node.val.split(/\s+/)) {
      if (candidate) {
        classList.add(candidate)
      }
    }
  }

  return normalizeTailwindClassList(classList)
}

export async function buildTailwindAsset({
  classList,
  sourceCssFile,
}: {
  classList: string[]
  sourceCssFile: string
}): Promise<OberonTailwindAsset> {
  const path = isAbsolute(sourceCssFile)
    ? sourceCssFile
    : resolve(process.cwd(), sourceCssFile)
  const source = await readFile(path, "utf8")
  const compiler = await compile(source, {
    base: dirname(path),
    from: path,
    loadModule: async (id, base) => {
      const modulePath = resolveTailwindImport(id, base)
      const module = await importModuleAtRuntime(pathToFileURL(modulePath).href)

      return {
        path: modulePath,
        base: dirname(modulePath),
        module: module.default ?? module,
      }
    },
    loadStylesheet: async (id, base) => {
      const stylesheetPath = await resolveTailwindStylesheetImport(id, base)

      return {
        path: stylesheetPath,
        base: dirname(stylesheetPath),
        content: await readFile(stylesheetPath, "utf8"),
      }
    },
  })
  const css = compiler.build(classList)

  return {
    hash: createHash("sha256").update(css).digest("hex"),
    classList,
    css,
  }
}
