#!/usr/bin/env node
import { bootstrapOberon } from "@oberoncms/core/adapter"

import { config } from "./config"

// Script runs before a build
bootstrapOberon(config)
