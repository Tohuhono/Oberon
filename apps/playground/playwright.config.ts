import { base, defineConfig } from "@dev/playwright"

export default defineConfig({
  ...base,
  webServer: {
    command: "pnpm start -p 3200",
    url: "http://localhost:3200",
  },
  projects: [
    {
      name: "playground",
      testMatch: "test/**/*.spec.ts",
      use: { baseURL: "http://localhost:3200" },
    },
  ],
})
