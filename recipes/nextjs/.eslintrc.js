module.exports = {
  plugins: ["@typescript-eslint"],
  ignorePatterns: [".next/**/*", ".vercel/**/*", "node_modules/**/*"],
  extends: [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/strict",
    "prettier",
  ],
  parser: "@typescript-eslint/parser",
  root: true,
  rules: {
    "@typescript-eslint/no-explicit-any": "error",
    // ensure consistant imports
    "import/order": "error",
    // conflicts with the the smarter tsc version
    "@typescript-eslint/no-unused-vars": "off",
    // prevent enums
    "no-restricted-syntax": [
      "error",
      {
        selector: "TSEnumDeclaration",
        message: "Don't declare enums",
      },
    ],
  },
}
