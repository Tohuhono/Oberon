import { defineConfig } from "vitest/config"

export function initTestConfig() {
  return defineConfig({
    test: {
      cache: false,
      include: ["src/**/*.test.ts"],
      passWithNoTests: true,
    },
  })
}

export default initTestConfig()
