#!/usr/bin/env node

import { bootstrapOberon } from "@oberoncms/core/adapter"

import { config } from "./adapter"

// Script runs before a build
bootstrapOberon(config)
