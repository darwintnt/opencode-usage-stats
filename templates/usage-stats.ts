import type { Plugin } from "@opencode-ai/plugin"
import { tool } from "@opencode-ai/plugin"
import { Database } from "bun:sqlite"
import { homedir } from "os"
import { join } from "path"

// Ajusta esta ruta si tu DB de opencode está en otro lugar,
// o define la variable de entorno OPENCODE_DB.
const DB_PATH = process.env.OPENCODE_DB ?? join(homedir(), ".local/share/opencode/opencode.db")

const QUERY = `
  SELECT
    date(time_created / 1000, 'unixepoch', 'localtime') AS fecha,
    COALESCE(
      json_extract(data, '$.model.modelID'),
      json_extract(data, '$.modelID'),
      'sin_modelo'
    ) AS modelo,
    COUNT(*) AS cantidad_mensajes,
    ROUND(COALESCE(SUM(CAST(json_extract(data, '$.cost') AS REAL)), 0), 6) AS costo_total
  FROM message
  WHERE date(time_created / 1000, 'unixepoch', 'localtime') = date('now', 'localtime')
  GROUP BY fecha, modelo
  ORDER BY cantidad_mensajes DESC;
`

interface Row {
  fecha: string
  modelo: string
  cantidad_mensajes: number
  costo_total: number
}

function getStatsRows(): Row[] {
  const db = new Database(DB_PATH, { readonly: true })
  try {
    return db.query(QUERY).all() as Row[]
  } finally {
    db.close()
  }
}

function formatStats(rows: Row[]): string {
  if (rows.length === 0) return "Hoy no has enviado mensajes todavía."
  const total = rows.reduce((sum, r) => sum + r.cantidad_mensajes, 0)
  const costoTotal = rows.reduce((sum, r) => sum + r.costo_total, 0)
  const lines = rows.map(
    (r) => `• ${r.modelo}: ${r.cantidad_mensajes} msgs — $${r.costo_total.toFixed(4)}`,
  )
  return `Mensajes de hoy (${total} en total, $${costoTotal.toFixed(4)})\n${lines.join("\n")}`
}

export const UsageStatsPlugin: Plugin = async ({ client }) => {
  return {
    // 1) Tool invocable desde el chat: pídele al agente "usa usage_stats"
    //    o crea un comando /stats que la llame directamente.
    tool: {
      usage_stats: tool({
        description: "Muestra cuántos mensajes se han usado hoy, agrupados por modelo",
        args: {},
        execute: async () => formatStats(getStatsRows()),
      }),
    },

    // 2) Toast automático al terminar cada respuesta (solo funciona en modo TUI).
    event: async ({ event }) => {
      if (event.type === "session.idle") {
        try {
          await client.tui.showToast({
            body: {
              title: "Uso diario",
              message: formatStats(getStatsRows()),
              variant: "info",
            },
          })
        } catch {
          // en modo web/headless no existe endpoint de toast, se ignora
        }
      }
    },
  }
}
