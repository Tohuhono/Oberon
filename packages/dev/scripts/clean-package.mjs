#!/usr/bin/env node
import path from "path"
import { rimraf } from "rimraf"

const dirs = [
  "./dist",
  "./.rollup.cache",
  "./.turbo",
  "./.next",
  "./.vercel",
  "./tsconfig.tsbuildinfo",
  ...(globalThis.process.argv[2] === "--node_modules"
    ? ["./node_modules"]
    : []),
]

globalThis.console.warn(`rm [${dirs}] in ${path.resolve()}`)

rimraf(dirs)
