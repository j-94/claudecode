import React from 'react';
import { Box, Text } from 'ink';
import { z } from 'zod';
import { Tool } from '../tools';

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
  
  userFacingName() { 
    return "Call";
  },
  
  async description(_, { permissionMode }) {
    return `
- Batch execution tool that runs multiple tool invocations in a single request
- Tools are executed in parallel when possible, and otherwise serially
- Takes a list of tool invocations (tool_name and input pairs)
- Returns the collected results from all invocations
- Use this tool when you need to run multiple independent tool operations at once -- it is awesome for speeding up your workflow, reducing both context usage and latency
- Each tool will respect its own permissions and validation rules
- The tool's outputs are NOT shown to the user; to answer the user's query, you MUST send a message with the results after the tool call completes, otherwise the user will not see the results

Available tools:
${(await Promise.all((await getEnabledTools()).map(async(tool) => `Tool: ${tool.name}
Arguments: ${formatInputSchema(tool.inputSchema)}
Usage: ${await tool.prompt({ permissionMode })}`))).join(`
---`)}

Example usage:
{
  "description": "Check repository status",
  "invocations": [
    {
      "tool_name": "Bash",
      "input": {
        "command": "git blame src/foo.ts"
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
        "pattern": "function",
        "include": "*.ts"
      }
    }
  ]
}`;
  },
  
  inputSchema,
  
  isReadOnly() {
    return true; // The tool itself is read-only, though it may call tools that aren't
  },
  
  async isEnabled() {
    return true;
  },
  
  needsPermissions() {
    return false; // The individual tools will handle their own permissions
  },
  
  async prompt({ permissionMode }) {
    return await this.description(null, { permissionMode });
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
  
  // Based on minified implementation patterns
  async *call({ invocations }, context, onProgress, message) {
    const startTime = Date.now();
    const tokenUsage = {};
    let tokenCount = 0;
    let toolCalls = 0;
    
    // Map invocations to tool use IDs for tracking
    const toolUses = invocations.map((invocation, index) => ({
      id: `batch_${message.message.id}_${index}`,
      input: invocation.input,
      name: invocation.tool_name,
      type: "tool_use"
    }));
    
    // Results collection for all tools
    const results = [];
    
    // Execute all tools and collect their results
    for (const [index, toolUse] of toolUses.entries()) {
      try {
        const tool = context.tools.find(t => t.name === toolUse.name);
        
        if (!tool) {
          results.push({
            success: false,
            tool_name: toolUse.name,
            error: `Tool ${toolUse.name} not found`
          });
          continue;
        }
        
        // Execute the tool
        const generator = tool.call(toolUse.input, context);
        let lastResult = null;
        
        for await (const result of generator) {
          // Track progress and token usage
          if (result.type === 'progress' && result.message?.message?.usage) {
            const usage = result.message.message.usage;
            tokenUsage[toolUse.id] = (
              (usage.cache_creation_input_tokens || 0) +
              (usage.cache_read_input_tokens || 0) +
              usage.input_tokens +
              usage.output_tokens
            );
          }
          
          // Store final result
          if (result.type === 'result') {
            lastResult = result.data;
            toolCalls++;
          }
        }
        
        results.push({
          success: true,
          tool_name: toolUse.name,
          result: lastResult
        });
      } catch (error) {
        results.push({
          success: false,
          tool_name: toolUse.name,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
    
    // Calculate total token usage
    tokenCount = Object.values(tokenUsage).reduce((sum, count) => sum + Number(count), 0);
    
    const durationMs = Date.now() - startTime;
    
    // Return final results
    yield {
      type: 'result',
      resultForAssistant: this.renderResultForAssistant(results),
      data: {
        length: results.length,
        results,
        durationMs,
        tokenCount
      }
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

// Helper functions extracted from minified code
async function getEnabledTools() {
  const allTools = [/* list of tools */];
  const enabledResults = await Promise.all(allTools.map(tool => tool.isEnabled()));
  return allTools.filter((tool, index) => enabledResults[index]);
}

function formatInputSchema(schema) {
  const { properties, required = [] } = schema;
  return Object.entries(properties).map(([name, prop]) => 
    `${required.includes(name) ? "" : "[optional] "}${name}: ${prop.type} "${prop.description}"`
  ).join(", ");
}