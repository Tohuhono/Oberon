import { defineConfig } from "oxlint"

export default defineConfig({
  env: {
    builtin: true,
    node: true,
  },
  plugins: ["typescript", "react", "react-perf", "nextjs", "unicorn"],
  overrides: [
    {
      files: ["**/*.ts", "**/*.tsx", "**/*.mts", "**/*.cts"],
      rules: {
        "constructor-super": "off",
        "no-class-assign": "off",
        "no-const-assign": "off",
        "no-dupe-class-members": "off",
        "no-dupe-keys": "off",
        "no-func-assign": "off",
        "no-import-assign": "off",
        "no-new-native-nonconstructor": "off",
        "no-obj-calls": "off",
        "no-redeclare": "off",
        "no-setter-return": "off",
        "no-this-before-super": "off",
        "no-unsafe-negation": "off",
        "no-with": "off",
      },
    },
  ],
})
