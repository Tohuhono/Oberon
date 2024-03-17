import { defineConfig } from "turbowatch"

export default defineConfig({
  project: __dirname,
  triggers: [
    {
      name: "dev",
      throttleOutput: { delay: 0 },
      expression: ["match", "false"],
      persistent: true,
      interruptible: false,
      initialRun: true,
      onChange: async ({ spawn }) => {
        await spawn`turbo dev --color`
      },
    },
    {
      name: "tsc",
      throttleOutput: { delay: 0 },
      expression: [
        "allof",
        ["not", ["dirname", "node_modules"]],
        [
          "anyof",
          ["match", "packages/*/src/**/*.ts", "basename"],
          ["match", "packages/*/src/**/*.tsx", "basename"],
        ],
      ],
      initialRun: true,
      onChange: async ({ spawn }) => {
        await spawn`turbo tsc --color`
      },
    },
  ],
})
