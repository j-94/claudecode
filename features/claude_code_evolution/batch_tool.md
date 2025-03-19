# BatchTool / Call Tool

This document provides an in-depth analysis of the BatchTool (user-facing name: "Call") implementation in Claude Code.

## Overview

The BatchTool, introduced in v0.2.45, enables parallel execution of multiple tool invocations in a single request. This significantly improves performance when multiple independent operations need to be performed, reducing both context usage and latency.

## Implementation Details

### Input Schema

```typescript
const inputSchema = z.strictObject({
  description: z.string().describe('A short (3-5 word) description of the batch operation'),
  invocations: z.array(
    z.object({
      tool_name: z.string().describe('The name of the tool to invoke'),
      input: z.record(z.any()).describe('The input to pass to the tool')
    })
  ).describe('The list of tool invocations to execute')
});
```

### Parallel Execution

The tool processes multiple invocations in parallel using Promise.all():

```typescript
async *call({ description, invocations }, context, onProgress, message) {
  const startTime = Date.now();
  const results = [];
  let tokenCount = 0;
  
  // Execute all tool invocations in parallel
  const toolPromises = invocations.map(async (invocation, index) => {
    try {
      const tool = context.tools.find(t => t.name === invocation.tool_name);
      if (!tool) {
        throw new Error("Tool " + invocation.tool_name + " not found");
      }
      
      // Execute the tool and collect the result
      const generator = tool.call(invocation.input, context);
      let lastResult = null;
      
      for await (const result of generator) {
        // Track token usage
        if (result.type === 'progress' && result.message?.message?.usage) {
          tokenCount += (result.message.message.usage.input_tokens || 0) + 
                     (result.message.message.usage.output_tokens || 0);
        }
        
        // Store the final result
        if (result.type === 'result') {
          lastResult = result.data;
        }
      }
      
      return {
        success: true,
        tool_name: invocation.tool_name,
        result: lastResult
      };
    } catch (error) {
      return {
        success: false,
        tool_name: invocation.tool_name,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  });
  
  // Wait for all tools to complete
  const toolResults = await Promise.all(toolPromises);
  results.push(...toolResults);
  
  const durationMs = Date.now() - startTime;
  
  yield {
    type: 'result',
    resultForAssistant: this.renderResultForAssistant({
      results,
      durationMs,
      tokenCount
    }),
    data: {
      results,
      durationMs,
      tokenCount
    }
  };
}
```

### Result Formatting

The tool formats results for Claude's consumption, handling both successful and failed invocations:

```typescript
renderResultForAssistant({ results }) {
  const successResults = results.filter(r => r.success);
  const failureResults = results.filter(r => !r.success);
  
  if (failureResults.length === 0) {
    return "Successfully executed " + results.length + " tools.\n\n" + 
      successResults.map(r => r.tool_name + ": " + JSON.stringify(r.result)).join('\n\n');
  }
  
  return "Executed " + results.length + " tools with " + failureResults.length + " errors.\n\n" +
    successResults.map(r => "✅ " + r.tool_name + ": " + JSON.stringify(r.result)).join('\n\n') + '\n\n' +
    failureResults.map(r => "❌ " + r.tool_name + ": " + r.error).join('\n\n');
}
```

## Key Benefits

1. **Parallel Execution**: Significantly reduces latency when multiple independent operations are needed
2. **Context Efficiency**: Reduces context usage by batching operations into a single tool call
3. **Error Isolation**: Individual tool failures don't fail the entire batch operation
4. **Permission Respect**: Each tool in a batch respects its own permissions and validation rules

## Example Usage

```json
{
  "description": "Repository analysis",
  "invocations": [
    {
      "tool_name": "Bash",
      "input": {
        "command": "git status"
      }
    },
    {
      "tool_name": "GlobTool",
      "input": {
        "pattern": "**/*.ts"
      }
    },
    {
      "tool_name": "GrepTool",
      "input": {
        "pattern": "TODO|FIXME",
        "include": "*.{ts,js}"
      }
    }
  ]
}
```
