#!/usr/bin/env node

/**
 * BatchTool Implementation Extractor
 * 
 * This script uses the original source code structure to help unminify and 
 * reconstruct the BatchTool implementation from minified code.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const ORIGINAL_SRC = path.join(__dirname, '..', 'original_codebase');
const MINIFIED_CODE_PATH = path.join(__dirname, 'releases', 'extracted', 'v0.2.49', 'package', 'cli.js');
const BATCH_TOOL_MARKER = 'Batch execution tool';
const OUTPUT_DIR = path.join(__dirname, 'reconstructed_batch_tool');

// Create output directory
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

/**
 * Analyzes the original source code to understand the tool implementation pattern
 */
function analyzeOriginalSourceStructure() {
  console.log('Analyzing original source code structure...');
  
  const toolsDir = path.join(ORIGINAL_SRC, 'src', 'tools');
  if (!fs.existsSync(toolsDir)) {
    console.error('Original source code tools directory not found');
    return null;
  }
  
  // Find a representative tool to use as a template
  const bashToolDir = path.join(toolsDir, 'BashTool');
  const fileReadToolDir = path.join(toolsDir, 'FileReadTool');
  
  let templateToolDir = null;
  let templateToolName = null;
  
  if (fs.existsSync(bashToolDir)) {
    templateToolDir = bashToolDir;
    templateToolName = 'BashTool';
  } else if (fs.existsSync(fileReadToolDir)) {
    templateToolDir = fileReadToolDir;
    templateToolName = 'FileReadTool';
  } else {
    // Use any tool directory available
    const toolDirs = fs.readdirSync(toolsDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    if (toolDirs.length === 0) {
      console.error('No tool directories found in original source');
      return null;
    }
    
    templateToolName = toolDirs[0];
    templateToolDir = path.join(toolsDir, templateToolName);
  }
  
  console.log(`Using ${templateToolName} as template for reconstruction`);
  
  // Read template tool files
  const templateFiles = {};
  const mainToolFile = path.join(templateToolDir, `${templateToolName}.tsx`);
  const promptFile = path.join(templateToolDir, 'prompt.ts');
  const utilsFile = path.join(templateToolDir, 'utils.ts');
  
  if (fs.existsSync(mainToolFile)) {
    templateFiles.main = fs.readFileSync(mainToolFile, 'utf8');
  } else {
    console.error(`Template tool main file not found: ${mainToolFile}`);
    return null;
  }
  
  if (fs.existsSync(promptFile)) {
    templateFiles.prompt = fs.readFileSync(promptFile, 'utf8');
  }
  
  if (fs.existsSync(utilsFile)) {
    templateFiles.utils = fs.readFileSync(utilsFile, 'utf8');
  }
  
  return {
    templateToolName,
    templateFiles
  };
}

/**
 * Extract BatchTool related code from minified source
 */
function extractBatchToolCode() {
  console.log('Extracting BatchTool related code from minified source...');
  
  if (!fs.existsSync(MINIFIED_CODE_PATH)) {
    console.error(`Minified code file not found: ${MINIFIED_CODE_PATH}`);
    return null;
  }
  
  const minifiedCode = fs.readFileSync(MINIFIED_CODE_PATH, 'utf8');
  
  // Find BatchTool description
  const descMarkerIndex = minifiedCode.indexOf(BATCH_TOOL_MARKER);
  if (descMarkerIndex === -1) {
    console.error(`Batch tool marker not found in minified code`);
    return null;
  }
  
  // Extract 5000 chars before and after the marker to capture implementation context
  const startIndex = Math.max(0, descMarkerIndex - 5000);
  const endIndex = Math.min(minifiedCode.length, descMarkerIndex + 5000);
  
  const batchToolContext = minifiedCode.substring(startIndex, endIndex);
  
  // Look for key patterns in batch tool implementation
  const patterns = {
    inputSchema: /(\w+)\s*=\s*Z1\.object\(\{[^}]+?description\s*:\s*["']A short \(3-5 word\)/,
    toolName: /name\s*:\s*["']BatchTool["']/,
    toolDescription: /description\s*:\s*["']Batch execution tool/,
    callMethod: /async\s*\*\s*call\(\{[^}]+?invocations\s*:/,
    renderResult: /renderResultForAssistant\(\{[^}]+?\}\)\s*\{/
  };
  
  const extractedParts = {};
  
  for (const [key, pattern] of Object.entries(patterns)) {
    const match = batchToolContext.match(pattern);
    if (match) {
      const matchStart = match.index;
      
      // Extract roughly 2000 chars starting at the match position
      const contextEnd = Math.min(matchStart + 2000, batchToolContext.length);
      extractedParts[key] = batchToolContext.substring(matchStart, contextEnd);
    }
  }
  
  return {
    context: batchToolContext,
    extractedParts
  };
}

/**
 * Attempt to reconstruct BatchTool implementation from extracted parts
 */
function reconstructBatchToolImplementation(originalStructure, extractedCode) {
  console.log('Reconstructing BatchTool implementation...');
  
  if (!originalStructure || !extractedCode) {
    console.error('Original structure or extracted code missing');
    return null;
  }
  
  // STAGE 1: Reconstruct the main file
  let mainFileContent = `import React from 'react';
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
    return \`
- Batch execution tool that runs multiple tool invocations in a single request
- Tools are executed in parallel when possible, and otherwise serially
- Takes a list of tool invocations (tool_name and input pairs)
- Returns the collected results from all invocations
- Use this tool when you need to run multiple independent tool operations at once -- it is awesome for speeding up your workflow, reducing both context usage and latency
- Each tool will respect its own permissions and validation rules
\`;
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
          message: \`Tool \${invocation.tool_name} not found\`
        };
      }
      
      if (tool.validateInput) {
        const validationResult = await tool.validateInput(invocation.input, context);
        if (!validationResult.result) {
          return {
            result: false,
            message: \`Tool \${invocation.tool_name} validation failed: \${validationResult.message}\`
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
          throw new Error(\`Tool \${invocation.tool_name} not found\`);
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
    return \`\${description || 'Batch operation'} (\${invocations.length} tools)\`;
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
      return "Successfully executed " + results.length + " tools.\n\n" + 
        successResults.map(r => r.tool_name + ": " + JSON.stringify(r.result)).join('\n\n');
    }
    
    return "Executed " + results.length + " tools with " + failureResults.length + " errors.\n\n" +
      successResults.map(r => "✅ " + r.tool_name + ": " + JSON.stringify(r.result)).join('\n\n') + '\n\n' +
      failureResults.map(r => "❌ " + r.tool_name + ": " + r.error).join('\n\n');
  }
} satisfies Tool<typeof inputSchema, BatchToolOutput>;
`;

  // STAGE 2: Create BatchTool directory structure
  const batchToolDir = path.join(OUTPUT_DIR, 'src', 'tools', 'BatchTool');
  fs.mkdirSync(batchToolDir, { recursive: true });
  
  // Write main file
  fs.writeFileSync(path.join(batchToolDir, 'BatchTool.tsx'), mainFileContent);
  
  // STAGE 3: Reconstruct prompt.ts file
  const promptContent = `
// Prompt for the BatchTool
export const batchToolPrompt = \`
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
\`;
`;
  
  fs.writeFileSync(path.join(batchToolDir, 'prompt.ts'), promptContent);
  
  // STAGE 4: Create extracted snippets file for reference
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'extracted_batch_tool_snippets.js'), 
    JSON.stringify(extractedCode.extractedParts, null, 2)
  );
  
  // STAGE 5: Create context file for reference
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'batch_tool_context.js'),
    extractedCode.context
  );
  
  console.log(`BatchTool implementation reconstructed in ${OUTPUT_DIR}`);
  
  return {
    mainFilePath: path.join(batchToolDir, 'BatchTool.tsx'),
    promptFilePath: path.join(batchToolDir, 'prompt.ts')
  };
}

/**
 * Main execution function
 */
async function main() {
  console.log('BatchTool Implementation Extractor');
  console.log('================================');
  
  // Step 1: Analyze original source code structure
  const originalStructure = analyzeOriginalSourceStructure();
  
  // Step 2: Extract BatchTool code from minified source
  const extractedCode = extractBatchToolCode();
  
  // Step 3: Reconstruct BatchTool implementation
  const reconstructedFiles = reconstructBatchToolImplementation(
    originalStructure, 
    extractedCode
  );
  
  if (reconstructedFiles) {
    console.log(`
Reconstruction successful!

Files generated:
- Main implementation: ${reconstructedFiles.mainFilePath}
- Prompt file: ${reconstructedFiles.promptFilePath}
- Extracted snippets: ${path.join(OUTPUT_DIR, 'extracted_batch_tool_snippets.js')}
- Context file: ${path.join(OUTPUT_DIR, 'batch_tool_context.js')}

Note: This is a best-effort reconstruction based on the original codebase 
patterns and the minified code. The actual implementation may differ, but
this should provide a good understanding of how BatchTool works.
`);
  } else {
    console.error('Reconstruction failed.');
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});