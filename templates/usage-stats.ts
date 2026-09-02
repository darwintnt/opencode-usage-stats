import type { Plugin } from "@opencode-ai/plugin"
import { tool } from "@opencode-ai/plugin"
import { Database } from "bun:sqlite"
import { homedir } from "os"
import { join } from "path"

// Adjust this path if your opencode DB lives elsewhere,
// or set the OPENCODE_DB environment variable.
const DB_PATH = process.env.OPENCODE_DB ?? join(homedir(), ".local/share/opencode/opencode.db")

const QUERY = `
  SELECT
    date(time_created / 1000, 'unixepoch', 'localtime') AS date,
    COALESCE(
      json_extract(data, '$.model.modelID'),
      json_extract(data, '$.modelID'),
      'no_model'
    ) AS model,
    COUNT(*) AS message_count,
    ROUND(COALESCE(SUM(CAST(json_extract(data, '$.cost') AS REAL)), 0), 6) AS total_cost
  FROM message
  WHERE date(time_created / 1000, 'unixepoch', 'localtime') = date('now', 'localtime')
  GROUP BY date, model
  ORDER BY message_count DESC;
`

interface Row {
  date: string
  model: string
  message_count: number
  total_cost: number
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
  if (rows.length === 0) return "You haven't sent any messages today."
  const total = rows.reduce((sum, r) => sum + r.message_count, 0)
  const totalCost = rows.reduce((sum, r) => sum + r.total_cost, 0)
  const lines = rows.map(
    (r) => `• ${r.model}: ${r.message_count} msgs — $${r.total_cost.toFixed(4)}`,
  )
  return `Today's messages (${total} total, $${totalCost.toFixed(4)})\n${lines.join("\n")}`
}

export const UsageStatsPlugin: Plugin = async ({ client }) => {
  return {
    // 1) Tool callable from the chat: ask the agent "use usage_stats"
    //    or create a /stats command that calls it directly.
    tool: {
      usage_stats: tool({
        description: "Shows how many messages have been used today, grouped by model",
        args: {},
        execute: async () => formatStats(getStatsRows()),
      }),
    },

    // 2) Automatic toast after each response finishes (TUI mode only).
    event: async ({ event }) => {
      if (event.type === "session.idle") {
        try {
          await client.tui.showToast({
            body: {
              title: "Daily usage",
              message: formatStats(getStatsRows()),
              variant: "info",
            },
          })
        } catch {
          // no toast endpoint in web/headless mode, ignored
        }
      }
    },
  }
}
