import { defineConfig } from "rollup"
import { swc } from "rollup-plugin-swc3"
import { nodeExternals } from "rollup-plugin-node-externals"
import preserveDirectives from "rollup-preserve-directives"
// import commonjs from "@rollup/plugin-commonjs"
import { nodeResolve } from "@rollup/plugin-node-resolve"
import typescript from "@rollup/plugin-typescript"
import { dts } from "rollup-plugin-dts"

const plugins = [
  // convert imported cjs
  // resolve node imports
  nodeResolve(),
  // do not bundle any node_modules content
  nodeExternals({
    deps: true,
    peerDeps: true,
    devDeps: true,
  }),
  // typescript build mostly using tsconfig
  swc({
    minify: true,
    jsc: {
      minify: {
        sourceMap: true,
      },
    },
    sourceMaps: true,
  }),
  // `preserveDirectives` after `swc` for "use client" and "use server" support
  preserveDirectives(),
]

// /** @type {(input?: string[]) => RollupOptions[]} TypeScript syntax */

export const config = defineConfig([
  {
    input: "src/index.ts",
    output: {
      dir: "dist",
      format: "esm",
      sourcemap: true,
      preserveModules: true,
      preserveModulesRoot: "src",
    },
    plugins: [
      ...plugins,
      typescript({
        noEmit: false,
        noForceEmit: true,
        emitDeclarationOnly: true,
      }),
    ],
  },
  {
    input: "src/index.ts",
    output: {
      dir: "dist/cjs",
      format: "cjs",
      exports: "named",
      sourcemap: true,
      preserveModules: true,
      preserveModulesRoot: "src",
    },
    plugins,
  },
  {
    input: "dist/src/index.d.ts",
    output: [{ file: "dist/index.d.ts", format: "es" }],
    plugins: [
      nodeExternals({
        deps: true,
        peerDeps: true,
        devDeps: true,
      }),
      dts(),
    ],
  },
])

export function initConfig(inputs = ["index"]) {
  const sourceFiles = inputs.map((input) => `src/${input}.ts`)

  return defineConfig([
    {
      input: sourceFiles,
      output: {
        dir: "dist",
        format: "esm",
        sourcemap: true,
        preserveModules: true,
        preserveModulesRoot: "src",
      },
      plugins: [
        ...plugins,
        typescript({
          noEmit: false,
          noForceEmit: true,
          emitDeclarationOnly: true,
        }),
      ],
    },
    {
      input: sourceFiles,
      output: {
        dir: "dist/cjs",
        format: "cjs",
        exports: "named",
        sourcemap: true,
        preserveModules: true,
        preserveModulesRoot: "src",
      },
      plugins,
    },
    ...inputs.map((input) => ({
      input: `dist/src/${input}.d.ts`,
      output: [{ file: `dist/${input}.d.ts`, format: "es" }],
      plugins: [
        nodeExternals({
          deps: true,
          peerDeps: true,
          devDeps: true,
        }),
        dts(),
      ],
    })),
  ])
}
