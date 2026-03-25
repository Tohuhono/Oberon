import { defineConfig } from "vitest/config"

export function initTestConfig() {
  return defineConfig({
    test: {
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
          description:
            "Expensive unit tests that are not ideal for tight red/green loops.",
        },
      ],
    },
  })
}
