import { base, defineConfig } from "@dev/playwright"

export default defineConfig({
  ...base,
  webServer: {
    command: "pnpm start",
    url: "http://localhost:3210",
    reuseExistingServer: false,
    env: {
      PORT: "3210",
    },
  },
  projects: [
    {
      name: "playground",
      testMatch: "test/**/*.spec.ts",
      use: { baseURL: "http://localhost:3210" },
    },
  ],
})
