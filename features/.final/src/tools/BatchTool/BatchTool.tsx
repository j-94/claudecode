import React from 'react';
import { Box, Text } from 'ink';
import { z } from 'zod';
import { Tool } from '../../tools';
import Cost from '../../components/Cost';

// Input schema for BatchTool (shows as "Call" to users)
const inputSchema = z.strictObject({
  description: z.string().describe('A short (3-5 word) description of the batch operation'),
  invocations: z.array(
    z.object({
      tool_name: z.string().describe('The name of the tool to invoke'),
      input: z.record(z.any()).describe('The input to pass to the tool')
    })
  ).describe('The list of tool invocations to execute')
});

// Output interface
interface BatchToolOutput {
  results: any[];
  durationMs: number;
  tokenCount: number;
}

// BatchTool implementation
export const BatchTool = {
  name: 'BatchTool',
  
  // This tool appears as "Call" to users
  userFacingName() { 
    return "Call";
  },
  
  async description() {
    return `
- Batch execution tool that runs multiple tool invocations in a single request
- Tools are executed in parallel when possible, and otherwise serially
- Takes a list of tool invocations (tool_name and input pairs)
- Returns the collected results from all invocations
- Use this tool when you need to run multiple independent tool operations at once -- it is awesome for speeding up your workflow, reducing both context usage and latency
- Each tool will respect its own permissions and validation rules
- The tool's outputs are NOT shown to the user; to answer the user's query, you MUST send a message with the results after the tool call completes, otherwise the user will not see the results

Example usage:
{
  "description": "Check repository status",
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
    }
  ]
}
`;
  },
  
  inputSchema,
  
  // This tool only executes other tools, it doesn't modify anything directly
  isReadOnly() {
    return true;
  },
  
  async isEnabled() {
    return true;
  },
  
  // The tool itself doesn't need permissions, but individual tools it calls might
  needsPermissions() {
    return false;
  },
  
  async validateInput({ invocations }, context) {
    // Validate that all requested tools exist and their inputs are valid
    for (const invocation of invocations) {
      const tool = context.tools.find(t => t.name === invocation.tool_name);
      if (!tool) {
        return {
          result: false,
          message: `Tool ${invocation.tool_name} not found`
        };
      }
      
      if (tool.validateInput) {
        const validationResult = await tool.validateInput(invocation.input, context);
        if (!validationResult.result) {
          return {
            result: false,
            message: `Tool ${invocation.tool_name} validation failed: ${validationResult.message}`
          };
        }
      }
    }
    
    return { result: true };
  },
  
  async *call({ description, invocations }, context, onProgress, message) {
    const startTime = Date.now();
    const results = [];
    let tokenCount = 0;
    
    // Execute all tool invocations in parallel
    const toolPromises = invocations.map(async (invocation, index) => {
      try {
        const tool = context.tools.find(t => t.name === invocation.tool_name);
        if (!tool) {
          throw new Error(`Tool ${invocation.tool_name} not found`);
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
  },
  
  renderToolUseMessage({ description, invocations }, { verbose }) {
    return description || `Calling ${invocations.length} tools`;
  },
  
  renderToolResultMessage({ results, durationMs }) {
    return (
      <Box justifyContent="space-between" width="100%">
        <Box flexDirection="column">
          <Text>  ⎿ Completed {results.length} tool invocations</Text>
        </Box>
        <Cost costUSD={0} durationMs={durationMs} debug={false} />
      </Box>
    );
  },
  
  renderToolUseRejectedMessage() {
    return <Text>  ⎿ Batch operation cancelled</Text>;
  },
  
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
} satisfies Tool<typeof inputSchema, BatchToolOutput>;
