import React from 'react';
import { Box, Text } from 'ink';
import { z } from 'zod';
import { Tool } from '../../tools';
import { ToolContext, ToolResult } from '../../tools';
import Cost from '../../components/Cost';

// Input schema for BatchTool
const inputSchema = z.object({
  description: z.string().describe('A short (3-5 word) description of the batch operation'),
  invocations: z.array(
    z.object({
      tool_name: z.string().describe('The name of the tool to invoke'),
      input: z.object({}).passthrough().describe('The input to pass to the tool')
    })
  ).describe('The list of tool invocations to execute')
});

// Output interface for BatchTool
interface BatchToolOutput {
  results: any[];
  durationMs: number;
  errorCount: number;
}

// BatchTool implementation
export const BatchTool = {
  name: 'BatchTool',
  
  async description() {
    return `
- Batch execution tool that runs multiple tool invocations in a single request
- Tools are executed in parallel when possible, and otherwise serially
- Takes a list of tool invocations (tool_name and input pairs)
- Returns the collected results from all invocations
- Use this tool when you need to run multiple independent tool operations at once -- it is awesome for speeding up your workflow, reducing both context usage and latency
- Each tool will respect its own permissions and validation rules
`;
  },
  
  inputSchema,
  
  isReadOnly() {
    return false; // Not read-only because it can invoke tools that modify files
  },
  
  async isEnabled() {
    return true;
  },
  
  needsPermissions({ invocations }, { tools }) {
    // Check if any of the invocations needs permissions
    return invocations.some(invocation => {
      const tool = tools.find(t => t.name === invocation.tool_name);
      if (!tool) return false;
      return tool.needsPermissions?.(invocation.input);
    });
  },
  
  async validateInput({ invocations }, context) {
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
  
  async *call({ description, invocations }, context, onProgress) {
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
        const generator = tool.call(invocation.input, context);
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
    };
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
      return "Successfully executed " + results.length + " tools.

" + 
        successResults.map(r => r.tool_name + ": " + JSON.stringify(r.result)).join('

');
    }
    
    return "Executed " + results.length + " tools with " + failureResults.length + " errors.

" +
      successResults.map(r => "✅ " + r.tool_name + ": " + JSON.stringify(r.result)).join('

') + '

' +
      failureResults.map(r => "❌ " + r.tool_name + ": " + r.error).join('

');
  }
} satisfies Tool<typeof inputSchema, BatchToolOutput>;
