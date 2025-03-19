# Claude Code Core

This is a reconstructed implementation of the Claude Code tool system core functionality. It includes the underlying architecture and key tools from the Claude Code CLI.

## Tools Implemented

- **BatchTool (Call)**: Executes multiple tool invocations in parallel
- **BashTool (Bash)**: Runs shell commands with safety checks
- **ViewTool (View)**: Reads files with line numbering

## Architecture

The core architecture revolves around the `Tool` interface, which all tools implement:

```typescript
interface Tool<In, Out> {
  name: string;                       // Internal name
  userFacingName(): string;           // Display name
  description(): Promise<string>;     // Dynamic description
  inputSchema: z.ZodType<any>;        // Input validation schema
  isReadOnly(): boolean;              // Whether tool modifies state
  isEnabled(): Promise<boolean>;      // Tool availability
  needsPermissions(input): boolean;   // Permission requirements
  validateInput?(input): Promise<ValidationResult>; // Input validation
  call(input, context): AsyncGenerator; // Execution
  renderToolUseMessage(input): string; // Format tool requests
  renderToolResultMessage(content): JSX.Element; // Format results
  renderResultForAssistant(output): string; // Format Claude response
  renderToolUseRejectedMessage(): JSX.Element; // Format rejection
}
```

## Core Systems

1. **Permission System**: Granular security controls for file access and commands
2. **Persistent Shell**: Maintains session state across command executions
3. **File Utilities**: Functions for safe file access and validation

## Usage

This module can be used as the foundation for building CLI tools that integrate with Claude or other LLMs:

```typescript
import { BashTool, ViewTool, BatchTool } from '@anthropic-ai/claude-code';

// Initialize tools with context
const tools = [BashTool, ViewTool, BatchTool];

// Execute a tool
const result = await executeTool(BashTool, { command: 'echo Hello' }, context);
```

## License

MIT