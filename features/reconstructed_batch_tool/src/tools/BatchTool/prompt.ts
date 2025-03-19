
// Prompt for the BatchTool
export const batchToolPrompt = `
This tool allows you to execute multiple tool calls in parallel.

- When you need to run multiple independent operations at once, use BatchTool
- You can invoke any available tools within a batch operation
- Operations are executed in parallel when possible, reducing latency
- All tools respect their original permissions and validation rules
- Format for batch operations:

{
  "description": "A short description",
  "invocations": [
    {
      "tool_name": "ToolName",
      "input": {
        // Tool-specific parameters
      }
    },
    // More tool invocations...
  ]
}

Examples:
- Reading multiple files simultaneously
- Searching across files with multiple patterns
- Running multiple git commands to gather repository status
- Making several file edits in a single operation
`;
