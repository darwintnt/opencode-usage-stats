# opencode-usage-stats

Plugin and `/stats` command for [OpenCode](https://opencode.ai) that shows how many messages you've used today, grouped by model, along with the total cost.

## What it does

Installs two files into your OpenCode configuration:

- **`plugins/usage-stats.ts`** — a plugin that:
  - Registers a tool called `usage_stats` that queries OpenCode's local database (`opencode.db`) and returns, for the current day, the message count and accumulated cost per model.
  - Automatically shows a toast with that summary every time the agent finishes responding (TUI mode only).
- **`commands/stats.md`** — the `/stats` command, which simply asks the agent to run the `usage_stats` tool and display the result.

No need to touch `opencode.json`: OpenCode automatically detects files inside `plugins/` and `commands/`.

## Requirements

- OpenCode running on Bun (it uses `bun:sqlite` to read the database).
- At least one message sent today to see data (otherwise it will say "You haven't sent any messages yet").

## Installation

Run this command to install it:

```bash
npx @darwintnt/opencode-usage-stats
```

By default it installs into the **global** configuration:

- `~/.config/opencode/plugins/usage-stats.ts`
- `~/.config/opencode/commands/stats.md`

To install it only in the current project, add the `--project` flag:

```bash
npx @darwintnt/opencode-usage-stats --project
```

This installs it into `.opencode/plugins/` and `.opencode/commands/` inside the directory where you run the command.

## Usage

1. Restart OpenCode (or open a new session) so the plugin gets loaded.
2. Type `/stats` in the chat.
3. You'll see something like:

```
Today's messages (12 total, $0.0840)
• claude-sonnet-4-5: 8 msgs — $0.0620
• gpt-5-mini: 4 msgs — $0.0220
```

You can also ask the agent directly: "use the usage_stats tool", without going through the command.

## Optional configuration

If your OpenCode database is not at the default path, set the environment variable before running OpenCode:

```bash
export OPENCODE_DB=/path/to/your/opencode.db
```

## Uninstall

Manually delete the two files:

```bash
rm ~/.config/opencode/plugins/usage-stats.ts
rm ~/.config/opencode/commands/stats.md
```

(or their `.opencode/` equivalents if you installed it with `--project`).
