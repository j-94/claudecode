# BatchTool Feature

BatchTool allows executing multiple tool calls in parallel, which significantly improves performance when multiple independent operations need to be performed.

## Key capabilities:

- Execute multiple tools in a single request
- Run operations in parallel when possible
- Return collected results from all invocations
- Support for all available tools in Claude Code

## Tool signature:

```javascript
{
  name: "BatchTool",
  description: "Batch execution tool that runs multiple tool invocations in a single request",
  parameters: {
    description: "A short (3-5 word) description of the batch operation",
    invocations: [
      {
        tool_name: "ToolName",
        input: {
          // Tool-specific parameters
        }
      },
      // Additional tool invocations...
    ]
  }
}
```

This tool is especially valuable for operations like:
1. Running multiple git commands to gather repository status
2. Reading multiple files simultaneously
3. Searching across many files in parallel
4. Making multiple file edits in a batch

The BatchTool significantly reduces latency and context usage compared to running tools sequentially.