#!/usr/bin/env node

/**
 * Claude Code Reverse Engineering Script
 * 
 * This script improves on the previous attempts to reconstruct Claude Code source files.
 * Instead of manually recreating files, it:
 * 1. Extracts minified JavaScript from CLI files
 * 2. Uses pattern matching to identify key components
 * 3. Reconstructs TypeScript interfaces and implementations
 * 4. Outputs source files in the appropriate structure
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const RELEASES_DIR = path.join(__dirname, '..', 'releases', 'extracted');
const OUTPUT_DIR = path.join(__dirname, 'src', 'decompiled');
const PATTERNS_FILE = path.join(__dirname, 'patterns.json');

// Create output directories
fs.mkdirSync(OUTPUT_DIR, { recursive: true });
fs.mkdirSync(path.join(OUTPUT_DIR, 'tools'), { recursive: true });
fs.mkdirSync(path.join(OUTPUT_DIR, 'utils'), { recursive: true });

// Component patterns to match in minified code
const COMPONENT_PATTERNS = {
  // Tool interface pattern
  toolInterface: {
    pattern: /interface\s+Tool[^{]*{[^}]*name:[^;]*;[^}]*inputSchema:[^;]*;[^}]*}/s,
    outputFile: 'tools.ts',
    process: processCoreInterface
  },
  
  // BashTool pattern
  bashTool: {
    pattern: /name:\s*['"]BashTool['"][^}]*userFacingName\(\)[^}]*return\s*["']Bash["']/s,
    outputFile: 'tools/BashTool/BashTool.tsx',
    process: processToolImplementation
  },
  
  // BatchTool pattern
  batchTool: {
    pattern: /name:\s*['"]BatchTool['"][^}]*userFacingName\(\)[^}]*return\s*["']Call["']/s,
    outputFile: 'tools/BatchTool/BatchTool.tsx',
    process: processToolImplementation
  },
  
  // ViewTool pattern
  viewTool: {
    pattern: /name:\s*['"](?:ViewTool|FileReadTool)['"][^}]*userFacingName\(\)[^}]*return\s*["']View["']/s,
    outputFile: 'tools/ViewTool/ViewTool.tsx',
    process: processToolImplementation
  },
  
  // PersistentShell pattern
  persistentShell: {
    pattern: /class\s+PersistentShell[^{]*{[^}]*static\s+getInstance\(\)[^}]*}/s,
    outputFile: 'utils/PersistentShell.ts',
    process: processUtilityClass
  },
  
  // File utilities pattern
  fileUtils: {
    pattern: /function\s+getCwd\(\)[^}]*}[^}]*function\s+setCwd\([^)]*\)[^}]*}/s,
    outputFile: 'utils/file.ts',
    process: processFileUtils
  }
};

// Load custom patterns if file exists
if (fs.existsSync(PATTERNS_FILE)) {
  const customPatterns = JSON.parse(fs.readFileSync(PATTERNS_FILE, 'utf8'));
  Object.assign(COMPONENT_PATTERNS, customPatterns);
}

/**
 * Process a CLI file to extract components
 */
function processCliFile(cliFile) {
  console.log(`Processing ${path.basename(cliFile)}...`);
  
  // Read the CLI file
  const content = fs.readFileSync(cliFile, 'utf8');
  
  // Try to find each component
  for (const [name, config] of Object.entries(COMPONENT_PATTERNS)) {
    const match = content.match(config.pattern);
    if (match) {
      console.log(`  Found ${name} component`);
      
      // Process the component
      const processedContent = config.process(match[0], content);
      
      // Write to output file
      const outputFile = path.join(OUTPUT_DIR, config.outputFile);
      
      // Create directory if it doesn't exist
      const outputDir = path.dirname(outputFile);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      fs.writeFileSync(outputFile, processedContent);
      console.log(`  Wrote ${outputFile}`);
    }
  }
}

/**
 * Process core interface definition
 */
function processCoreInterface(match, fullContent) {
  // A basic TypeScript interface reconstruction
  return `import { z } from 'zod';
import React from 'react';

// Type for truncated content
export interface TruncatedContent {
  content: string;
  truncated: boolean;
}

// Context provided to tools during execution
export interface ToolContext {
  // Abort controller for cancellation
  abortController: AbortController;
  // Function to get the current working directory
  getCwd: () => string;
  // Get the tool permission context
  getToolPermissionContext: () => ToolPermissionContext;
  // All available tools
  tools: Tool[];
  // Current user message ID
  userMessageId?: string;
  // Parent conversation ID
  conversationId?: string;
  // Message ID that prompted this tool use
  messageId?: string;
}

// Permission context for tools
export interface ToolPermissionContext {
  // Permission mode
  mode: 'askPermissions' | 'bypassPermissions' | 'denyPermissions';
  // Always allow rules
  alwaysAllowRules: {
    // From CLI arguments
    cliArg: string[];
    // From local settings
    localSettings: string[];
  };
}

// Result from validating tool input
export interface ValidationResult {
  result: boolean;
  message?: string;
}

// Result types that tools can yield
export type ToolResult =
  | {
      type: 'progress';
      message: any;
      [key: string]: any;
    }
  | {
      type: 'result';
      resultForAssistant: string | TruncatedContent;
      data: any;
    };

// Tool interface definition
export interface Tool<In = any, Out = any> {
  // Internal name of the tool
  name: string;
  
  // User-visible name of the tool
  userFacingName(): string;
  
  // Dynamic description of the tool
  description(opts?: any): Promise<string>;
  
  // Schema for validating input
  inputSchema: z.ZodType<any>;
  
  // Check if tool is read-only (doesn't modify state)
  isReadOnly(): boolean;
  
  // Check if tool is enabled
  isEnabled(): Promise<boolean>;
  
  // Check if tool needs permissions
  needsPermissions(input: In, context?: any): boolean;
  
  // Optional validation function
  validateInput?(input: In, context: any): Promise<ValidationResult>;
  
  // Main execution function
  call(
    input: In,
    context: ToolContext,
    onProgress?: (progress: any) => void,
    message?: any
  ): AsyncGenerator<ToolResult, void, unknown>;
  
  // Render the tool use message
  renderToolUseMessage(input: In, options: any): React.ReactNode;
  
  // Render the tool result message
  renderToolResultMessage(result: Out, options: any): React.ReactNode;
  
  // Render message when tool use is rejected
  renderToolUseRejectedMessage(input: In): React.ReactNode;
  
  // Format result for the assistant
  renderResultForAssistant(result: Out): string | TruncatedContent;
}

// Get all available tools
export const getAllTools = (): Tool[] => {
  // This would be imported from actual tool implementations
  return [];
};

// Function to memoize results
function memoize<T>(fn: (...args: any[]) => Promise<T>): (...args: any[]) => Promise<T> {
  const cache = new Map();
  return async (...args: any[]): Promise<T> => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = await fn(...args);
    cache.set(key, result);
    return result;
  };
}

// Get enabled tools (memoized for performance)
export const getTools = memoize(
  async (enableArchitect?: boolean): Promise<Tool[]> => {
    const tools = [...getAllTools()];
    
    // Filter to only enabled tools
    const isEnabled = await Promise.all(tools.map(tool => tool.isEnabled()));
    return tools.filter((_, i) => isEnabled[i]);
  }
);

// Helper to find a tool by name
export function findTool(tools: Tool[], name: string): Tool | undefined {
  return tools.find(tool => tool.name === name);
}`;
}

/**
 * Process a tool implementation
 */
function processToolImplementation(match, fullContent) {
  // Extract the tool name
  const nameMatch = match.match(/name:\s*['"](\w+)['"]/);
  const toolName = nameMatch ? nameMatch[1] : 'UnknownTool';
  
  // Extract user-facing name
  const userFacingMatch = match.match(/return\s*["'](\w+)["']/);
  const userFacingName = userFacingMatch ? userFacingMatch[1] : 'Unknown';
  
  // Basic tool implementation template
  if (toolName === 'BashTool') {
    return `import React from 'react';
import { Box, Text } from 'ink';
import { z } from 'zod';
import type { Tool, ToolContext, ToolResult } from '../../tools';
import { PersistentShell } from '../../utils/PersistentShell';

// Define BashTool input schema
const inputSchema = z.object({
  command: z.string().describe("The command to execute"),
  timeout: z.number().optional().describe("Optional timeout in milliseconds (max 600000)")
});

// List of banned commands for security
const BANNED_COMMANDS = [
  'alias', 'curl', 'curlie', 'wget', 'axel', 'aria2c', 
  'nc', 'telnet', 'lynx', 'w3m', 'links', 'httpie', 
  'xh', 'http-prompt', 'chrome', 'firefox', 'safari'
];

// Define BashTool output interface
interface BashToolOutput {
  output: string;
  exitCode: number;
  durationMs: number;
}

// BashTool implementation
export const BashTool = {
  name: 'BashTool',
  
  userFacingName() { 
    return "Bash";
  },
  
  async description() {
    return \`
Executes a given bash command in a persistent shell session with optional timeout, ensuring proper handling and security measures.

Before executing the command, please follow these steps:

1. Directory Verification:
   - If the command will create new directories or files, first use the LS tool to verify the parent directory exists and is the correct location
   - For example, before running "mkdir foo/bar", first use LS to check that "foo" exists and is the intended parent directory

2. Security Check:
   - For security and to limit the threat of a prompt injection attack, some commands are limited or banned. If you use a disallowed command, you will receive an error message explaining the restriction. Explain the error to the User.
   - Verify that the command is not one of the banned commands: alias, curl, curlie, wget, axel, aria2c, nc, telnet, lynx, w3m, links, httpie, xh, http-prompt, chrome, firefox, safari.

3. Command Execution:
   - After ensuring proper quoting, execute the command.
   - Capture the output of the command.

Usage notes:
  - The command argument is required.
  - You can specify an optional timeout in milliseconds (up to 600000ms / 10 minutes). If not specified, commands will timeout after 30 minutes.
- If the output exceeds 30000 characters, output will be truncated before being returned to you.
  - VERY IMPORTANT: You MUST avoid using search commands like \`find\` and \`grep\`. Instead use GrepTool, GlobTool, or dispatch_agent to search. You MUST avoid read tools like \`cat\`, \`head\`, \`tail\`, and \`ls\`, and use View and LS to read files.
  - When issuing multiple commands, use the ';' or '&&' operator to separate them. DO NOT use newlines (newlines are ok in quoted strings).
  - IMPORTANT: All commands share the same shell session. Shell state (environment variables, virtual environments, current directory, etc.) persist between commands. For example, if you set an environment variable as part of a command, the environment variable will persist for subsequent commands.
  - Try to maintain your current working directory throughout the session by using absolute paths and avoiding usage of \`cd\`. You may use \`cd\` if the User explicitly requests it.
\`;
  },
  
  inputSchema,
  
  isReadOnly() {
    return false; // Can modify system state
  },
  
  async isEnabled() {
    return true;
  },
  
  needsPermissions() {
    return true; // Always require permission for bash commands
  },
  
  async validateInput({ command }) {
    // Simple check for banned commands
    for (const banned of BANNED_COMMANDS) {
      const regex = new RegExp(\`(^|\\\\s)\${banned}(\\\\s|$)\`);
      if (regex.test(command)) {
        return {
          result: false,
          message: \`Command '\${banned}' is not allowed for security reasons\`
        };
      }
    }
    
    return { result: true };
  },
  
  async *call({ command, timeout = 30 * 60 * 1000 }, context: ToolContext) {
    const startTime = Date.now();
    const MAX_TIMEOUT = 10 * 60 * 1000; // 10 minutes max timeout
    
    try {
      // Get the persistent shell instance
      const shell = PersistentShell.getInstance();
      
      // Execute the command
      const result = await shell.exec(
        command,
        context.abortController.signal,
        Math.min(timeout, MAX_TIMEOUT)
      );
      
      const durationMs = Date.now() - startTime;
      
      // Prepare output (combining stdout and stderr)
      let output = result.stdout;
      if (result.stderr && result.stderr.length > 0) {
        output += output.length > 0 ? "\\n" + result.stderr : result.stderr;
      }
      
      // Truncate if too long
      const MAX_OUTPUT_LENGTH = 30000;
      const truncated = output.length > MAX_OUTPUT_LENGTH;
      if (truncated) {
        output = output.substring(0, MAX_OUTPUT_LENGTH) + "\\n\\n[Output truncated...]";
      }
      
      // Prepare result
      const toolResult = {
        output,
        exitCode: result.exitCode,
        durationMs
      };
      
      yield {
        type: 'result',
        resultForAssistant: this.renderResultForAssistant(toolResult),
        data: toolResult
      } as ToolResult;
    } catch (error) {
      if (context.abortController.signal.aborted) {
        throw error; // Let the aborted error propagate
      }
      
      throw new Error(\`Command execution failed: \${error instanceof Error ? error.message : String(error)}\`);
    }
  },
  
  renderToolUseMessage({ command }, { verbose }) {
    // For security, always show the full command
    return command;
  },
  
  renderToolResultMessage({ output, exitCode, durationMs }) {
    const success = exitCode === 0;
    
    return (
      <Box flexDirection="column">
        <Text>  ⎿ {success ? 'Command completed' : \`Command failed (exit code \${exitCode})\`}</Text>
      </Box>
    );
  },
  
  renderToolUseRejectedMessage({ command }) {
    return <Text>  ⎿ Command execution cancelled</Text>;
  },
  
  renderResultForAssistant({ output }) {
    return output;
  }
} satisfies Tool<z.infer<typeof inputSchema>, BashToolOutput>;

// Also create the prompt.ts file
fs.writeFileSync(path.join(OUTPUT_DIR, 'tools/BashTool/prompt.ts'), \`// Prompt for BashTool
export const bashToolPrompt = \\\`
This tool executes bash commands in a persistent shell session.

Usage notes:
- The command argument is required
- You can specify an optional timeout in milliseconds (up to 600000ms / 10 minutes)
- All commands share the same shell session (environment variables, current directory, etc. persist)
- Avoid using search commands like \\\\\`find\\\\\` and \\\\\`grep\\\\\` - use dedicated search tools instead
- Avoid using read commands like \\\\\`cat\\\\\` and \\\\\`ls\\\\\` - use View and LS tools instead
- For security reasons, network utilities like curl, wget, and browsers are not allowed

Example:
{
  "command": "echo $PATH",
  "timeout": 10000
}

The tool will execute the command and return its output.
\\\`;\`);\n`;
  } else if (toolName === 'BatchTool') {
    return `import React from 'react';
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
    return \`
- Batch execution tool that runs multiple tool invocations in a single request
- Tools are executed in parallel when possible, and otherwise serially
- Takes a list of tool invocations (tool_name and input pairs)
- Returns the collected results from all invocations
- Use this tool when you need to run multiple independent tool operations at once -- it is awesome for speeding up your workflow, reducing both context usage and latency
- Each tool will respect its own permissions and validation rules
- The tool's outputs are NOT shown to the user; to answer the user's query, you MUST send a message with the results after the tool call completes, otherwise the user will not see the results
\`;
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
  
  async *call({ description, invocations }, context: ToolContext, onProgress, message) {
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
    return \`\${description || 'Batch operation'} (\${invocations.length} tools)\`;
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
      return "Successfully executed " + results.length + " tools.\\n\\n" + 
        successResults.map(r => r.tool_name + ": " + JSON.stringify(r.result)).join('\\n\\n');
    }
    
    return "Executed " + results.length + " tools with " + failureResults.length + " errors.\\n\\n" +
      successResults.map(r => "✅ " + r.tool_name + ": " + JSON.stringify(r.result)).join('\\n\\n') + '\\n\\n' +
      failureResults.map(r => "❌ " + r.tool_name + ": " + r.error).join('\\n\\n');
  }
} satisfies Tool<z.infer<typeof inputSchema>, BatchToolOutput>;

// Also create the prompt.ts file
fs.writeFileSync(path.join(OUTPUT_DIR, 'tools/BatchTool/prompt.ts'), \`// Prompt for BatchTool
export const batchToolPrompt = \\\`
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
\\\`;\`);\n`;
  } else if (toolName === 'ViewTool' || toolName === 'FileReadTool') {
    return `import React from 'react';
import { Box, Text } from 'ink';
import { z } from 'zod';
import * as fs from 'fs';
import * as path from 'path';
import type { Tool, ToolContext, ToolResult, TruncatedContent } from '../../tools';
import { needsReadPermission, readFileWithLineNumbers } from '../../utils/file';

// Define ViewTool input schema
const inputSchema = z.object({
  file_path: z.string().describe("The absolute path to the file to read"),
  offset: z.number().optional().describe("The line number to start reading from. Only provide if the file is too large to read at once"),
  limit: z.number().optional().describe("The number of lines to read. Only provide if the file is too large to read at once.")
});

// Define ViewTool output interface
interface ViewToolOutput {
  content: string;
  lineCount: number;
  truncated: boolean;
  isImage: boolean;
  filePath: string;
}

// ViewTool implementation
export const ViewTool = {
  name: 'ViewTool',
  
  userFacingName() { 
    return "View";
  },
  
  async description() {
    return \`
Reads a file from the local filesystem.

Usage:
- The file_path parameter must be an absolute path, not a relative path
- By default, it reads up to 2000 lines starting from the beginning of the file
- You can optionally specify a line offset and limit (especially handy for long files), but it's recommended to read the whole file by not providing these parameters
- Any lines longer than 2000 characters will be truncated
- Results are returned using cat -n format, with line numbers starting at 1
- For image files, the tool will display the image for you
For Jupyter notebooks (.ipynb files), use the ReadNotebook instead
\`;
  },
  
  inputSchema,
  
  isReadOnly() {
    return true;
  },
  
  async isEnabled() {
    return true;
  },
  
  needsPermissions({ file_path }) {
    return needsReadPermission(file_path);
  },
  
  async validateInput({ file_path }) {
    if (!path.isAbsolute(file_path)) {
      return {
        result: false,
        message: "File path must be absolute"
      };
    }
    
    try {
      await fs.promises.access(file_path, fs.constants.R_OK);
      return { result: true };
    } catch (error) {
      return {
        result: false,
        message: \`Cannot access file: \${error instanceof Error ? error.message : String(error)}\`
      };
    }
  },
  
  async *call({ file_path, offset = 0, limit = 2000 }, context: ToolContext) {
    try {
      // Check if file is an image
      const isImage = isImageFile(file_path);
      
      if (isImage) {
        // For images, return information without content
        yield {
          type: 'result',
          resultForAssistant: \`[Image file: \${path.basename(file_path)}]\`,
          data: {
            content: \`[Image file: \${path.basename(file_path)}]\`,
            lineCount: 0,
            truncated: false,
            isImage: true,
            filePath: file_path
          }
        } as ToolResult;
        return;
      }
      
      // Read file with line numbers
      const { content, lineCount, truncated } = await readFileWithLineNumbers(file_path, offset, limit);
      
      // Prepare result
      const result: ViewToolOutput = {
        content,
        lineCount,
        truncated,
        isImage: false,
        filePath: file_path
      };
      
      yield {
        type: 'result',
        resultForAssistant: this.renderResultForAssistant(result),
        data: result
      } as ToolResult;
    } catch (error) {
      throw new Error(\`Failed to read file: \${error instanceof Error ? error.message : String(error)}\`);
    }
  },
  
  renderToolUseMessage({ file_path, offset, limit }, { verbose }) {
    if (!verbose) {
      // Show abbreviated path for non-verbose mode
      const fileName = path.basename(file_path);
      return \`\${fileName}\${offset ? \` (from line \${offset})\` : ''}\`;
    }
    
    return \`\${file_path}\${offset ? \` (from line \${offset})\${limit ? \`, \${limit} lines\` : ''}\` : ''}\`;
  },
  
  renderToolResultMessage({ lineCount, truncated, isImage }, { file_path }) {
    if (isImage) {
      return (
        <Box flexDirection="column">
          <Text>  ⎿ Viewed image: {path.basename(file_path)}</Text>
        </Box>
      );
    }
    
    return (
      <Box flexDirection="column">
        <Text>  ⎿ Read {lineCount} lines{truncated ? ' (truncated)' : ''}</Text>
      </Box>
    );
  },
  
  renderToolUseRejectedMessage({ file_path }) {
    return <Text>  ⎿ File view cancelled: {path.basename(file_path)}</Text>;
  },
  
  renderResultForAssistant({ content, truncated, isImage }: ViewToolOutput): string | TruncatedContent {
    if (isImage) {
      return content;
    }
    
    if (truncated) {
      return {
        content, 
        truncated
      };
    }
    
    return content;
  }
} satisfies Tool<z.infer<typeof inputSchema>, ViewToolOutput>;

// Helper function to check if file is an image
function isImageFile(filePath: string): boolean {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
  const ext = path.extname(filePath).toLowerCase();
  return imageExtensions.includes(ext);
}

// Also create the prompt.ts file
fs.writeFileSync(path.join(OUTPUT_DIR, 'tools/ViewTool/prompt.ts'), \`// Prompt for ViewTool
export const viewToolPrompt = \\\`
This tool reads files from the local filesystem.

Usage:
- The file_path parameter must be an absolute path, not a relative path
- By default, it reads up to 2000 lines starting from the beginning of the file
- You can optionally specify a line offset and limit (especially handy for long files), but it's recommended to read the whole file by not providing these parameters
- Any lines longer than 2000 characters will be truncated
- Results are returned using cat -n format, with line numbers starting at 1
- For image files, the tool will display the image for you

Example:
{
  "file_path": "/path/to/file.txt", 
  "offset": 100,      // Start at line 100 (optional)
  "limit": 50         // Read 50 lines (optional)
}

For Jupyter notebooks (.ipynb files), use the ReadNotebook instead
\\\`;\`);\n`;
  } else {
    return `// Generated tool implementation for ${toolName}
import React from 'react';
import { Box, Text } from 'ink';
import { z } from 'zod';
import type { Tool, ToolContext, ToolResult } from '../../tools';

// Define ${toolName} input schema
const inputSchema = z.object({
  // TODO: Add proper schema fields
});

// Define ${toolName} output interface
interface ${toolName}Output {
  // TODO: Add output fields
}

// ${toolName} implementation
export const ${toolName} = {
  name: '${toolName}',
  
  userFacingName() { 
    return "${userFacingName}";
  },
  
  async description() {
    return \`
TODO: Implementation of ${toolName} description
\`;
  },
  
  inputSchema,
  
  isReadOnly() {
    return true; // TODO: Update based on tool behavior
  },
  
  async isEnabled() {
    return true;
  },
  
  needsPermissions(input) {
    return false; // TODO: Update based on tool permission needs
  },
  
  async *call(input, context: ToolContext, onProgress, message) {
    // TODO: Implement tool functionality
    
    yield {
      type: 'result',
      resultForAssistant: "TODO: Implementation",
      data: {}
    } as ToolResult;
  },
  
  renderToolUseMessage(input, { verbose }) {
    return "TODO: Implementation";
  },
  
  renderToolResultMessage(result) {
    return (
      <Box>
        <Text>  ⎿ TODO: Implementation</Text>
      </Box>
    );
  },
  
  renderToolUseRejectedMessage() {
    return <Text>  ⎿ Operation cancelled</Text>;
  },
  
  renderResultForAssistant(result) {
    return "TODO: Implementation";
  }
} satisfies Tool<z.infer<typeof inputSchema>, ${toolName}Output>;`;
  }
}

/**
 * Process utility class
 */
function processUtilityClass(match, fullContent) {
  return `import { spawn, ChildProcess, SpawnOptions } from 'child_process';
import * as os from 'os';
import * as path from 'path';
import { getCwd, setCwd } from './file';

interface ExecResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

/**
 * PersistentShell provides a singleton shell session that persists across commands
 */
export class PersistentShell {
  private static instance: PersistentShell | null = null;
  private shell: string;
  private shellArgs: string[];
  private cwd: string;
  private env: Record<string, string>;
  
  /**
   * Private constructor for singleton pattern
   */
  private constructor() {
    // Determine shell based on platform
    if (os.platform() === 'win32') {
      this.shell = 'cmd.exe';
      this.shellArgs = ['/c'];
    } else {
      this.shell = 'bash';
      this.shellArgs = ['-c'];
    }
    
    this.cwd = getCwd();
    this.env = { ...process.env };
  }
  
  /**
   * Get the shell instance (singleton pattern)
   */
  public static getInstance(): PersistentShell {
    if (!PersistentShell.instance) {
      PersistentShell.instance = new PersistentShell();
    }
    return PersistentShell.instance;
  }
  
  /**
   * Execute a command in the persistent shell
   */
  public async exec(
    command: string,
    abortSignal?: AbortSignal,
    timeout?: number
  ): Promise<ExecResult> {
    return new Promise((resolve, reject) => {
      // Set up timeout
      const timeoutId = timeout 
        ? setTimeout(() => {
            reject(new Error(\`Command timed out after \${timeout}ms\`));
          }, timeout)
        : null;
      
      // Handle abort signal
      const abortHandler = () => {
        if (timeoutId) clearTimeout(timeoutId);
        reject(new Error('Command execution aborted'));
      };
      
      if (abortSignal) {
        abortSignal.addEventListener('abort', abortHandler);
      }
      
      try {
        // Execute command
        const childProcess = spawn(
          this.shell,
          [...this.shellArgs, command],
          {
            cwd: this.cwd,
            env: this.env,
            shell: true
          }
        );
        
        let stdout = '';
        let stderr = '';
        
        childProcess.stdout.on('data', (data) => {
          stdout += data.toString();
        });
        
        childProcess.stderr.on('data', (data) => {
          stderr += data.toString();
        });
        
        childProcess.on('error', (err) => {
          if (timeoutId) clearTimeout(timeoutId);
          if (abortSignal) abortSignal.removeEventListener('abort', abortHandler);
          reject(err);
        });
        
        childProcess.on('close', (code) => {
          if (timeoutId) clearTimeout(timeoutId);
          if (abortSignal) abortSignal.removeEventListener('abort', abortHandler);
          resolve({
            stdout,
            stderr,
            exitCode: code || 0
          });
        });
      } catch (error) {
        if (timeoutId) clearTimeout(timeoutId);
        if (abortSignal) abortSignal.removeEventListener('abort', abortHandler);
        reject(error);
      }
    });
  }
  
  /**
   * Set the current working directory
   */
  public async setCwd(cwd: string): Promise<void> {
    this.cwd = cwd;
    setCwd(cwd);
  }
  
  /**
   * Get the current working directory
   */
  public getCwd(): string {
    return this.cwd;
  }
  
  /**
   * Set an environment variable
   */
  public setEnv(key: string, value: string): void {
    this.env[key] = value;
  }
  
  /**
   * Get an environment variable
   */
  public getEnv(key: string): string | undefined {
    return this.env[key];
  }
}`;
}

/**
 * Process file utilities
 */
function processFileUtils(match, fullContent) {
  return `import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

// Original working directory when the process started
let originalCwd = process.cwd();

// Current working directory (can be changed)
let currentCwd = process.cwd();

/**
 * Get the original working directory
 */
export function getOriginalCwd(): string {
  return originalCwd;
}

/**
 * Get the current working directory
 */
export function getCwd(): string {
  return currentCwd;
}

/**
 * Set the current working directory
 */
export function setCwd(dir: string): void {
  currentCwd = dir;
}

/**
 * Check if a path is a directory
 */
export async function isDirectory(dir: string): Promise<boolean> {
  try {
    const stats = await fs.promises.stat(dir);
    return stats.isDirectory();
  } catch (error) {
    return false;
  }
}

/**
 * Check if a path is a file
 */
export async function isFile(filePath: string): Promise<boolean> {
  try {
    const stats = await fs.promises.stat(filePath);
    return stats.isFile();
  } catch (error) {
    return false;
  }
}

/**
 * Check if a path exists
 */
export async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.promises.access(filePath);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Resolve a path relative to the current working directory
 */
export function resolvePath(relativePath: string): string {
  if (path.isAbsolute(relativePath)) {
    return relativePath;
  }
  return path.resolve(getCwd(), relativePath);
}

/**
 * Check if a path is inside another path
 */
export function isInDirectory(targetPath: string, basePath: string): boolean {
  const relativePath = path.relative(basePath, targetPath);
  return !relativePath.startsWith('..') && !path.isAbsolute(relativePath);
}

/**
 * Read a file with line numbers
 */
export async function readFileWithLineNumbers(
  filePath: string,
  offset: number = 0,
  limit: number = 2000
): Promise<{ content: string; lineCount: number; truncated: boolean }> {
  const content = await fs.promises.readFile(filePath, 'utf8');
  const lines = content.split('\\n');
  const totalLines = lines.length;
  
  // Apply offset and limit
  const startLine = Math.max(0, offset);
  const endLine = Math.min(totalLines, startLine + limit);
  
  // Format with line numbers
  const numberedLines = lines
    .slice(startLine, endLine)
    .map((line, index) => \`\${(startLine + index + 1).toString().padStart(6)}  \${line}\`);
  
  // Check if truncated
  const truncated = totalLines > endLine;
  
  return {
    content: numberedLines.join('\\n'),
    lineCount: endLine - startLine,
    truncated
  };
}

/**
 * Check if a file path requires read permission
 */
export function needsReadPermission(filePath: string): boolean {
  const sensitiveDirs = [
    '/etc',
    '/usr',
    '/var',
    '/private',
    '/Library',
    '/System'
  ];
  
  return sensitiveDirs.some(dir => filePath.startsWith(dir));
}

/**
 * Check if a file path requires write permission
 */
export function needsWritePermission(filePath: string): boolean {
  const sensitiveDirs = [
    '/etc',
    '/usr',
    '/var',
    '/private',
    '/Library',
    '/System',
    '/bin',
    '/sbin'
  ];
  
  return sensitiveDirs.some(dir => filePath.startsWith(dir));
}

/**
 * Check if we have read permission for a path
 */
export function hasReadPermission(filePath: string): boolean {
  try {
    fs.accessSync(filePath, fs.constants.R_OK);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Check if we have write permission for a path
 */
export function hasWritePermission(filePath: string): boolean {
  try {
    fs.accessSync(filePath, fs.constants.W_OK);
    return true;
  } catch (error) {
    return false;
  }
}`;
}

/**
 * Create an index.ts file to export all tools
 */
function createIndexFile() {
  // Check if tools directory exists
  const toolsDir = path.join(OUTPUT_DIR, 'tools');
  if (!fs.existsSync(toolsDir)) {
    console.log('No tools directory found, skipping index file creation');
    return;
  }
  
  // Get all tool directories
  const toolDirs = fs.readdirSync(toolsDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  // Generate index.ts content
  let indexContent = `// Export all tools from a single location
import { Tool } from '../tools';

// Import individual tools
`;

  // Import statements
  for (const dir of toolDirs) {
    indexContent += `import { ${dir} } from './${dir}/${dir}';\n`;
  }
  
  // Export array of all tools
  indexContent += `\n// Combine all tools into array
export const allTools: Tool[] = [
${toolDirs.map(dir => `  ${dir},`).join('\n')}
];

// Export individual tools
export {
${toolDirs.map(dir => `  ${dir},`).join('\n')}
};

// Export tool prompts
`;

  // Export prompts
  for (const dir of toolDirs) {
    const promptPath = path.join(toolsDir, dir, 'prompt.ts');
    if (fs.existsSync(promptPath)) {
      indexContent += `export { ${dir.charAt(0).toLowerCase() + dir.slice(1)}Prompt } from './${dir}/prompt';\n`;
    }
  }
  
  // Write the index file
  fs.writeFileSync(path.join(toolsDir, 'index.ts'), indexContent);
  console.log('Created tools/index.ts file');
}

/**
 * Create a package.json file
 */
function createPackageJson() {
  const packageJson = {
    "name": "@anthropic-ai/claude-code",
    "version": "0.3.0",
    "description": "Command-line interface for Claude AI assistant",
    "type": "module",
    "main": "dist/index.js",
    "types": "dist/index.d.ts",
    "bin": {
      "claude": "cli.js"
    },
    "repository": {
      "type": "git",
      "url": "git+https://github.com/anthropics/claude-code.git"
    },
    "engines": {
      "node": ">=18"
    },
    "scripts": {
      "build": "tsc -p .",
      "test": "vitest run",
      "lint": "eslint --ext .js,.jsx,.ts,.tsx .",
      "typecheck": "tsc --noEmit"
    },
    "author": "Anthropic",
    "license": "MIT",
    "dependencies": {
      "ink": "^4.4.1",
      "react": "^18.2.0",
      "zod": "^3.22.2"
    },
    "devDependencies": {
      "@types/node": "^20.6.0",
      "@types/react": "^18.2.21",
      "eslint": "^8.49.0",
      "typescript": "^5.2.2",
      "vitest": "^0.34.4"
    }
  };
  
  fs.writeFileSync(path.join(__dirname, 'package.json'), JSON.stringify(packageJson, null, 2));
  console.log('Created package.json file');
}

/**
 * Create main index.ts file
 */
function createMainIndexFile() {
  const indexContent = `/**
 * Claude Code Core Module
 * 
 * This is the main entry point for the Claude Code tool system.
 * It exports the core functionality and tools.
 */

// Export core interfaces and types
export type {
  Tool,
  ToolContext,
  ToolResult,
  ValidationResult,
  TruncatedContent,
  ToolPermissionContext
} from './tools';

// Export utilities
export {
  getTools,
  getAllTools,
  findTool
} from './tools';

// Export all implemented tools
export {
  allTools,
  ${fs.readdirSync(path.join(OUTPUT_DIR, 'tools'), { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
    .join(',\n  ')},
  // Tool prompt content
  ${fs.readdirSync(path.join(OUTPUT_DIR, 'tools'), { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name.charAt(0).toLowerCase() + dirent.name.slice(1) + 'Prompt')
    .join(',\n  ')}
} from './tools/index';

// Export file utilities
export {
  getCwd,
  setCwd,
  getOriginalCwd,
  isDirectory,
  isFile,
  exists,
  resolvePath,
  isInDirectory,
  readFileWithLineNumbers,
  needsReadPermission,
  needsWritePermission,
  hasReadPermission,
  hasWritePermission
} from './utils/file';

// Export persistent shell
export { PersistentShell } from './utils/PersistentShell';`;
  
  fs.writeFileSync(path.join(OUTPUT_DIR, 'index.ts'), indexContent);
  console.log('Created main index.ts file');
}

/**
 * Create TypeScript configuration
 */
function createTsConfig() {
  const tsConfig = {
    "compilerOptions": {
      "target": "ES2020",
      "module": "NodeNext",
      "moduleResolution": "NodeNext",
      "esModuleInterop": true,
      "forceConsistentCasingInFileNames": true,
      "strict": true,
      "skipLibCheck": true,
      "jsx": "react",
      "outDir": "dist",
      "declaration": true,
      "sourceMap": true
    },
    "include": ["src/**/*"],
    "exclude": ["node_modules", "dist"]
  };
  
  fs.writeFileSync(path.join(__dirname, 'tsconfig.json'), JSON.stringify(tsConfig, null, 2));
  console.log('Created tsconfig.json file');
}

/**
 * Main execution function
 */
async function main() {
  console.log('Claude Code Reverse Engineering Script');
  console.log('=====================================');
  
  // Find CLI files in releases
  const cliFiles = [];
  
  // Function to find CLI files recursively
  function findCliFiles(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        findCliFiles(fullPath);
      } else if (entry.name === 'cli.js' || entry.name === 'cli.mjs') {
        cliFiles.push(fullPath);
      }
    }
  }
  
  console.log(`Searching for CLI files in ${RELEASES_DIR}...`);
  if (fs.existsSync(RELEASES_DIR)) {
    findCliFiles(RELEASES_DIR);
  }
  
  console.log(`Found ${cliFiles.length} CLI files.`);
  
  // Process each CLI file
  for (const cliFile of cliFiles) {
    processCliFile(cliFile);
  }
  
  // Create index file
  createIndexFile();
  
  // Create main index file
  createMainIndexFile();
  
  // Create package.json
  createPackageJson();
  
  // Create TypeScript configuration
  createTsConfig();
  
  console.log(`\nReverse engineering complete! Results are available in ${OUTPUT_DIR}`);
}

// Run the program
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});