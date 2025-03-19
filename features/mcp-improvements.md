# MCP (Model Control Protocol) Improvements

Version 0.2.49 includes significant improvements to the Model Control Protocol functionality, which allows Claude Code to communicate with external servers and tools.

## Key improvements:

### MCP Server Management
```javascript
function B91() {
  let I = j0(),
      Z = mL(),
      G = U4();
  return {
    ...I.mcpServers ?? {},
    ...Z ?? {},
    ...G.mcpServers ?? {}
  }
}

function Sj(I) {
  let Z = U4(),
      G = mL(),
      W = j0();
  if (Z.mcpServers?.[I]) return {...Z.mcpServers[I], scope: "local"};
  if (G?.[I]) return {...G[I], scope: "project"};
  if (W.mcpServers?.[I]) return {...W.mcpServers[I], scope: "user"};
  return;
}
```

### Server Approval System
```javascript
function gj2(I) {
  let Z = U4();
  if (Z.approvedMcpjsonServers?.includes(I)) return "approved";
  if (Z.rejectedMcpjsonServers?.includes(I)) return "rejected";
  return "pending";
}
```

### Connection Management
```javascript
async function Rj2(I, Z) {
  try {
    let G = Z.type === "sse" 
      ? new jM1(new URL(Z.url)) 
      : new EM1({
          command: Z.command,
          args: Z.args,
          env: {...process.env, ...Z.env},
          stderr: "pipe"
        }),
    W = new $M1({name: "claude", version: "0.1.0"}, {capabilities: {}}),
    B = W.connect(G),
    w = new Promise((V, Y) => {
      let X = setTimeout(() => {
        Y(new Error(`Connection to MCP server "${I}" timed out after ${Kj2}ms`))
      }, Kj2);
      B.then(() => clearTimeout(X), () => clearTimeout(X));
    });
    
    // Rest of connection handling...
  } catch (G) {
    return {name: I, type: "failed"};
  }
}
```

## New CLI Commands

Version 0.2.49 includes enhanced MCP CLI commands:
- `claude mcp serve` - Start the Claude MCP server
- `claude mcp add <name> <command> [args...]` - Add a stdio server
- `claude mcp remove <name>` - Remove an MCP server
- `claude mcp list` - List configured MCP servers
- `claude mcp get <name>` - Get details about an MCP server

These improvements enable more sophisticated integration with external tools and custom server configurations.