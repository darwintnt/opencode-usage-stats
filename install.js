#!/usr/bin/env node
const fs = require("fs")
const os = require("os")
const path = require("path")

const isProject = process.argv.includes("--project")

const baseDir = isProject
  ? path.join(process.cwd(), ".opencode")
  : path.join(os.homedir(), ".config", "opencode")

const pluginsDir = path.join(baseDir, "plugins")
const commandsDir = path.join(baseDir, "commands")

fs.mkdirSync(pluginsDir, { recursive: true })
fs.mkdirSync(commandsDir, { recursive: true })

fs.copyFileSync(
  path.join(__dirname, "templates", "usage-stats.ts"),
  path.join(pluginsDir, "usage-stats.ts"),
)
fs.copyFileSync(
  path.join(__dirname, "templates", "stats.md"),
  path.join(commandsDir, "stats.md"),
)

console.log("Plugin instalado en:", pluginsDir)
console.log("Comando /stats instalado en:", commandsDir)
console.log("Reinicia opencode y prueba /stats")
