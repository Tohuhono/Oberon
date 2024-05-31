// @ts-check

/** @type {import("prettier").Config} */
const config = {
  trailingComma: "all",
  tailwindFunctions: ["clsx", "cx", "cva", "cn"],
  plugins: ["prettier-plugin-tailwindcss"],
};

export default config;
