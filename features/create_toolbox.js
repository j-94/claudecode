#!/usr/bin/env node

/**
 * Claude Code Evolution Analysis Tool
 * 
 * This script creates a structured documentation of Claude Code tools
 * across different versions, based on our analysis.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const OUTPUT_DIR = path.join(__dirname, 'claude_code_evolution');

// Tool presence across versions
const TOOLS = [
  {
    name: 'AgentTool',
    userFacingName: 'Task',
    firstVersion: '0.2.9',
    description: 'Launches a new agent that has access to tools for searching and reading files',
    isReadOnly: true,
    needsPermissions: false,
    inputSchema: {
      prompt: 'string - The task for the agent to perform'
    }
  },
  {
    name: 'FileReadTool',
    userFacingName: 'Read',
    firstVersion: '0.2.9',
    lastVersion: '0.2.17', // Renamed to ViewTool
    description: 'Reads files from the local filesystem',
    isReadOnly: true,
    needsPermissions: true,
    inputSchema: {
      file_path: 'string - The absolute path to the file to read',
      offset: 'number? - The line number to start reading from',
      limit: 'number? - The number of lines to read'
    }
  },
  {
    name: 'BashTool',
    userFacingName: 'Bash',
    firstVersion: '0.2.9',
    description: 'Executes bash commands in a persistent shell session',
    isReadOnly: false,
    needsPermissions: true,
    inputSchema: {
      command: 'string - The command to execute',
      timeout: 'number? - Optional timeout in milliseconds (max 600000)'
    }
  },
  {
    name: 'ViewTool',
    userFacingName: 'View',
    firstVersion: '0.2.18', // Renamed from FileReadTool
    description: 'Reads files from the local filesystem',
    isReadOnly: true,
    needsPermissions: true,
    inputSchema: {
      file_path: 'string - The absolute path to the file to read',
      offset: 'number? - The line number to start reading from',
      limit: 'number? - The number of lines to read'
    }
  },
  {
    name: 'GlobTool',
    userFacingName: 'Glob',
    firstVersion: '0.2.18',
    description: 'Finds files matching glob patterns',
    isReadOnly: true,
    needsPermissions: false,
    inputSchema: {
      pattern: 'string - The glob pattern to match files against',
      path: 'string? - The directory to search in. Defaults to the current directory'
    }
  },
  {
    name: 'GrepTool',
    userFacingName: 'Grep',
    firstVersion: '0.2.18',
    description: 'Searches file contents using regular expressions',
    isReadOnly: true,
    needsPermissions: false,
    inputSchema: {
      pattern: 'string - The regex pattern to search for in file contents',
      path: 'string? - The directory to search in. Defaults to the current directory',
      include: 'string? - File pattern to include in the search (e.g. "*.js")'
    }
  },
  {
    name: 'WebFetch',
    userFacingName: 'Web Fetch',
    firstVersion: '0.2.35',
    description: 'Fetches content from specific documentation and code hosting websites',
    isReadOnly: true,
    needsPermissions: true,
    inputSchema: {
      url: 'string - The URL to fetch content from',
      headers: 'Record<string, string>? - Optional HTTP headers',
      timeout: 'number? - Timeout in milliseconds (default: 10000)'
    },
    allowedDomains: [
      'github.com',
      'gitlab.com',
      'bitbucket.org',
      'docs.python.org',
      'doc.rust-lang.org',
      'developer.mozilla.org',
      'nodejs.org',
      'npmjs.com',
      'pypi.org',
      'crates.io',
      'rubygems.org',
      'pkg.go.dev',
      'rust-lang.org'
    ]
  },
  {
    name: 'ThinkTool',
    userFacingName: 'Think',
    firstVersion: '0.2.44',
    description: 'Makes a detailed plan by thinking step-by-step about a problem',
    isReadOnly: true,
    needsPermissions: false,
    inputSchema: {
      prompt: 'string - The thinking prompt to explore',
      intensity: 'enum("normal", "hard", "ultra")? - How intensely to think about the problem'
    }
  },
  {
    name: 'BatchTool',
    userFacingName: 'Call',
    firstVersion: '0.2.45',
    description: 'Executes multiple tool invocations in parallel',
    isReadOnly: true,
    needsPermissions: false,
    inputSchema: {
      description: 'string - A short description of the batch operation',
      invocations: 'array - The list of tool invocations to execute'
    }
  }
];

// Release information
const RELEASES = [
  {
    version: '0.2.9',
    cliEntry: 'cli.mjs',
    date: '2023-06',
    key_features: ['AgentTool', 'FileReadTool', 'BashTool']
  },
  {
    version: '0.2.18',
    cliEntry: 'cli.mjs',
    date: '2023-09',
    key_features: ['ViewTool', 'GlobTool', 'GrepTool']
  },
  {
    version: '0.2.35',
    cliEntry: 'cli.js',
    date: '2023-12',
    key_features: ['WebFetch']
  },
  {
    version: '0.2.44',
    cliEntry: 'cli.js',
    date: '2024-01',
    key_features: ['ThinkTool']
  },
  {
    version: '0.2.45',
    cliEntry: 'cli.js',
    date: '2024-02',
    key_features: ['BatchTool']
  },
  {
    version: '0.2.49',
    cliEntry: 'cli.js',
    date: '2024-03',
    key_features: []
  }
];

// Create the output directory
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// Generate evolution report
function generateEvolutionReport() {
  const reportPath = path.join(OUTPUT_DIR, 'tool_evolution.md');
  
  // Helper function to compare versions properly
  function isVersionInRange(version, firstVersion, lastVersion) {
    const [major1, minor1, patch1] = version.split('.').map(Number);
    const [major2, minor2, patch2] = firstVersion.split('.').map(Number);
    
    // Version needs to be greater than or equal to firstVersion
    if (major1 < major2) return false;
    if (major1 > major2) return true;
    if (minor1 < minor2) return false;
    if (minor1 > minor2) return true;
    if (patch1 < patch2) return false;
    
    // If lastVersion is specified, version needs to be less than or equal to lastVersion
    if (lastVersion) {
      const [major3, minor3, patch3] = lastVersion.split('.').map(Number);
      if (major1 > major3) return false;
      if (major1 < major3) return true;
      if (minor1 > minor3) return false;
      if (minor1 < minor3) return true;
      if (patch1 > patch3) return false;
    }
    
    return true;
  }
  
  let report = `# Claude Code Tool Evolution\n\n`;
  report += `This document provides a comprehensive overview of the evolution of Claude Code tools across versions.\n\n`;
  
  // Tool presence table
  report += `## Tool Presence by Version\n\n`;
  
  // Table header
  report += `| Version |`;
  for (const tool of TOOLS) {
    report += ` ${tool.name} (${tool.userFacingName}) |`;
  }
  report += `\n|---------|`;
  for (let i = 0; i < TOOLS.length; i++) {
    report += `---------|`;
  }
  report += `\n`;
  
  // Table rows
  for (const release of RELEASES) {
    report += `| ${release.version} |`;
    
    // For each tool, check if it's present in this release
    for (const tool of TOOLS) {
      const isPresent = isVersionInRange(release.version, tool.firstVersion, tool.lastVersion);
      
      report += ` ${isPresent ? '✅' : '❌'} |`;
    }
    
    report += `\n`;
  }
  
  // Detailed tool descriptions
  report += `\n## Tool Details\n\n`;
  
  for (const tool of TOOLS) {
    report += `### ${tool.name} (${tool.userFacingName})\n\n`;
    report += `**First appeared**: v${tool.firstVersion}`;
    if (tool.lastVersion) {
      report += ` (until v${tool.lastVersion})`;
    }
    report += `\n\n`;
    
    report += `**Description**: ${tool.description}\n\n`;
    
    report += `**Properties**:\n`;
    report += `- Read-only: ${tool.isReadOnly ? 'Yes' : 'No'}\n`;
    report += `- Requires permissions: ${tool.needsPermissions ? 'Yes' : 'No'}\n\n`;
    
    report += `**Input Schema**:\n\`\`\`\n`;
    for (const [key, value] of Object.entries(tool.inputSchema)) {
      report += `${key}: ${value}\n`;
    }
    report += `\`\`\`\n\n`;
    
    if (tool.allowedDomains) {
      report += `**Allowed Domains**:\n`;
      for (const domain of tool.allowedDomains) {
        report += `- ${domain}\n`;
      }
      report += `\n`;
    }
  }
  
  // Release timeline
  report += `## Release Timeline\n\n`;
  report += `| Version | Date | CLI Entry | Key Features |\n`;
  report += `|---------|------|-----------|---------------|\n`;
  
  for (const release of RELEASES) {
    const features = release.key_features.map(f => {
      const tool = TOOLS.find(t => t.name === f);
      return `${f} (${tool?.userFacingName || 'Unknown'})`;
    }).join(', ');
    
    report += `| ${release.version} | ${release.date} | ${release.cliEntry} | ${features} |\n`;
  }
  
  fs.writeFileSync(reportPath, report);
  console.log(`Generated tool evolution report at ${reportPath}`);
}

// Generate tool interface documentation
function generateToolInterfaceDoc() {
  const interfacePath = path.join(OUTPUT_DIR, 'tool_interface.md');
  
  let doc = `# Claude Code Tool Interface\n\n`;
  doc += `This document details the standard interface implemented by all tools in Claude Code.\n\n`;
  
  doc += `## Core Tool Interface\n\n`;
  doc += `All tools in Claude Code implement the following TypeScript interface:\n\n`;
  
  doc += "```typescript\n";
  doc += `interface Tool<TInput, TOutput> {
  // Core identity
  name: string;                    // Internal identifier (e.g., "BatchTool")
  userFacingName(): string;        // User-visible name (e.g., "Call")
  
  // Description and documentation
  description(opts?: any): Promise<string>;  // Detailed tool description
  prompt(opts?: any): Promise<string>;      // User-facing prompt/help
  
  // Schemas and validation
  inputSchema: ZodSchema;          // Input validation using Zod
  validateInput?(input: TInput, context: any): Promise<ValidationResult>; // Custom validation 
  
  // Capability flags
  isReadOnly(): boolean;           // Whether tool modifies state
  isEnabled(): Promise<boolean>;   // Whether tool is available
  needsPermissions(input: TInput, context?: any): boolean; // Permissions check
  
  // Main execution function
  call(                            // Executes the tool
    input: TInput,                 // Input parameters 
    context: ToolContext,          // Execution context
    onProgress?: ProgressCallback, // Optional progress callback
    message?: Message,             // Related message
    options?: any                  // Additional options
  ): AsyncGenerator<
    | { type: 'progress', message: any }     // Progress updates
    | { type: 'result', data: TOutput, resultForAssistant: string }  // Final result
  >; 
  
  // UI rendering functions
  renderToolUseMessage(input: TInput, context: any): React.ReactNode; // Render tool usage
  renderToolResultMessage(result: TOutput): React.ReactNode;          // Render results
  renderToolUseRejectedMessage(input: TInput): React.ReactNode;       // Render rejection
  
  // Claude response formatter
  renderResultForAssistant(result: TOutput): string;                  // Format for Claude
}\n`;
  doc += "```\n\n";
  
  doc += `## ToolContext Object\n\n`;
  doc += `All tools receive a context object providing access to:\n\n`;
  
  doc += "```typescript\n";
  doc += `interface ToolContext {
  // Core execution context
  abortController: AbortController;  // For cancellation
  options: {                         // Configuration options
    verbose: boolean;                // Verbose output flag
    tools: Tool[];                   // Available tools
    isNonInteractiveSession: boolean;// Is this non-interactive?
    forkNumber: number;              // Session fork ID
    messageLogName: string;          // Log ID
  };
  
  // Helper functions
  getToolPermissionContext: () => PermissionContext; // Get permission context
  readFileTimestamps: () => Record<string, number>;  // File timestamps
  userProvidedUrls: string[];        // URLs provided by user
}\n`;
  doc += "```\n\n";
  
  doc += `## Implementation Patterns\n\n`;
  doc += `### Async Generator Pattern\n\n`;
  doc += `Tools use async generators to provide progress updates during execution:\n\n`;
  
  doc += "```typescript\n";
  doc += `async *call(input, context, onProgress) {
  // Initial state
  const startTime = Date.now();
  
  // Yield progress updates
  yield {
    type: 'progress',
    message: { content: "Starting operation..." }
  };
  
  // Perform actual work
  const result = await performOperation(input);
  
  // Calculate metrics
  const duration = Date.now() - startTime;
  
  // Yield final result
  yield {
    type: 'result',
    data: { ...result, duration },
    resultForAssistant: this.renderResultForAssistant(result)
  };
}\n`;
  doc += "```\n\n";
  
  fs.writeFileSync(interfacePath, doc);
  console.log(`Generated tool interface documentation at ${interfacePath}`);
}

// Generate BatchTool documentation
function generateBatchToolDoc() {
  const batchToolPath = path.join(OUTPUT_DIR, 'batch_tool.md');
  
  let doc = `# BatchTool / Call Tool\n\n`;
  doc += `This document provides an in-depth analysis of the BatchTool (user-facing name: "Call") implementation in Claude Code.\n\n`;
  
  doc += `## Overview\n\n`;
  doc += `The BatchTool, introduced in v0.2.45, enables parallel execution of multiple tool invocations in a single request. This significantly improves performance when multiple independent operations need to be performed, reducing both context usage and latency.\n\n`;
  
  doc += `## Implementation Details\n\n`;
  doc += `### Input Schema\n\n`;
  
  doc += "```typescript\n";
  doc += `const inputSchema = z.strictObject({
  description: z.string().describe('A short (3-5 word) description of the batch operation'),
  invocations: z.array(
    z.object({
      tool_name: z.string().describe('The name of the tool to invoke'),
      input: z.record(z.any()).describe('The input to pass to the tool')
    })
  ).describe('The list of tool invocations to execute')
});\n`;
  doc += "```\n\n";
  
  doc += `### Parallel Execution\n\n`;
  doc += `The tool processes multiple invocations in parallel using Promise.all():\n\n`;
  
  doc += "```typescript\n";
  doc += `async *call({ description, invocations }, context, onProgress, message) {
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
}\n`;
  doc += "```\n\n";
  
  doc += `### Result Formatting\n\n`;
  doc += `The tool formats results for Claude's consumption, handling both successful and failed invocations:\n\n`;
  
  doc += "```typescript\n";
  doc += `renderResultForAssistant({ results }) {
  const successResults = results.filter(r => r.success);
  const failureResults = results.filter(r => !r.success);
  
  if (failureResults.length === 0) {
    return "Successfully executed " + results.length + " tools.\\n\\n" + 
      successResults.map(r => r.tool_name + ": " + JSON.stringify(r.result)).join('\\n\\n');
  }
  
  return "Executed " + results.length + " tools with " + failureResults.length + " errors.\\n\\n" +
    successResults.map(r => "✅ " + r.tool_name + ": " + JSON.stringify(r.result)).join('\\n\\n') + '\\n\\n' +
    failureResults.map(r => "❌ " + r.tool_name + ": " + r.error).join('\\n\\n');
}\n`;
  doc += "```\n\n";
  
  doc += `## Key Benefits\n\n`;
  doc += `1. **Parallel Execution**: Significantly reduces latency when multiple independent operations are needed\n`;
  doc += `2. **Context Efficiency**: Reduces context usage by batching operations into a single tool call\n`;
  doc += `3. **Error Isolation**: Individual tool failures don't fail the entire batch operation\n`;
  doc += `4. **Permission Respect**: Each tool in a batch respects its own permissions and validation rules\n\n`;
  
  doc += `## Example Usage\n\n`;
  
  doc += "```json\n";
  doc += `{
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
}\n`;
  doc += "```\n";
  
  fs.writeFileSync(batchToolPath, doc);
  console.log(`Generated BatchTool documentation at ${batchToolPath}`);
}

// Generate main README
function generateMainReadme() {
  const readmePath = path.join(OUTPUT_DIR, 'README.md');
  
  let readme = `# Claude Code Evolution Analysis\n\n`;
  readme += `This directory contains a comprehensive analysis of Claude Code's evolution across versions, focusing on its tool system architecture and implementation patterns.\n\n`;
  
  readme += `## Documents\n\n`;
  readme += `1. **[Tool Evolution](./tool_evolution.md)** - A detailed timeline of tool presence across versions\n`;
  readme += `2. **[Tool Interface](./tool_interface.md)** - Analysis of the standard tool interface pattern\n`;
  readme += `3. **[BatchTool / Call](./batch_tool.md)** - Deep dive into the BatchTool implementation\n\n`;
  
  readme += `## Key Findings\n\n`;
  readme += `1. **Consistent Interface**: All tools follow a standardized interface with consistent patterns\n`;
  readme += `2. **Incremental Evolution**: New tools added without breaking existing functionality\n`;
  readme += `3. **Permission Model**: Tools implement a sophisticated permission system\n`;
  readme += `4. **Parallel Processing**: BatchTool enables concurrent execution of multiple tools\n\n`;
  
  readme += `## Feature Timeline\n\n`;
  readme += `| Version | Key Additions |\n`;
  readme += `|---------|---------------|\n`;
  
  for (const release of RELEASES) {
    const features = release.key_features.map(f => {
      const tool = TOOLS.find(t => t.name === f);
      return tool ? `${tool.name} (${tool.userFacingName})` : f;
    }).join(', ');
    
    if (features) {
      readme += `| ${release.version} | ${features} |\n`;
    }
  }
  
  fs.writeFileSync(readmePath, readme);
  console.log(`Generated main README at ${readmePath}`);
}

/**
 * Main function
 */
async function main() {
  console.log('Claude Code Evolution Analysis Tool');
  console.log('=================================');
  
  // Generate reports
  generateEvolutionReport();
  generateToolInterfaceDoc();
  generateBatchToolDoc();
  generateMainReadme();
  
  console.log('\nAnalysis complete!');
  console.log(`Results are available in ${OUTPUT_DIR}`);
}

// Run the program
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});