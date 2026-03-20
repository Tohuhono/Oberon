import { expect, test } from "@playwright/test"
import { readVerdaccioLogs, execInContainer, COA_NEXTJS_DIR } from "./container"

const NEGATIVE_PROVENANCE_PACKAGE = "next"

function getVerdaccioPackagePath(packageName: string) {
  return packageName.replace(/\//g, "%2F")
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function createRequestPattern(path: string) {
  return new RegExp(
    `requested\\s+['"]?(?:GET|HEAD)\\s+/${escapeRegExp(path)}(?:\\?|['"\\s]|$)`,
    "i",
  )
}

function createNpmjsRequestPattern(path: string) {
  return new RegExp(
    `making request:\\s+['"]?(?:GET|HEAD)\\s+https://registry\\.npmjs\\.org/${escapeRegExp(path)}(?:\\?|['"\\s]|$)`,
    "i",
  )
}

function getRelevantLogContext(logs: string, path: string) {
  const matchedLines = logs
    .split("\n")
    .filter((line) => line.includes(path))
    .slice(0, 10)

  if (matchedLines.length > 0) {
    return matchedLines.join("\n")
  }

  return logs.split("\n").slice(0, 20).join("\n")
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

      const metadataRequestPattern = createRequestPattern(metadataPath)
      const npmjsMetadataFallbackPattern =
        createNpmjsRequestPattern(metadataPath)
      const npmjsTarballFallbackPattern = createNpmjsRequestPattern(tarballPath)

      expect(
        metadataRequestPattern.test(verdaccioLogs),
        `Expected Verdaccio metadata request for ${packageName}. Relevant logs:\n${getRelevantLogContext(verdaccioLogs, metadataPath)}`,
      ).toBe(true)

      expect(
        npmjsMetadataFallbackPattern.test(verdaccioLogs),
        `Unexpected npmjs metadata fallback for ${packageName}. Relevant logs:\n${getRelevantLogContext(verdaccioLogs, metadataPath)}`,
      ).toBe(false)

      expect(
        npmjsTarballFallbackPattern.test(verdaccioLogs),
        `Unexpected npmjs tarball fallback for ${packageName}. Relevant logs:\n${getRelevantLogContext(verdaccioLogs, tarballPath)}`,
      ).toBe(false)
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

    const metadataRequestPattern = createRequestPattern(metadataPath)
    const npmjsMetadataProxyPattern = createNpmjsRequestPattern(metadataPath)

    expect(
      metadataRequestPattern.test(verdaccioLogs),
      `Expected Verdaccio metadata request for ${NEGATIVE_PROVENANCE_PACKAGE}. Relevant logs:\n${getRelevantLogContext(verdaccioLogs, metadataPath)}`,
    ).toBe(true)

    expect(
      npmjsMetadataProxyPattern.test(verdaccioLogs),
      `Expected npmjs metadata proxy for ${NEGATIVE_PROVENANCE_PACKAGE}. Relevant logs:\n${getRelevantLogContext(verdaccioLogs, metadataPath)}`,
    ).toBe(true)
  })
})
