import { expect, test } from "@playwright/test"
import { readVerdaccioLogs, execInContainer, COA_NEXTJS_DIR } from "./container"

const NEGATIVE_PROVENANCE_PACKAGE = "next"

function getVerdaccioPackagePath(packageName: string) {
  return packageName.replace("/", "%2F")
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function getTarballName(packageName: string, version: string) {
  const packageParts = packageName.split("/")
  const packageBaseName = packageParts[packageParts.length - 1] || packageName

  return `${packageBaseName}-${version}.tgz`
}

function parseJsonOutput(output: string): unknown {
  const trimmed = output.trim()

  if (!trimmed) {
    throw new Error("Expected JSON output but received an empty string")
  }

  const arrayStart = trimmed.indexOf("[")
  const arrayEnd = trimmed.lastIndexOf("]")

  if (arrayStart >= 0 && arrayEnd > arrayStart) {
    return JSON.parse(trimmed.slice(arrayStart, arrayEnd + 1))
  }

  const objectStart = trimmed.indexOf("{")
  const objectEnd = trimmed.lastIndexOf("}")

  if (objectStart >= 0 && objectEnd > objectStart) {
    return JSON.parse(trimmed.slice(objectStart, objectEnd + 1))
  }

  throw new Error(`Unable to parse JSON output: ${trimmed}`)
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

async function readInstalledDependencies(cwd: string) {
  const output = await execInContainer("pnpm list --json --depth=0", { cwd })

  const parsed = parseJsonOutput(output)
  const results = Array.isArray(parsed) ? parsed : [parsed]
  const dependencies: Record<string, unknown> = {}

  for (const result of results) {
    if (!isObjectRecord(result)) {
      continue
    }

    const dependencyGroups = [result.dependencies, result.devDependencies]

    for (const dependencyGroup of dependencyGroups) {
      if (!isObjectRecord(dependencyGroup)) {
        continue
      }

      for (const [packageName, dependency] of Object.entries(dependencyGroup)) {
        dependencies[packageName] = dependency
      }
    }
  }

  return dependencies
}

async function readInstalledPackages() {
  const dependencies = await readInstalledDependencies(COA_NEXTJS_DIR)
  const installedPackages: Record<string, string> = {}

  for (const [packageName, dependency] of Object.entries(dependencies)) {
    if (isObjectRecord(dependency) && typeof dependency.version === "string") {
      installedPackages[packageName] = dependency.version
    }
  }

  return installedPackages
}

test.describe("COA package provenance", { tag: "@verdaccio" }, () => {
  test("installs @oberoncms packages via verdaccio without npmjs fallback", async () => {
    const installedPackages = await readInstalledPackages()
    const provenancePackages = Object.entries(installedPackages).filter(
      ([packageName]) => packageName.startsWith("@oberoncms/"),
    )

    expect(provenancePackages.length).toBeGreaterThan(0)

    const verdaccioLogs = await readVerdaccioLogs()

    for (const [packageName, installedVersion] of provenancePackages) {
      const metadataPath = getVerdaccioPackagePath(packageName)

      const tarballPath = `${metadataPath}/-/${getTarballName(packageName, installedVersion)}`

      const metadataRequestPattern = new RegExp(
        `requested 'GET /${escapeRegExp(metadataPath)}(?:[?']|\\s)`,
      )
      const npmjsMetadataFallbackPattern = new RegExp(
        `making request: 'GET https://registry\\.npmjs\\.org/${escapeRegExp(metadataPath)}(?:[?']|\\s)`,
      )
      const npmjsTarballFallbackPattern = new RegExp(
        `making request: 'GET https://registry\\.npmjs\\.org/${escapeRegExp(tarballPath)}(?:[?']|\\s)`,
      )

      expect(metadataRequestPattern.test(verdaccioLogs)).toBe(true)
      expect(npmjsMetadataFallbackPattern.test(verdaccioLogs)).toBe(false)
      expect(npmjsTarballFallbackPattern.test(verdaccioLogs)).toBe(false)
    }
  })

  test("proxies next metadata from npmjs via verdaccio", async () => {
    const installedPackages = await readInstalledPackages()

    const nextVersion = installedPackages[NEGATIVE_PROVENANCE_PACKAGE]
    if (!nextVersion) {
      throw new Error(
        `Expected ${NEGATIVE_PROVENANCE_PACKAGE} to be installed in scaffold app`,
      )
    }

    const metadataPath = getVerdaccioPackagePath(NEGATIVE_PROVENANCE_PACKAGE)
    const verdaccioLogs = await readVerdaccioLogs()

    const metadataRequestPattern = new RegExp(
      `requested 'GET /${escapeRegExp(metadataPath)}(?:[?']|\\s)`,
    )
    const npmjsMetadataProxyPattern = new RegExp(
      `making request: 'GET https://registry\\.npmjs\\.org/${escapeRegExp(metadataPath)}(?:[?']|\\s)`,
    )

    expect(metadataRequestPattern.test(verdaccioLogs)).toBe(true)
    expect(npmjsMetadataProxyPattern.test(verdaccioLogs)).toBe(true)
  })
})
