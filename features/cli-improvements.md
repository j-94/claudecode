# CLI Improvements

Version 0.2.49 includes significant improvements to the command-line interface.

## New Options

```javascript
G.name("claude")
 .description(`${x2} - starts an interactive session by default, use -p/--print for non-interactive output`)
 .argument("[prompt]", "Your prompt", String)
 .option("-d, --debug", "Enable debug mode", () => !0)
 .option("--verbose", "Override verbose mode setting from config", () => !0)
 .option("-p, --print", "Print response and exit (useful for pipes)", () => !0)
 .option("--json", "Output JSON in the shape {cost_usd: number, duration_ms: number, duration_api_ms: number, result: string} (only works with --print)", () => !0)
 .option("--mcp-debug", "Enable MCP debug mode (shows MCP server errors)", () => !0)
 .option("--dangerously-skip-permissions", "Bypass all permission checks. Only works in Docker containers with no internet access.", () => !0)
 .option("--allowedTools <tools>", 'Comma-separated list of tool names to allow (e.g. "Bash(git*),Edit,Replace")', String)
 .addOption(new jl2("--max-turns <turns>", "Maximum number of agentic turns in non-interactive mode. This will early exit the conversation after the specified number of turns. (only works with --print)").argParser(Number).hideHelp())
```

## New Commands

### Clear Command
Allows clearing the conversation history to free up context:

```javascript
{
  name: "clear",
  description: "Clear conversation history and free up context",
  isEnabled: !0,
  isHidden: !1,
  async call(I, Z) {
    return o11(Z), ""
  },
  userFacingName() {
    return "clear"
  }
}
```

### Improved Config Management
Enhanced configuration management with better global and local config handling:

```javascript
B.command("get <key>")
 .description("Get a config value")
 .option("-c, --cwd <cwd>", "The current working directory", String, uH())
 .option("-g, --global", "Use global config")
 .action(async(A, {cwd: V, global: X}) => {
   await TH(V, !1),
   console.log(qb1(A, X ?? !1)),
   process.exit(0)
 })
```

## JSON Output Support

Added the ability to output results as structured JSON when using the `--print` option:

```javascript
// When using --json flag:
{
  cost_usd: number,
  duration_ms: number, 
  duration_api_ms: number, 
  result: string
}
```

This structured output makes Claude Code more usable in scripts and automated workflows, allowing for easier parsing and processing of results by other tools.