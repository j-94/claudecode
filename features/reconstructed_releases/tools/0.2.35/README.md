# Claude Code 0.2.35 Tools

## Available Tools

### ViewTool (View)

Reads files from the local filesystem (renamed from FileReadTool)

### GlobTool (Glob)

Finds files matching glob patterns

### GrepTool (Grep)

Searches file contents using regular expressions

### WebFetch (Web Fetch) 🆕

Fetches content from specific documentation and code hosting websites

## Tool Interface

All tools follow a standard interface with these methods:

```typescript
interface Tool<TInput, TOutput> {
  name: string;                    // Internal name
  userFacingName(): string;        // User-visible name
  description(): Promise<string>;  // Tool description
  inputSchema: ZodSchema;          // Input validation schema
  isReadOnly(): boolean;           // Whether tool modifies state
  isEnabled(): Promise<boolean>;   // Whether tool is available
  needsPermissions(input: TInput): boolean; // Whether tool requires permission
  validateInput?(input: TInput, context: any): Promise<ValidationResult>; // Validate input
  call(input: TInput, context: any, ...args: any[]): AsyncGenerator; // Execute tool
  renderToolUseMessage(input: TInput, context: any): React.ReactNode; // Render tool use
  renderToolResultMessage(result: TOutput): React.ReactNode; // Render result
  renderToolUseRejectedMessage(input: TInput): React.ReactNode; // Render rejection
  renderResultForAssistant(result: TOutput): string; // Format for Claude
}
```
