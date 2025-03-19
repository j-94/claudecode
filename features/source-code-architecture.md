# Claude Code Architecture (v0.2.8)

Based on the recovered source code from the original branch, here's the architectural design of Claude Code:

## Core Tool System

The main functionality of Claude Code is built around a "Tool" system. Each tool implements a consistent interface:

```typescript
// Simplified Tool interface
interface Tool<In, Out> {
  name: string;                       // Internal name
  userFacingName(): string;           // Display name to user
  description(input): Promise<string>; // Dynamic description 
  prompt(): Promise<string>;          // The prompt sent to Claude
  isEnabled(): Promise<boolean>;      // Whether tool is available
  isReadOnly(): boolean;              // If tool modifies filesystem
  needsPermissions(input): boolean;   // If tool requires permissions
  validateInput?(input): Promise<ValidationResult>; // Validate inputs
  call(input, context): AsyncGenerator; // Execute the tool
  renderToolUseMessage(input, options): string; // Format tool request
  renderToolResultMessage(content, options): React.JSX.Element; // Format result
  renderResultForAssistant(output): string; // Return text to Claude
  renderToolUseRejectedMessage(): React.JSX.Element; // Format rejection
}
```

## Available Tools

The core tools in v0.2.8:

1. **BashTool**: Execute shell commands with safety checks
2. **FileReadTool**: Read file contents
3. **FileEditTool**: Edit portions of files
4. **FileWriteTool**: Create or overwrite files
5. **GlobTool**: Find files by pattern
6. **GrepTool**: Search file contents with regex
7. **LSTool**: List directory contents
8. **AgentTool**: Dispatch independent agent instances
9. **NotebookReadTool**: Read Jupyter notebooks
10. **NotebookEditTool**: Edit Jupyter notebooks
11. **ThinkTool**: Let Claude think without responding to user
12. **StickerRequestTool**: Easter egg for requesting Claude stickers

## Security Features

Security is built-in at multiple levels:

1. **Command Filtering**:
```typescript
// In BashTool
if (baseCmd && BANNED_COMMANDS.includes(baseCmd.toLowerCase())) {
  return {
    result: false,
    message: `Command '${baseCmd}' is not allowed for security reasons`,
  }
}
```

2. **Directory Restrictions**:
```typescript
// Prevent changing directory outside of the original working directory
if (!isInDirectory(
  relative(getOriginalCwd(), fullTargetDir),
  relative(getCwd(), getOriginalCwd()),
)) {
  return {
    result: false,
    message: `ERROR: cd to '${fullTargetDir}' was blocked...`,
  }
}
```

3. **Permission System**:
```typescript
// In each tool
needsPermissions({ path }) {
  return !hasReadPermission(path || getCwd())
}
```

## Shell Management

Claude Code maintains a persistent shell session:

```typescript
// PersistentShell singleton
export class PersistentShell {
  private static instance: PersistentShell | null = null
  
  // Get or create instance
  public static getInstance(): PersistentShell {...}
  
  // Execute commands with timeout and signal support
  public exec(command: string, abortSignal?: AbortSignal, timeout?: number): Promise<{...}>
  
  // Change working directory
  public setCwd(cwd: string): Promise<void>
}
```

## React UI Components

The UI is built with React and rendered in the terminal using Ink:

```tsx
// BashTool result rendering
renderToolResultMessage(content, { verbose }) {
  return <BashToolResultMessage content={content} verbose={verbose} />
}
```

## Evolution to v0.2.49

As observed in our feature comparison, the newer versions have:

1. Renamed several tools for consistency (e.g., FileReadTool → View)
2. Added BatchTool for parallel operations
3. Added WebFetch for URL content access
4. Enhanced the permission system
5. Improved the CLI interface
6. Expanded MCP (Model Control Protocol) capabilities

The core architecture remains similar, while adding new capabilities and refinements to the existing functionality.