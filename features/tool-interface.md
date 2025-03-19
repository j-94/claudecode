# Claude Code Tool Interface

Based on the recovered source code, here's a detailed explanation of the Tool interface used throughout Claude Code.

## Tool Interface Definition

The Tool interface defines a consistent contract that all tools must implement:

```typescript
export interface Tool<In = any, Out = any> {
  name: string
  description(input?: any): Promise<string>
  prompt(): Promise<string>
  isEnabled(): Promise<boolean>
  isReadOnly(): boolean
  needsPermissions(input: any): boolean
  inputSchema: z.ZodType<any>
  validateInput?(input: any, context: any): Promise<ValidationResult>
  call(
    input: any,
    context: ToolContext,
    onProgress?: (progress: any) => void,
    maxDots?: number,
    userMessage?: string,
  ): AsyncGenerator<ToolResult, void, unknown>
  renderToolUseMessage(input: any, options: any): string
  renderToolResultMessage(
    content: any,
    options: any,
  ): React.ReactElement | null
  renderToolUseRejectedMessage(
    input: any,
    options: any,
  ): React.ReactElement | null
  renderResultForAssistant(output: any): string | TruncatedContent
  userFacingName?(input?: any): string
}
```

## How Tools Work Together

Let's examine the implementation pattern used by all tools:

1. **Definition and Schema**:
```typescript
// Input validation using Zod
const inputSchema = z.strictObject({
  pattern: z.string().describe('The glob pattern to match files against'),
  path: z.string().optional().describe('The directory to search in.'),
})

// Tool implementation
export const GlobTool = {
  name: 'GlobTool',
  // Additional methods...
} satisfies Tool<typeof inputSchema, Output>
```

2. **Permissions Checking**:
```typescript
needsPermissions({ path }) {
  return !hasReadPermission(path || getCwd())
}
```

3. **Execution Flow**:
```typescript
async *call({ pattern, path }, { abortController }) {
  const start = Date.now()
  // Perform the tool's operation
  const { files, truncated } = await glob(
    pattern,
    path ?? getCwd(),
    { limit: 100, offset: 0 },
    abortController.signal,
  )
  // Format the output
  const output = { ... }
  // Yield the result
  yield {
    type: 'result',
    resultForAssistant: this.renderResultForAssistant(output),
    data: output,
  }
}
```

4. **UI Rendering**:
```typescript
renderToolResultMessage(output) {
  return (
    <Box justifyContent="space-between" width="100%">
      <Box flexDirection="row">
        <Text>&nbsp;&nbsp;⎿ &nbsp;Found </Text>
        <Text bold>{output.numFiles} </Text>
        <Text>
          {output.numFiles === 0 || output.numFiles > 1 ? 'files' : 'file'}
        </Text>
      </Box>
      <Cost costUSD={0} durationMs={output.durationMs} debug={false} />
    </Box>
  )
}
```

## Tool Registration and Loading

Tools are centrally registered and dynamically loaded:

```typescript
export const getAllTools = (): Tool[] => {
  return [
    AgentTool,
    BashTool,
    GlobTool,
    GrepTool,
    LSTool,
    FileReadTool,
    FileEditTool,
    FileWriteTool,
    NotebookReadTool,
    NotebookEditTool,
    StickerRequestTool,
    ThinkTool,
    ...(process.env.USER_TYPE === 'ant' ? ANT_ONLY_TOOLS : []),
  ]
}

export const getTools = memoize(
  async (enableArchitect?: boolean): Promise<Tool[]> => {
    const tools = [...getAllTools(), ...(await getMCPTools())]

    // Only include Architect tool if enabled via config or CLI flag
    if (enableArchitect) {
      tools.push(ArchitectTool)
    }

    const isEnabled = await Promise.all(tools.map(tool => tool.isEnabled()))
    return tools.filter((_, i) => isEnabled[i])
  },
)
```

## Design Patterns

Claude Code's tool system demonstrates several key design patterns:

1. **Interface-Based Design**: All tools conform to a single interface, allowing for consistent handling.

2. **Dependency Injection**: Tools receive context objects with services they need.

3. **Generator Functions**: Using async generators allows for streaming responses and progress updates.

4. **React Component System**: UI rendering is cleanly separated from business logic.

5. **Validation**: Input validation occurs using Zod schemas before tools are executed.

6. **Permission Model**: Security checks are built into each tool's lifecycle.

This extensible architecture makes it easy to add new tools as the system evolves, as evidenced by the addition of BatchTool and WebFetch in later versions.