# opencode-usage-stats

Plugin y comando `/stats` para [OpenCode](https://opencode.ai) que muestra cuántos mensajes has usado hoy, agrupados por modelo, junto con el costo total.

## Qué hace

Instala dos archivos en tu configuración de OpenCode:

- **`plugins/usage-stats.ts`** — un plugin que:
  - Registra una tool llamada `usage_stats` que consulta la base de datos local de OpenCode (`opencode.db`) y devuelve, para el día actual, la cantidad de mensajes y el costo acumulado por modelo.
  - Muestra automáticamente un toast con ese resumen cada vez que el agente termina de responder (solo en modo TUI).
- **`commands/stats.md`** — el comando `/stats`, que simplemente le pide al agente que ejecute la tool `usage_stats` y muestre el resultado.

No requiere tocar `opencode.json`: OpenCode detecta automáticamente los archivos dentro de `plugins/` y `commands/`.

## Requisitos

- OpenCode corriendo sobre Bun (usa `bun:sqlite` para leer la base de datos).
- Tener al menos un mensaje enviado hoy para ver datos (si no, dirá "Hoy no has enviado mensajes todavía").

## Instalación

Ejecuta uno de estos comandos según cómo distribuyas el paquete:

```bash
npx opencode-usage-stats
```

Por defecto instala en la configuración **global**:

- `~/.config/opencode/plugins/usage-stats.ts`
- `~/.config/opencode/commands/stats.md`

Para instalarlo solo en el proyecto actual, agrega la bandera `--project`:

```bash
npx opencode-usage-stats --project
```

Esto lo instala en `.opencode/plugins/` y `.opencode/commands/` dentro del directorio donde ejecutes el comando.

## Uso

1. Reinicia OpenCode (o abre una sesión nueva) para que cargue el plugin.
2. Escribe `/stats` en el chat.
3. Verás algo como:

```
Mensajes de hoy (12 en total, $0.0840)
• claude-sonnet-4-5: 8 msgs — $0.0620
• gpt-5-mini: 4 msgs — $0.0220
```

También puedes pedirle al agente directamente: "usa la tool usage_stats", sin pasar por el comando.

## Configuración opcional

Si tu base de datos de OpenCode no está en la ruta por defecto, define la variable de entorno antes de correr OpenCode:

```bash
export OPENCODE_DB=/ruta/a/tu/opencode.db
```

## Desinstalar

Borra manualmente los dos archivos:

```bash
rm ~/.config/opencode/plugins/usage-stats.ts
rm ~/.config/opencode/commands/stats.md
```

(o sus equivalentes en `.opencode/` si lo instalaste con `--project`).
