// @ts-check

/** @type {import("prettier").Config} */
module.exports = {
  trailingComma: "all",
  semi: false,
  tailwindFunctions: ["clsx", "cx", "cva", "cn"],
  plugins: ["prettier-plugin-tailwindcss"],
}
