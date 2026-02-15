#!/usr/bin/env tsx

import { resolve } from "path"
import { rimraf } from "rimraf"

const action = globalThis.process.argv[2]
const filter = globalThis.process.argv[3]
const value = globalThis.process.argv[4]

if (action !== "clean") {
  console.log("Unknown action")
}

const WITH = filter === "--with" && value
const ONLY = filter === "--only" && value

const dirs = ONLY
  ? [ONLY]
  : [
      "./dist",
      "./.next",
      "./.oberon",
      "./.turbo",
      "./.rollup.cache",
      "./.vercel",
      "./tsconfig.tsbuildinfo",
      "./next-env.d.ts",
      ...(WITH ? [WITH] : []),
    ]

globalThis.console.warn(`rm [${dirs}] in ${resolve()}`)

rimraf(dirs)
