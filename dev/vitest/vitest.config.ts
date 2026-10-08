import { appendFileSync, mkdtempSync, readFileSync, rmSync } from "node:fs"
import { dirname, join } from "node:path"

import { defineConfig } from "vitest/config"
import { GithubActionsReporter } from "vitest/node"

class PackageGithubActionsReporter extends GithubActionsReporter {
  onTestRunEnd(...args: Parameters<GithubActionsReporter["onTestRunEnd"]>) {
    const summaryPath = this.options.jobSummary.outputPath
    if (!this.options.jobSummary.enabled || !summaryPath) {
      return super.onTestRunEnd(...args)
    }

    const directory = mkdtempSync(join(dirname(summaryPath), "vitest-"))
    const outputPath = join(directory, "summary.md")
    this.options.jobSummary.outputPath = outputPath

    try {
      super.onTestRunEnd(...args)
      const packageName = process.env.npm_package_name ?? this.ctx.config.root
      appendFileSync(
        summaryPath,
        `# Unit tests: \`${packageName}\`\n\n${readFileSync(outputPath, "utf8")}`,
      )
    } finally {
      this.options.jobSummary.outputPath = summaryPath
      rmSync(directory, { recursive: true })
    }
  }
}

export function initTestConfig() {
  return defineConfig({
    test: {
      ...(process.env.GITHUB_ACTIONS === "true" && {
        reporters: ["default", new PackageGithubActionsReporter()],
      }),
      cache: false,
      include: ["src/**/*.test.ts"],
      passWithNoTests: true,
      strictTags: false,
      tags: [
        {
          name: "ai",
          description: "Agent-authored unit tests.",
        },
        {
          name: "baseline",
          description: "Pre-existing or otherwise non-AI baseline unit tests.",
        },
        {
          name: "slow",
          description: "Expensive unit tests that are not ideal for tight red/green loops.",
        },
      ],
    },
  })
}
