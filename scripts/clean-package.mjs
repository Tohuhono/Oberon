#!/usr/bin/env node
import path from "path"
import { rimraf } from "rimraf"

const filter = globalThis.process.argv[2]
const value = globalThis.process.argv[3]
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
      ...(WITH ? [WITH] : []),
    ]

globalThis.console.warn(`rm [${dirs}] in ${path.resolve()}`)

rimraf(dirs)
