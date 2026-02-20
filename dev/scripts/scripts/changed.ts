import { execFileSync } from "node:child_process"

const baseRef = process.argv[2]

if (!baseRef) throw new Error("Missing base ref")

const output = execFileSync(
  "pnpm",
  ["exec", "turbo", "build", "--dry-run=json", `--filter=...[${baseRef}]`],
  { encoding: "utf8" },
)

process.stdout.write(JSON.stringify(JSON.parse(output).packages))
