import { defineConfig } from "vitest/config"

export function initTestConfig() {
  return defineConfig({
    test: {
      include: ["src/**/*.test.ts"],
      passWithNoTests: true,
    },
  })
}

export default initTestConfig()
