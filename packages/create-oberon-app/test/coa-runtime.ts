import { execFile } from "node:child_process"
import { promisify } from "node:util"
import { COA_CONTAINER_NAME, MONOREPO_ROOT } from "./coa-constants"

const execFileAsync = promisify(execFile)

const PODMAN_BASE_ARGS = ["--storage-opt", "ignore_chown_errors=true"]
const MAX_BUFFER_BYTES = 10 * 1024 * 1024

function shellQuote(value: string) {
  return `'${value.replace(/'/g, `'"'"'`)}'`
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

export async function execPodman(args: string[]) {
  const { stdout } = await execFileAsync(
    "podman",
    [...PODMAN_BASE_ARGS, ...args],
    {
      cwd: MONOREPO_ROOT,
      maxBuffer: MAX_BUFFER_BYTES,
      encoding: "utf8",
    },
  )

  return stdout
}

export async function execInContainer(
  command: string,
  options: {
    cwd?: string
  } = {},
) {
  const args = ["exec"]

  if (options.cwd) {
    args.push("--workdir", options.cwd)
  }

  args.push(COA_CONTAINER_NAME, "sh", "-lc", command)

  return execPodman(args)
}

export async function readContainerFile(filePath: string) {
  return execInContainer(`cat ${shellQuote(filePath)} 2>/dev/null || true`)
}

export async function getContainerFileSize(filePath: string) {
  const output = await execInContainer(`wc -c < ${shellQuote(filePath)}`)
  const parsed = Number.parseInt(output.trim(), 10)

  if (Number.isNaN(parsed)) {
    throw new Error(
      `Unable to parse file size for ${filePath}. Received: ${output}`,
    )
  }

  return parsed
}

export async function readContainerFileFromOffset(
  filePath: string,
  offset: number,
) {
  const start = Math.max(1, offset + 1)

  return execInContainer(
    `tail -c +${start} ${shellQuote(filePath)} 2>/dev/null || true`,
  )
}

export async function readContainerLogTail(filePath: string, lines = 80) {
  const safeLineCount = Math.max(1, lines)
  return execInContainer(
    `tail -n ${safeLineCount} ${shellQuote(filePath)} 2>/dev/null || true`,
  )
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

export async function readInstalledPackages(cwd: string) {
  const dependencies = await readInstalledDependencies(cwd)
  const installedPackages: Record<string, string> = {}

  for (const [packageName, dependency] of Object.entries(dependencies)) {
    if (isObjectRecord(dependency) && typeof dependency.version === "string") {
      installedPackages[packageName] = dependency.version
    }
  }

  return installedPackages
}
