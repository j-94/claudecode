import React from 'react';
import { Box, Text } from 'ink';
import { z } from 'zod';
import { Tool } from '../../Tool.js';

/**
 * BatchTool - A high-fidelity reconstruction based on the Claude Code implementation
 * 
 * Key features:
 * - Executes multiple tool invocations in parallel
 * - Internal name: "BatchTool", user-facing name: "Call"
 * - First appeared in Claude Code v0.2.45
 */

// Input schema for BatchTool
const inputSchema = z.strictObject({
  description: z.string().describe("A short (3-5 word) description of the batch operation"),
  invocations: z.array(
    z.object({
      tool_name: z.string().describe("The name of the tool to invoke"),
      input: z.record(z.any()).describe("The input to pass to the tool")
    })
  ).describe("The list of tool invocations to execute")
});

// Output interface
interface BatchToolOutput {
  length: number;
  results: any[];
  durationMs: number;
  tokenCount: number;
}

// BatchTool implementation
export const BatchTool = {
  name: 'BatchTool',
  
  userFacingName: "BatchTool", 
  
  // For simplified implementation, use a static description
  description: `
- Batch execution tool that runs multiple tool invocations in a single request
- Tools are executed in parallel when possible, and otherwise serially
- Takes a list of tool invocations (tool_name and input pairs)
- Returns the collected results from all invocations
- Use this tool when you need to run multiple independent tool operations at once -- it is awesome for speeding up your workflow, reducing both context usage and latency
- Each tool will respect its own permissions and validation rules
- The tool's outputs are NOT shown to the user; to answer the user's query, you MUST send a message with the results after the tool call completes, otherwise the user will not see the results`,
  
  inputSchema,
  
  isReadOnly() {
    return true; // The tool itself is read-only, though it may call tools that aren't
  },
  
  isEnabled: async () => {
    return true;
  },
  
  needsPermissions() {
    return false; // The individual tools will handle their own permissions
  },
  
  renderToolUseMessage({ description, invocations }, { verbose }) {
    return description || `Calling ${invocations.length} tools`;
  },
  
  renderToolUseRejectedMessage() {
    return <Text>  ⎿ Batch operation cancelled</Text>;
  },
  
  renderToolResultMessage(results) {
    return (
      <Box flexDirection="column">
        <Text>Completed {results.length} tool invocations</Text>
      </Box>
    );
  },
  
  // Simplified implementation that works with our reconstructed tools
  async call({ description, invocations }, context) {
    const startTime = Date.now();
    const results = [];
    
    // Execute all tools and collect their results
    for (const invocation of invocations) {
      try {
        const tool = context.tools.find(t => t.name === invocation.tool_name);
        
        if (!tool) {
          results.push({
            success: false,
            tool_name: invocation.tool_name,
            error: `Tool ${invocation.tool_name} not found`
          });
          continue;
        }
        
        // Execute the tool
        const result = await tool.call(invocation.input, context);
        results.push({
          success: true,
          tool_name: invocation.tool_name,
          result
        });
      } catch (error) {
        results.push({
          success: false,
          tool_name: invocation.tool_name,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
    
    const durationMs = Date.now() - startTime;
    
    // Return simplified result format
    return {
      length: results.length,
      results,
      durationMs
    };
  },
  
  renderResultForAssistant(results) {
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
} as Tool;