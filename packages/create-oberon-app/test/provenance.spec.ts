import { expect, test } from "@playwright/test"
import {
  COA_CONTAINER_SCAFFOLD_DIR,
  COA_VERDACCIO_LOG_PATH,
} from "./coa-constants"
import { readContainerFile, readInstalledPackages } from "./coa-runtime"

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

test.describe("COA package provenance", { tag: "@coa" }, () => {
  test("installs @oberoncms packages via verdaccio without npmjs fallback", async () => {
    const installedPackages = await readInstalledPackages(
      COA_CONTAINER_SCAFFOLD_DIR,
    )
    const provenancePackages = Object.entries(installedPackages).filter(
      ([packageName]) => packageName.startsWith("@oberoncms/"),
    )

    expect(provenancePackages.length).toBeGreaterThan(0)

    const verdaccioLogs = await readContainerFile(COA_VERDACCIO_LOG_PATH)

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
    const installedPackages = await readInstalledPackages(
      COA_CONTAINER_SCAFFOLD_DIR,
    )

    const nextVersion = installedPackages[NEGATIVE_PROVENANCE_PACKAGE]
    if (!nextVersion) {
      throw new Error(
        `Expected ${NEGATIVE_PROVENANCE_PACKAGE} to be installed in scaffold app`,
      )
    }

    const metadataPath = getVerdaccioPackagePath(NEGATIVE_PROVENANCE_PACKAGE)
    const verdaccioLogs = await readContainerFile(COA_VERDACCIO_LOG_PATH)

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
