# Claude Code Tool Interface

This document details the standard interface implemented by all tools in Claude Code.

## Core Tool Interface

All tools in Claude Code implement the following TypeScript interface:

```typescript
interface Tool<TInput, TOutput> {
  // Core identity
  name: string;                    // Internal identifier (e.g., "BatchTool")
  userFacingName(): string;        // User-visible name (e.g., "Call")
  
  // Description and documentation
  description(opts?: any): Promise<string>;  // Detailed tool description
  prompt(opts?: any): Promise<string>;      // User-facing prompt/help
  
  // Schemas and validation
  inputSchema: ZodSchema;          // Input validation using Zod
  validateInput?(input: TInput, context: any): Promise<ValidationResult>; // Custom validation 
  
  // Capability flags
  isReadOnly(): boolean;           // Whether tool modifies state
  isEnabled(): Promise<boolean>;   // Whether tool is available
  needsPermissions(input: TInput, context?: any): boolean; // Permissions check
  
  // Main execution function
  call(                            // Executes the tool
    input: TInput,                 // Input parameters 
    context: ToolContext,          // Execution context
    onProgress?: ProgressCallback, // Optional progress callback
    message?: Message,             // Related message
    options?: any                  // Additional options
  ): AsyncGenerator<
    | { type: 'progress', message: any }     // Progress updates
    | { type: 'result', data: TOutput, resultForAssistant: string }  // Final result
  >; 
  
  // UI rendering functions
  renderToolUseMessage(input: TInput, context: any): React.ReactNode; // Render tool usage
  renderToolResultMessage(result: TOutput): React.ReactNode;          // Render results
  renderToolUseRejectedMessage(input: TInput): React.ReactNode;       // Render rejection
  
  // Claude response formatter
  renderResultForAssistant(result: TOutput): string;                  // Format for Claude
}
```

## ToolContext Object

All tools receive a context object providing access to:

```typescript
interface ToolContext {
  // Core execution context
  abortController: AbortController;  // For cancellation
  options: {                         // Configuration options
    verbose: boolean;                // Verbose output flag
    tools: Tool[];                   // Available tools
    isNonInteractiveSession: boolean;// Is this non-interactive?
    forkNumber: number;              // Session fork ID
    messageLogName: string;          // Log ID
  };
  
  // Helper functions
  getToolPermissionContext: () => PermissionContext; // Get permission context
  readFileTimestamps: () => Record<string, number>;  // File timestamps
  userProvidedUrls: string[];        // URLs provided by user
}
```

## Implementation Patterns

### Async Generator Pattern

Tools use async generators to provide progress updates during execution:

```typescript
async *call(input, context, onProgress) {
  // Initial state
  const startTime = Date.now();
  
  // Yield progress updates
  yield {
    type: 'progress',
    message: { content: "Starting operation..." }
  };
  
  // Perform actual work
  const result = await performOperation(input);
  
  // Calculate metrics
  const duration = Date.now() - startTime;
  
  // Yield final result
  yield {
    type: 'result',
    data: { ...result, duration },
    resultForAssistant: this.renderResultForAssistant(result)
  };
}
```

