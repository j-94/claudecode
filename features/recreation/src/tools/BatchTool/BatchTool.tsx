import React from 'react';
import { Box, Text } from 'ink';
import { z } from 'zod';
import type { Tool, ToolContext, ToolResult } from '../../tools';

// Define BatchTool input schema
const inputSchema = z.object({
  description: z.string().describe('A short (3-5 word) description of the batch operation'),
  invocations: z.array(
    z.object({
      tool_name: z.string().describe('The name of the tool to invoke'),
      input: z.record(z.any()).describe('The input to pass to the tool')
    })
  ).describe('The list of tool invocations to execute')
});

// Define BatchTool output interface
interface BatchToolOutput {
  results: any[];
  durationMs: number;
  errorCount: number;
}

// BatchTool implementation
export const BatchTool = {
  name: 'BatchTool',
  
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
`;
  },
  
  inputSchema,
  
  isReadOnly() {
    return false; // Not read-only because it can invoke tools that modify files
  },
  
  async isEnabled() {
    return true;
  },
  
  needsPermissions({ invocations }, context: ToolContext) {
    // Check if any of the invocations needs permissions
    return invocations.some(invocation => {
      const tool = context.tools.find(t => t.name === invocation.tool_name);
      if (!tool) return false;
      return tool.needsPermissions?.(invocation.input, context);
    });
  },
  
  async validateInput({ invocations }, context: ToolContext) {
    // Validate that all invoked tools exist and their inputs are valid
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
  
  async *call({ description, invocations }, context: ToolContext, onProgress, message) {
    const startTime = Date.now();
    const results = [];
    let errorCount = 0;
    
    // Execute all tool invocations in parallel
    const toolPromises = invocations.map(async (invocation, index) => {
      try {
        const tool = context.tools.find(t => t.name === invocation.tool_name);
        if (!tool) {
          throw new Error(`Tool ${invocation.tool_name} not found`);
        }
        
        // Execute the tool and collect the result
        const generator = tool.call(invocation.input, context, onProgress, message);
        let lastResult = null;
        
        for await (const result of generator) {
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
        errorCount++;
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
        errorCount
      }),
      data: {
        results,
        durationMs,
        errorCount
      }
    } as ToolResult;
  },
  
  renderToolUseMessage({ description, invocations }, { verbose }) {
    return `${description || 'Batch operation'} (${invocations.length} tools)`;
  },
  
  renderToolResultMessage({ results, durationMs, errorCount }) {
    return (
      <Box justifyContent="space-between" width="100%">
        <Box flexDirection="column">
          <Text>  ⎿ Executed {results.length} tools ({errorCount > 0 ? errorCount + " errors" : 'all succeeded'})</Text>
        </Box>
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
} satisfies Tool<z.infer<typeof inputSchema>, BatchToolOutput>;
