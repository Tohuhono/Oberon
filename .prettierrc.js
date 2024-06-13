// @ts-check

/** @type {import("prettier").Config} */
module.exports = {
  trailingComma: "all",
  semi: false,
  proseWrap: "always",
  tailwindFunctions: ["clsx", "cx", "cva", "cn"],
  plugins: ["prettier-plugin-tailwindcss", "prettier-plugin-brace-style"],
}
