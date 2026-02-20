import { spawnSync } from "node:child_process"

const baseRef = process.argv[2]

if (!baseRef) {
  console.error(
    "::error::Missing required base ref argument for changed package detection.",
  )
  process.exit(1)
}

const verifyRef = spawnSync(
  "git",
  ["rev-parse", "--verify", "--quiet", `${baseRef}^{commit}`],
  {
    encoding: "utf8",
  },
)

if (verifyRef.status !== 0) {
  console.error(
    `::error::Invalid base ref '${baseRef}'. Ensure the commit exists in checkout history.`,
  )
  process.exit(1)
}

const turbo = spawnSync(
  "pnpm",
  ["exec", "turbo", "build", "--dry-run=json", `--filter=...[${baseRef}]`],
  { encoding: "utf8" },
)

if (turbo.status !== 0) {
  if (turbo.stderr.trim()) {
    console.error(turbo.stderr.trim())
  }
  if (turbo.stdout.trim()) {
    console.error(turbo.stdout.trim())
  }
  console.error(`::error::Turbo dry-run failed for base ref '${baseRef}'.`)
  process.exit(turbo.status ?? 1)
}

const output = turbo.stdout.trim()

if (!output) {
  console.error(
    `::error::Turbo dry-run returned empty output for base ref '${baseRef}'.`,
  )
  process.exit(1)
}

let parsed: unknown

try {
  parsed = JSON.parse(output)
} catch {
  console.error("::error::Turbo dry-run output is not valid JSON.")
  process.exit(1)
}

if (!(parsed && typeof parsed === "object" && "packages" in parsed)) {
  console.error("::error::Turbo dry-run JSON is missing the packages array.")
  process.exit(1)
}

const { packages } = parsed

if (!Array.isArray(packages)) {
  console.error("::error::Turbo dry-run JSON is missing the packages array.")
  process.exit(1)
}

process.stdout.write(JSON.stringify(packages))
