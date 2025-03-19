#!/usr/bin/env node

/**
 * Claude Code Release Reconstructor
 * 
 * This script analyzes the Claude Code releases and reconstructs the 
 * implementation of features added in each version, creating a directory
 * structure that shows the evolution of the codebase.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Constants
const RELEASES_DIR = path.join(__dirname, 'releases', 'extracted');
const OUTPUT_DIR = path.join(__dirname, 'reconstructed_releases');
const TOOLS_DIR = path.join(OUTPUT_DIR, 'tools');

// Release information with key features
const RELEASES = [
  {
    version: '0.2.9',
    key_features: [
      {
        name: 'AgentTool',
        user_facing_name: 'Task',
        files: ['AgentTool/AgentTool.tsx', 'AgentTool/prompt.ts']
      },
      {
        name: 'FileReadTool',
        user_facing_name: 'Read',
        files: ['FileReadTool/FileReadTool.tsx', 'FileReadTool/prompt.ts']
      },
      {
        name: 'BashTool',
        user_facing_name: 'Bash',
        files: ['BashTool/BashTool.tsx', 'BashTool/prompt.ts', 'BashTool/utils.ts']
      }
    ]
  },
  {
    version: '0.2.18',
    key_features: [
      {
        name: 'ViewTool', // Renamed from FileReadTool
        user_facing_name: 'View',
        files: ['ViewTool/ViewTool.tsx', 'ViewTool/prompt.ts']
      },
      {
        name: 'GlobTool',
        user_facing_name: 'Glob',
        files: ['GlobTool/GlobTool.tsx', 'GlobTool/prompt.ts']
      },
      {
        name: 'GrepTool',
        user_facing_name: 'Grep',
        files: ['GrepTool/GrepTool.tsx', 'GrepTool/prompt.ts']
      }
    ]
  },
  {
    version: '0.2.35',
    key_features: [
      {
        name: 'WebFetch',
        user_facing_name: 'Web Fetch',
        files: ['WebFetch/WebFetch.tsx', 'WebFetch/prompt.ts']
      }
    ]
  },
  {
    version: '0.2.44',
    key_features: [
      {
        name: 'ThinkTool',
        user_facing_name: 'Think',
        files: ['ThinkTool/ThinkTool.tsx', 'ThinkTool/prompt.ts']
      }
    ]
  },
  {
    version: '0.2.45',
    key_features: [
      {
        name: 'BatchTool',
        user_facing_name: 'Call',
        files: ['BatchTool/BatchTool.tsx', 'BatchTool/prompt.ts']
      }
    ]
  },
  {
    version: '0.2.49',
    key_features: [] // No major tool additions, but includes MCP server scope renaming
  }
];

// Tool implementation templates
const TOOL_TEMPLATES = {
  // AgentTool template (Task tool)
  'AgentTool/AgentTool.tsx': `import React from 'react';
import { Box, Text } from 'ink';
import { z } from 'zod';
import { Tool } from '../../tools';

// Input schema for AgentTool
const inputSchema = z.object({
  prompt: z.string().describe("The task for the agent to perform")
});

// Output interface
interface AgentToolOutput {
  responses: string[];
  toolUseCount: number;
  durationMs: number;
}

// AgentTool implementation
export const AgentTool = {
  name: 'AgentTool',
  
  userFacingName() { 
    return "Task";
  },
  
  async description() {
    return \`
- Launch a new agent that has access to the following tools: View, GlobTool, GrepTool, LS, ReadNotebook
- When you are searching for a keyword or file and are not confident that you will find the right match in the first few tries, use the Agent tool to perform the search for you

When to use the Agent tool:
- If you are searching for a keyword like "config" or "logger", or for questions like "which file does X?", the Agent tool is strongly recommended

When NOT to use the Agent tool:
- If you want to read a specific file path, use the View or GlobTool tool instead of the Agent tool, to find the match more quickly
- If you are searching for a specific class definition like "class Foo", use the GlobTool tool instead, to find the match more quickly
- If you are searching for code within a specific file or set of 2-3 files, use the View tool instead of the Agent tool, to find the match more quickly
\`;
  },
  
  inputSchema,
  
  isReadOnly() {
    return true;
  },
  
  async isEnabled() {
    return true;
  },
  
  needsPermissions() {
    return false;
  },
  
  async *call({ prompt }, context, onProgress, message) {
    const startTime = Date.now();
    
    // Initialize the agent
    yield {
      type: 'progress',
      message: {
        type: 'assistant',
        message: {
          role: 'assistant',
          content: [{ type: 'text', text: 'Initializing…' }]
        }
      }
    };
    
    // Get all available tools for the agent
    const tools = await getAgentTools();
    let toolUseCount = 0;
    
    // Create conversations for the agent
    const conversations = [{ content: prompt }];
    
    // Execute the agent with tools
    for await (let result of executeAgent(conversations, tools, context)) {
      if (result.type !== 'assistant') continue;
      
      // Track tool usage
      for (const content of result.message.content) {
        if (content.type === 'tool_use') toolUseCount++;
      }
      
      // Update progress
      yield {
        type: 'progress',
        message: result,
        normalizedMessages: conversations,
        tools: tools,
        parentMessageID: message.message.id,
        isResolved: false
      };
    }
    
    // Calculate duration
    const durationMs = Date.now() - startTime;
    
    // Prepare final result
    const finalMessage = getLastMessage(conversations);
    if (!finalMessage || finalMessage.type !== 'assistant') {
      throw new Error("Agent did not return a response");
    }
    
    // Extract text responses from the final message
    const responses = finalMessage.message.content
      .filter(content => content.type === 'text')
      .map(content => content.text);
    
    // Return final result
    yield {
      type: 'result',
      resultForAssistant: responses.join('\\n\\n'),
      data: {
        responses,
        toolUseCount,
        durationMs
      }
    };
  },
  
  renderToolUseMessage({ prompt }, { verbose }) {
    // Truncate long prompts
    const lines = prompt.split('\\n');
    return verbose || lines.length <= 1 ? prompt : lines[0] + '…';
  },
  
  renderToolResultMessage() {
    return (
      <Box flexDirection="column">
        <Text>  ⎿ Task complete</Text>
      </Box>
    );
  },
  
  renderToolUseRejectedMessage() {
    return <Text>  ⎿ Task cancelled</Text>;
  },
  
  renderResultForAssistant(result) {
    return result.responses.join('\\n\\n');
  }
} satisfies Tool<typeof inputSchema, AgentToolOutput>;

// Helper functions (simplified for reconstruction)
async function getAgentTools() {
  // In a real implementation, this would filter available tools for the agent
  return []; // Simplified for reconstruction
}

async function* executeAgent(conversations, tools, context) {
  // Simplified implementation for reconstruction
  yield {
    type: 'assistant',
    message: {
      role: 'assistant',
      content: [{ type: 'text', text: 'Task completed successfully.' }]
    }
  };
}

function getLastMessage(conversations) {
  // Return the last message in the conversation
  return conversations[conversations.length - 1];
}`,

  'AgentTool/prompt.ts': `
// Prompt for AgentTool
export const agentToolPrompt = \`
This tool allows you to launch a new agent that can perform complex tasks using a suite of tools.

The agent has access to file search and reading capabilities, and can help with tasks like:
- Finding specific code patterns across multiple files
- Locating configuration settings
- Exploring unfamiliar codebases
- Answering questions about code structure

When to use this tool:
- For exploratory tasks where you need multiple search steps
- When looking for code patterns across many files
- When you need to chain multiple operations together

Example:
{
  "prompt": "Find all configuration files in the project and identify settings related to logging"
}

The agent will work autonomously on the task and return its findings to you.
\`
`;

  // FileReadTool template (early version of View)
  'FileReadTool/FileReadTool.tsx': `import React from 'react';
import { Box, Text } from 'ink';
import { z } from 'zod';
import { Tool } from '../../tools';
import * as fs from 'fs';
import * as path from 'path';

// Input schema for FileReadTool
const inputSchema = z.object({
  file_path: z.string().describe("The absolute path to the file to read"),
  offset: z.number().optional().describe("The line number to start reading from"),
  limit: z.number().optional().describe("The number of lines to read")
});

// Output interface
interface FileReadToolOutput {
  content: string;
  lineCount: number;
  truncated: boolean;
}

// FileReadTool implementation
export const FileReadTool = {
  name: 'FileReadTool',
  
  userFacingName() { 
    return "Read";
  },
  
  async description() {
    return \`
- Reads a file from the local filesystem
- Returns the file content with line numbers
- Can limit reading to specific line ranges
- Works with text files of any format
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
    // Check if the file path requires permission
    return isSensitivePath(file_path);
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
        message: \`Cannot access file: \${error.message}\`
      };
    }
  },
  
  async *call({ file_path, offset = 0, limit = 2000 }, context) {
    try {
      // Read file
      const content = await fs.promises.readFile(file_path, 'utf8');
      
      // Split into lines
      const lines = content.split('\\n');
      const totalLines = lines.length;
      
      // Apply offset and limit
      const startLine = Math.max(0, offset);
      const endLine = Math.min(totalLines, startLine + limit);
      
      // Format with line numbers
      const numberedLines = lines
        .slice(startLine, endLine)
        .map((line, index) => \`\${startLine + index + 1}|\${line}\`);
      
      // Check if truncated
      const truncated = totalLines > endLine;
      
      // Prepare result
      const result = {
        content: numberedLines.join('\\n'),
        lineCount: endLine - startLine,
        truncated
      };
      
      yield {
        type: 'result',
        resultForAssistant: this.renderResultForAssistant(result),
        data: result
      };
    } catch (error) {
      throw new Error(\`Failed to read file: \${error.message}\`);
    }
  },
  
  renderToolUseMessage({ file_path, offset, limit }, { verbose }) {
    if (!verbose) {
      // Show abbreviated path for non-verbose mode
      const fileName = path.basename(file_path);
      return \`\${fileName}\${offset ? \` (from line \${offset})\` : ''}\`;
    }
    
    return \`\${file_path}\${offset ? \` (from line \${offset})\${limit ? \`, \${limit} lines\` : ''})\` : ''}\`;
  },
  
  renderToolResultMessage({ lineCount, truncated }, { file_path }) {
    return (
      <Box flexDirection="column">
        <Text>  ⎿ Read {lineCount} lines{truncated ? ' (truncated)' : ''}</Text>
      </Box>
    );
  },
  
  renderToolUseRejectedMessage({ file_path }) {
    return <Text>  ⎿ File read cancelled: {path.basename(file_path)}</Text>;
  },
  
  renderResultForAssistant({ content, truncated }) {
    return truncated 
      ? \`\${content}\\n\\n[File truncated, showing first \${content.split('\\n').length} lines]\` 
      : content;
  }
} satisfies Tool<typeof inputSchema, FileReadToolOutput>;

// Helper function to check if a path is sensitive
function isSensitivePath(filePath) {
  const sensitiveDirectories = [
    '/etc',
    '/usr',
    '/var',
    '/home',
    '/private'
  ];
  
  return sensitiveDirectories.some(dir => filePath.startsWith(dir));
}`,

  'FileReadTool/prompt.ts': `
// Prompt for FileReadTool
export const fileReadToolPrompt = \`
This tool reads files from the local filesystem.

Usage:
- The file_path parameter must be an absolute path, not a relative path
- By default, it reads up to 2000 lines starting from the beginning of the file
- You can optionally specify a line offset and limit (especially handy for long files)
- Results are returned with line numbers for easy reference

Example:
{
  "file_path": "/path/to/file.txt", 
  "offset": 100,      // Start at line 100 (optional)
  "limit": 50         // Read 50 lines (optional)
}

For image files, the tool will not display the content, but will return information about the file.
\`
`,

  // ViewTool template (renamed from FileReadTool)
  'ViewTool/ViewTool.tsx': `import React from 'react';
import { Box, Text } from 'ink';
import { z } from 'zod';
import { Tool } from '../../tools';
import * as fs from 'fs';
import * as path from 'path';

// Input schema for ViewTool
const inputSchema = z.object({
  file_path: z.string().describe("The absolute path to the file to read"),
  offset: z.number().optional().describe("The line number to start reading from. Only provide if the file is too large to read at once"),
  limit: z.number().optional().describe("The number of lines to read. Only provide if the file is too large to read at once.")
});

// Output interface
interface ViewToolOutput {
  content: string;
  lineCount: number;
  truncated: boolean;
  isImage: boolean;
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
    // Check if the file path requires permission
    return isSensitivePath(file_path);
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
        message: \`Cannot access file: \${error.message}\`
      };
    }
  },
  
  async *call({ file_path, offset = 0, limit = 2000 }, context) {
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
            isImage: true
          }
        };
        return;
      }
      
      // Read file
      const content = await fs.promises.readFile(file_path, 'utf8');
      
      // Split into lines
      const lines = content.split('\\n');
      const totalLines = lines.length;
      
      // Apply offset and limit
      const startLine = Math.max(0, offset);
      const endLine = Math.min(totalLines, startLine + limit);
      
      // Format with line numbers (cat -n style)
      const numberedLines = lines
        .slice(startLine, endLine)
        .map((line, index) => {
          const lineNum = startLine + index + 1;
          // Ensure line numbers are padded and aligned
          return \`\${lineNum.toString().padStart(6)}  \${truncateLine(line)}\`;
        });
      
      // Check if truncated
      const truncated = totalLines > endLine;
      
      // Prepare result
      const result = {
        content: numberedLines.join('\\n'),
        lineCount: endLine - startLine,
        truncated,
        isImage: false
      };
      
      yield {
        type: 'result',
        resultForAssistant: this.renderResultForAssistant(result),
        data: result
      };
    } catch (error) {
      throw new Error(\`Failed to read file: \${error.message}\`);
    }
  },
  
  renderToolUseMessage({ file_path, offset, limit }, { verbose }) {
    if (!verbose) {
      // Show abbreviated path for non-verbose mode
      const fileName = path.basename(file_path);
      return \`\${fileName}\${offset ? \` (from line \${offset})\` : ''}\`;
    }
    
    return \`\${file_path}\${offset ? \` (from line \${offset})\${limit ? \`, \${limit} lines\` : ''})\` : ''}\`;
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
  
  renderResultForAssistant({ content, truncated, isImage }) {
    if (isImage) {
      return content;
    }
    
    return truncated 
      ? \`\${content}\\n\\n[File truncated, showing \${content.split('\\n').length} lines]\` 
      : content;
  }
} satisfies Tool<typeof inputSchema, ViewToolOutput>;

// Helper function to check if a path is sensitive
function isSensitivePath(filePath) {
  const sensitiveDirectories = [
    '/etc',
    '/usr',
    '/var',
    '/home',
    '/private'
  ];
  
  return sensitiveDirectories.some(dir => filePath.startsWith(dir));
}

// Helper function to check if file is an image
function isImageFile(filePath) {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
  const ext = path.extname(filePath).toLowerCase();
  return imageExtensions.includes(ext);
}

// Helper function to truncate long lines
function truncateLine(line) {
  const MAX_LINE_LENGTH = 2000;
  if (line.length <= MAX_LINE_LENGTH) return line;
  return line.substring(0, MAX_LINE_LENGTH) + '…';
}`,

  'ViewTool/prompt.ts': `
// Prompt for ViewTool
export const viewToolPrompt = \`
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
\`
`,

  // BashTool template
  'BashTool/BashTool.tsx': `import React from 'react';
import { Box, Text } from 'ink';
import { z } from 'zod';
import { Tool } from '../../tools';
import { execCommand } from './utils';

// Input schema for BashTool
const inputSchema = z.object({
  command: z.string().describe("The command to execute"),
  timeout: z.number().optional().describe("Optional timeout in milliseconds (max 600000)")
});

// Output interface
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
    // Check for banned commands
    const bannedCommands = [
      'alias', 'curl', 'curlie', 'wget', 'axel', 'aria2c', 
      'nc', 'telnet', 'lynx', 'w3m', 'links', 'httpie', 
      'xh', 'http-prompt', 'chrome', 'firefox', 'safari'
    ];
    
    // Simple check for banned commands (a more robust implementation would check for command with args)
    for (const banned of bannedCommands) {
      if (command.startsWith(banned + ' ') || command === banned) {
        return {
          result: false,
          message: \`Command '\${banned}' is not allowed for security reasons\`
        };
      }
    }
    
    return { result: true };
  },
  
  async *call({ command, timeout = 30 * 60 * 1000 }, context) {
    try {
      const startTime = Date.now();
      
      // Execute the command
      const { stdout, stderr, exitCode } = await execCommand(command, {
        timeout: Math.min(timeout, 10 * 60 * 1000), // Max 10 minutes
        signal: context.abortController.signal
      });
      
      const durationMs = Date.now() - startTime;
      
      // Prepare output (combining stdout and stderr)
      let output = stdout;
      if (stderr) {
        output += stderr.length > 0 ? "\\n" + stderr : "";
      }
      
      // Truncate if too long
      const MAX_OUTPUT_LENGTH = 30000;
      const truncated = output.length > MAX_OUTPUT_LENGTH;
      if (truncated) {
        output = output.substring(0, MAX_OUTPUT_LENGTH) + "\\n\\n[Output truncated...]";
      }
      
      // Prepare result
      const result = {
        output,
        exitCode,
        durationMs
      };
      
      yield {
        type: 'result',
        resultForAssistant: this.renderResultForAssistant(result),
        data: result
      };
    } catch (error) {
      if (context.abortController.signal.aborted) {
        throw error; // Let the aborted error propagate
      }
      
      throw new Error(\`Command execution failed: \${error.message}\`);
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
  
  renderResultForAssistant({ output, exitCode }) {
    return output;
  }
} satisfies Tool<typeof inputSchema, BashToolOutput>;`,

  'BashTool/prompt.ts': `
// Prompt for BashTool
export const bashToolPrompt = \`
This tool executes bash commands in a persistent shell session.

Usage notes:
- The command argument is required
- You can specify an optional timeout in milliseconds (up to 600000ms / 10 minutes)
- All commands share the same shell session (environment variables, current directory, etc. persist)
- Avoid using search commands like \`find\` and \`grep\` - use dedicated search tools instead
- Avoid using read commands like \`cat\` and \`ls\` - use View and LS tools instead
- For security reasons, network utilities like curl, wget, and browsers are not allowed

Example:
{
  "command": "echo $PATH",
  "timeout": 10000
}

The tool will execute the command and return its output.
\`
`,

  'BashTool/utils.ts': `
/**
 * Utility functions for the BashTool
 */

import { spawn } from 'child_process';
import * as os from 'os';

// Global shell state
let persistentShell = null;

/**
 * Execute a command in a persistent shell
 */
export async function execCommand(command, options = {}) {
  const { timeout = 30 * 60 * 1000, signal } = options;
  
  // Create shell if it doesn't exist
  if (!persistentShell) {
    persistentShell = {
      shell: os.platform() === 'win32' ? 'cmd.exe' : 'bash',
      args: os.platform() === 'win32' ? ['/c'] : ['-c'],
      cwd: process.cwd(),
      env: { ...process.env }
    };
  }
  
  return new Promise((resolve, reject) => {
    // Set up timeout
    const timeoutId = setTimeout(() => {
      reject(new Error(\`Command timed out after \${timeout}ms\`));
    }, timeout);
    
    // Handle abort signal
    const abortHandler = () => {
      clearTimeout(timeoutId);
      reject(new Error('Command execution aborted'));
    };
    
    if (signal) {
      signal.addEventListener('abort', abortHandler);
    }
    
    try {
      // Execute command
      const childProcess = spawn(
        persistentShell.shell,
        [...persistentShell.args, command],
        {
          cwd: persistentShell.cwd,
          env: persistentShell.env,
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
        clearTimeout(timeoutId);
        if (signal) signal.removeEventListener('abort', abortHandler);
        reject(err);
      });
      
      childProcess.on('close', (code) => {
        clearTimeout(timeoutId);
        if (signal) signal.removeEventListener('abort', abortHandler);
        resolve({
          stdout,
          stderr,
          exitCode: code
        });
      });
    } catch (error) {
      clearTimeout(timeoutId);
      if (signal) signal.removeEventListener('abort', abortHandler);
      reject(error);
    }
  });
}`,

  // GlobTool template
  'GlobTool/GlobTool.tsx': `import React from 'react';
import { Box, Text } from 'ink';
import { z } from 'zod';
import { Tool } from '../../tools';
import * as glob from 'glob';
import * as path from 'path';
import * as fs from 'fs';

// Input schema for GlobTool
const inputSchema = z.object({
  pattern: z.string().describe("The glob pattern to match files against"),
  path: z.string().optional().describe("The directory to search in. Defaults to the current working directory.")
});

// Output interface
interface GlobToolOutput {
  files: string[];
  count: number;
  pattern: string;
  baseDir: string;
}

// GlobTool implementation
export const GlobTool = {
  name: 'GlobTool',
  
  userFacingName() { 
    return "Glob";
  },
  
  async description() {
    return \`
- Fast file pattern matching tool that works with any codebase size
- Supports glob patterns like "**/*.js" or "src/**/*.ts"
- Returns matching file paths sorted by modification time
- Use this tool when you need to find files by name patterns
- When you are doing an open ended search that may require multiple rounds of globbing and grepping, use the Agent tool instead
\`;
  },
  
  inputSchema,
  
  isReadOnly() {
    return true;
  },
  
  async isEnabled() {
    return true;
  },
  
  needsPermissions() {
    return false;
  },
  
  async *call({ pattern, path: baseDir = process.cwd() }, context) {
    try {
      // Make the base directory absolute
      const absoluteBaseDir = path.isAbsolute(baseDir) 
        ? baseDir 
        : path.join(process.cwd(), baseDir);
      
      // Check if directory exists
      if (!fs.existsSync(absoluteBaseDir)) {
        throw new Error(\`Directory not found: \${absoluteBaseDir}\`);
      }
      
      // Run glob search
      const files = await new Promise((resolve, reject) => {
        glob(pattern, { 
          cwd: absoluteBaseDir,
          nodir: true,
          absolute: true
        }, (err, matches) => {
          if (err) reject(err);
          else resolve(matches);
        });
      });
      
      // Sort files by modification time (newest first)
      const filesWithStats = await Promise.all(
        files.map(async (file) => {
          const stats = await fs.promises.stat(file);
          return { file, mtime: stats.mtime };
        })
      );
      
      filesWithStats.sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
      const sortedFiles = filesWithStats.map(item => item.file);
      
      // Prepare result
      const result = {
        files: sortedFiles,
        count: sortedFiles.length,
        pattern,
        baseDir: absoluteBaseDir
      };
      
      yield {
        type: 'result',
        resultForAssistant: this.renderResultForAssistant(result),
        data: result
      };
    } catch (error) {
      throw new Error(\`Glob search failed: \${error.message}\`);
    }
  },
  
  renderToolUseMessage({ pattern, path }, { verbose }) {
    return \`\${pattern}\${path ? \` (in \${path})\` : ''}\`;
  },
  
  renderToolResultMessage({ count, pattern }) {
    return (
      <Box flexDirection="column">
        <Text>  ⎿ Found {count} files matching {pattern}</Text>
      </Box>
    );
  },
  
  renderToolUseRejectedMessage({ pattern }) {
    return <Text>  ⎿ Glob search cancelled: {pattern}</Text>;
  },
  
  renderResultForAssistant({ files, count, pattern, baseDir }) {
    if (count === 0) {
      return \`No files found matching pattern "\${pattern}" in \${baseDir}\`;
    }
    
    return \`Found \${count} files matching "\${pattern}":\\n\\n\${files.join('\\n')}\`;
  }
} satisfies Tool<typeof inputSchema, GlobToolOutput>;`,

  'GlobTool/prompt.ts': `
// Prompt for GlobTool
export const globToolPrompt = \`
This tool finds files matching glob patterns.

Features:
- Fast file pattern matching for any codebase size
- Returns files sorted by modification time (newest first)
- Works with glob patterns like "**/*.js" or "src/**/*.{ts,tsx}"

Example patterns:
- "**/*.js" - All JavaScript files in any subdirectory
- "src/**/*.ts" - All TypeScript files in the src directory or subdirectories
- "*.{json,yaml}" - All JSON and YAML files in the current directory
- "**/*test*.*" - All files with "test" in the name

Example:
{
  "pattern": "**/*.js",
  "path": "/optional/base/directory" // Optional, defaults to current directory
}
\`
`,

  // GrepTool template
  'GrepTool/GrepTool.tsx': `import React from 'react';
import { Box, Text } from 'ink';
import { z } from 'zod';
import { Tool } from '../../tools';
import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';
import { promisify } from 'util';

// Input schema for GrepTool
const inputSchema = z.object({
  pattern: z.string().describe("The regular expression pattern to search for in file contents"),
  path: z.string().optional().describe("The directory to search in. Defaults to the current working directory."),
  include: z.string().optional().describe('File pattern to include in the search (e.g. "*.js", "*.{ts,tsx}")')
});

// Output interface
interface GrepToolOutput {
  matches: Array<{
    file: string;
    line: number;
    content: string;
  }>;
  count: number;
  pattern: string;
  baseDir: string;
}

// GrepTool implementation
export const GrepTool = {
  name: 'GrepTool',
  
  userFacingName() { 
    return "Grep";
  },
  
  async description() {
    return \`
- Fast content search tool that works with any codebase size
- Searches file contents using regular expressions
- Supports full regex syntax (eg. "log.*Error", "function\\s+\\w+", etc.)
- Filter files by pattern with the include parameter (eg. "*.js", "*.{ts,tsx}")
- Returns matching file paths sorted by modification time
- Use this tool when you need to find files containing specific patterns
- When you are doing an open ended search that may require multiple rounds of globbing and grepping, use the Agent tool instead
\`;
  },
  
  inputSchema,
  
  isReadOnly() {
    return true;
  },
  
  async isEnabled() {
    return true;
  },
  
  needsPermissions() {
    return false;
  },
  
  async *call({ pattern, path: baseDir = process.cwd(), include = "**" }, context) {
    try {
      // Make the base directory absolute
      const absoluteBaseDir = path.isAbsolute(baseDir) 
        ? baseDir 
        : path.join(process.cwd(), baseDir);
      
      // Check if directory exists
      if (!fs.existsSync(absoluteBaseDir)) {
        throw new Error(\`Directory not found: \${absoluteBaseDir}\`);
      }
      
      // Create regex pattern
      const regex = new RegExp(pattern, 'i');
      
      // Find files to search
      const globAsync = promisify(glob);
      const files = await globAsync(include, { 
        cwd: absoluteBaseDir,
        nodir: true,
        absolute: true
      });
      
      // Sort files by modification time (newest first)
      const filesWithStats = await Promise.all(
        files.map(async (file) => {
          const stats = await fs.promises.stat(file);
          return { file, mtime: stats.mtime };
        })
      );
      
      filesWithStats.sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
      const sortedFiles = filesWithStats.map(item => item.file);
      
      // Search files for pattern
      const matches = [];
      
      for (const file of sortedFiles) {
        try {
          const content = await fs.promises.readFile(file, 'utf8');
          const lines = content.split('\\n');
          
          for (let i = 0; i < lines.length; i++) {
            if (regex.test(lines[i])) {
              matches.push({
                file,
                line: i + 1,
                content: lines[i].trim()
              });
              
              // Limit to 100 matches
              if (matches.length >= 100) break;
            }
          }
          
          // Limit to 100 matches total
          if (matches.length >= 100) break;
        } catch (err) {
          // Skip files we can't read
          continue;
        }
      }
      
      // Prepare result
      const result = {
        matches,
        count: matches.length,
        pattern,
        baseDir: absoluteBaseDir
      };
      
      yield {
        type: 'result',
        resultForAssistant: this.renderResultForAssistant(result),
        data: result
      };
    } catch (error) {
      throw new Error(\`Grep search failed: \${error.message}\`);
    }
  },
  
  renderToolUseMessage({ pattern, path, include }, { verbose }) {
    return \`\${pattern}\${include ? \` in \${include}\` : ''}\${path ? \` (in \${path})\` : ''}\`;
  },
  
  renderToolResultMessage({ count, pattern }) {
    return (
      <Box flexDirection="column">
        <Text>  ⎿ Found {count} matches for {pattern}</Text>
      </Box>
    );
  },
  
  renderToolUseRejectedMessage({ pattern }) {
    return <Text>  ⎿ Grep search cancelled: {pattern}</Text>;
  },
  
  renderResultForAssistant({ matches, count, pattern, baseDir }) {
    if (count === 0) {
      return \`No matches found for pattern "\${pattern}" in \${baseDir}\`;
    }
    
    const matchesText = matches.map(match => 
      \`\${match.file}:\${match.line}: \${match.content}\`
    ).join('\\n');
    
    return \`Found \${count} matches for "\${pattern}":\${count > 100 ? ' (showing first 100)' : ''}\\n\\n\${matchesText}\`;
  }
} satisfies Tool<typeof inputSchema, GrepToolOutput>;`,

  'GrepTool/prompt.ts': `
// Prompt for GrepTool
export const grepToolPrompt = \`
This tool searches file contents using regular expressions.

Features:
- Fast content search for any codebase size
- Uses regular expressions for powerful pattern matching
- Can filter which files to search with the include parameter
- Returns matches with file path, line number, and content

Example patterns:
- "function\\\\s+\\\\w+" - Find function declarations
- "TODO|FIXME" - Find TODO or FIXME comments
- "import.*from\\\\s+'react'" - Find React imports
- "class\\\\s+\\\\w+\\\\s+extends" - Find class inheritance

Example:
{
  "pattern": "function\\\\s+\\\\w+",
  "include": "*.js",  // Optional file pattern filter
  "path": "/optional/base/directory" // Optional, defaults to current directory
}
\`
`,

  // WebFetch template
  'WebFetch/WebFetch.tsx': `import React from 'react';
import { Box, Text } from 'ink';
import { z } from 'zod';
import { Tool } from '../../tools';
import * as https from 'https';
import * as http from 'http';
import { URL } from 'url';

// Input schema for WebFetch
const inputSchema = z.object({
  url: z.string().url().describe('The URL to fetch content from'),
  headers: z.record(z.string()).optional().describe('Optional HTTP headers to include with the request'),
  timeout: z.number().int().min(1000).max(30000).optional().describe('Timeout in milliseconds (default: 10000)')
});

// Output interface
interface WebFetchOutput {
  status: number;
  headers: Record<string, string>;
  content: string;
  contentType: string;
  durationMs: number;
}

// WebFetch implementation
export const WebFetch = {
  name: 'WebFetch',
  
  userFacingName() { 
    return "Web Fetch";
  },
  
  async description() {
    return \`
- Fetches content from a URL
- Limited to specific programming documentation and repository hosting sites
- Returns the response content, status code, and headers
- Useful for looking up documentation, API references, and source code
- Maximum timeout is 30 seconds
- Maximum content size is 1MB

Allowed domains:
- github.com
- gitlab.com
- bitbucket.org
- docs.python.org
- doc.rust-lang.org
- developer.mozilla.org
- nodejs.org
- npmjs.com
- pypi.org
- crates.io
- rubygems.org
- pkg.go.dev
- rust-lang.org
\`;
  },
  
  inputSchema,
  
  isReadOnly() {
    return true;
  },
  
  async isEnabled() {
    return true;
  },
  
  needsPermissions() {
    return true; // Web requests need permission
  },
  
  async validateInput({ url }) {
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname;
      
      // List of allowed domains
      const ALLOWED_DOMAINS = [
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
      ];
      
      // Check if domain or its parent domain is allowed
      const isAllowed = ALLOWED_DOMAINS.some(allowedDomain => 
        domain === allowedDomain || domain.endsWith('.' + allowedDomain)
      );
      
      if (!isAllowed) {
        return {
          result: false,
          message: \`Domain \${domain} is not allowed. Allowed domains: \${ALLOWED_DOMAINS.join(', ')}\`
        };
      }
      
      return { result: true };
    } catch (error) {
      return {
        result: false,
        message: \`Invalid URL: \${error.message}\`
      };
    }
  },
  
  async *call({ url, headers = {}, timeout = 10000 }, context) {
    const startTime = Date.now();
    
    try {
      // Fetch URL
      const result = await fetchWithTimeout(url, headers, timeout, context.abortController.signal);
      const durationMs = Date.now() - startTime;
      
      // Prepare result
      yield {
        type: 'result',
        resultForAssistant: this.renderResultForAssistant(result),
        data: {
          ...result,
          durationMs
        }
      };
    } catch (error) {
      if (context.abortController.signal.aborted) {
        throw error; // Let the aborted error propagate
      }
      
      const durationMs = Date.now() - startTime;
      
      yield {
        type: 'result',
        resultForAssistant: \`Error fetching \${url}: \${error.message}\`,
        data: {
          status: 0,
          headers: {},
          content: \`Error: \${error.message}\`,
          contentType: 'text/plain',
          durationMs
        }
      };
    }
  },
  
  renderToolUseMessage({ url }, { verbose }) {
    return \`url: \${url}\`;
  },
  
  renderToolResultMessage({ status, contentType, content, durationMs }) {
    const statusColor = status >= 200 && status < 300 ? 'green' : 'red';
    const previewContent = content.length > 100 ? content.substring(0, 100) + '...' : content;
    
    return (
      <Box justifyContent="space-between" width="100%">
        <Box flexDirection="column">
          <Text>  ⎿ <Text color={statusColor}>Status: {status}</Text> ({contentType})</Text>
          {previewContent && <Text>      {previewContent.replace(/\\n/g, ' ')}</Text>}
        </Box>
      </Box>
    );
  },
  
  renderToolUseRejectedMessage({ url }) {
    return <Text>  ⎿ Fetch to {url} cancelled</Text>;
  },
  
  renderResultForAssistant({ status, content, contentType, headers }) {
    return \`
Status: \${status}
Content-Type: \${contentType}
Headers: \${JSON.stringify(headers, null, 2)}

\${content}
\`;
  }
} satisfies Tool<typeof inputSchema, WebFetchOutput>;

// Helper function to fetch with timeout
async function fetchWithTimeout(url, headers = {}, timeout = 10000, signal) {
  return new Promise((resolve, reject) => {
    const controller = new AbortController();
    const fetchSignal = signal || controller.signal;
    
    // Set timeout
    const timeoutId = setTimeout(() => {
      controller.abort();
      reject(new Error(\`Request timed out after \${timeout}ms\`));
    }, timeout);
    
    // Handle abort signal
    if (signal) {
      signal.addEventListener('abort', () => {
        controller.abort();
        reject(new Error('Request aborted'));
      });
    }
    
    // Parse URL
    const urlObj = new URL(url);
    
    // Choose http or https based on protocol
    const httpModule = urlObj.protocol === 'https:' ? https : http;
    
    // Prepare request options
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Claude-Code/0.1',
        ...headers
      }
    };
    
    // Make request
    const req = httpModule.request(options, (res) => {
      let data = '';
      let bytesReceived = 0;
      const MAX_SIZE = 1024 * 1024; // 1MB limit
      
      res.on('data', (chunk) => {
        bytesReceived += chunk.length;
        if (bytesReceived > MAX_SIZE) {
          controller.abort();
          reject(new Error('Response too large (max 1MB)'));
          return;
        }
        data += chunk;
      });
      
      res.on('end', () => {
        clearTimeout(timeoutId);
        
        // Convert headers to object
        const headersObj = {};
        for (const [key, value] of Object.entries(res.headers)) {
          headersObj[key] = Array.isArray(value) ? value.join(', ') : value;
        }
        
        // Determine content type
        const contentType = res.headers['content-type'] || 'text/plain';
        
        resolve({
          status: res.statusCode,
          headers: headersObj,
          content: data,
          contentType
        });
      });
    });
    
    req.on('error', (error) => {
      clearTimeout(timeoutId);
      reject(error);
    });
    
    req.end();
  });
}`,

  'WebFetch/prompt.ts': `
// Prompt for WebFetch
export const webFetchPrompt = \`
This tool allows you to fetch content from specific documentation and code hosting websites.

Allowed domains:
- github.com
- gitlab.com
- bitbucket.org
- docs.python.org
- doc.rust-lang.org
- developer.mozilla.org
- nodejs.org
- npmjs.com
- pypi.org
- crates.io
- rubygems.org
- pkg.go.dev
- rust-lang.org

Usage:
{
  "url": "https://docs.python.org/3/library/json.html",
  "headers": {
    "User-Agent": "Claude-Code"
  },
  "timeout": 10000
}

Only headers and timeout are optional. Maximum timeout is 30 seconds.
\`
`,

  // ThinkTool template
  'ThinkTool/ThinkTool.tsx': `import React from 'react';
import { Box, Text } from 'ink';
import { z } from 'zod';
import { Tool } from '../../tools';

// Input schema for ThinkTool
const inputSchema = z.object({
  prompt: z.string().describe('The thinking prompt to explore'),
  intensity: z.enum(['normal', 'hard', 'ultra']).optional().describe('How intensely to think about the problem (normal, hard, ultra)')
});

// Output interface
interface ThinkToolOutput {
  thoughts: string;
  conclusion: string;
}

// ThinkTool implementation
export const ThinkTool = {
  name: 'ThinkTool',
  
  userFacingName() { 
    return "Think";
  },
  
  async description() {
    return \`
- Makes a detailed plan by thinking step-by-step about a problem
- Uses a more deliberate, multi-step reasoning process
- Helps break down complex problems into manageable steps
- Generates a structured approach to solving the problem
- Available intensity levels: normal, hard, ultra (with increasing depth)
\`;
  },
  
  inputSchema,
  
  isReadOnly() {
    return true;
  },
  
  async isEnabled() {
    return true;
  },
  
  needsPermissions() {
    return false;
  },
  
  async *call({ prompt, intensity = 'normal' }, context) {
    yield {
      type: 'progress',
      message: {
        type: 'assistant',
        message: {
          role: 'assistant',
          content: [{ type: 'text', text: 'Thinking...' }]
        }
      }
    };
    
    // More detailed thinking based on intensity
    let thinkingSteps = 3;
    let thinkingIntro = 'Let me think through this step by step:';
    
    if (intensity === 'hard') {
      thinkingSteps = 5;
      thinkingIntro = 'Let me think HARD about this problem with a detailed analysis:';
    } else if (intensity === 'ultra') {
      thinkingSteps = 7;
      thinkingIntro = 'ULTRATHINKING MODE ACTIVATED. I will analyze this thoroughly with multiple perspectives:';
    }
    
    // Simulate thinking process (in real implementation, this would leverage the model)
    let thoughts = \`\${thinkingIntro}\\n\\n\`;
    
    for (let i = 1; i <= thinkingSteps; i++) {
      thoughts += \`Step \${i}: Consider the key aspects of "\${prompt}"...\\n\\n\`;
      
      // In real implementation, this would be a separate model call
      if (i === thinkingSteps) {
        thoughts += 'Final analysis: Based on the above reasoning...\\n\\n';
      }
    }
    
    // Prepare conclusion
    const conclusion = \`Based on my detailed analysis, here's my plan for "\${prompt}":\\n\\n1. First...\\n2. Then...\\n3. Finally...\\n\\nThis approach ensures we address all key considerations systematically.\`;
    
    yield {
      type: 'result',
      resultForAssistant: this.renderResultForAssistant({ thoughts, conclusion }),
      data: { thoughts, conclusion }
    };
  },
  
  renderToolUseMessage({ prompt, intensity }, { verbose }) {
    const intensityLabel = intensity ? " (" + intensity + ")" : '';
    return "Thinking about: " + prompt + intensityLabel;
  },
  
  renderToolResultMessage() {
    return (
      <Box flexDirection="column">
        <Text>  ⎿ Thinking complete</Text>
      </Box>
    );
  },
  
  renderToolUseRejectedMessage() {
    return <Text>  ⎿ Thinking cancelled</Text>;
  },
  
  renderResultForAssistant({ thoughts, conclusion }) {
    return \`\${thoughts}\\n\\n\${conclusion}\`;
  }
} satisfies Tool<typeof inputSchema, ThinkToolOutput>;`,

  'ThinkTool/prompt.ts': `
// Prompt for ThinkTool
export const thinkToolPrompt = \`
This tool helps you think through problems step-by-step.

When faced with complex problems, use the Think tool to:
- Break down the problem into manageable parts
- Explore multiple perspectives
- Identify potential challenges and solutions
- Create a structured plan

You can specify an intensity level:
- normal: Standard step-by-step reasoning
- hard: More detailed analysis with more steps
- ultra: Comprehensive multi-perspective analysis

Example:
{
  "prompt": "How to implement a distributed caching system",
  "intensity": "hard"
}

The intensity parameter is optional and defaults to "normal".
\`
`,

  // BatchTool template
  'BatchTool/BatchTool.tsx': `import React from 'react';
import { Box, Text } from 'ink';
import { z } from 'zod';
import { Tool } from '../../tools';

// Input schema for BatchTool
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

Available tools:
Tool: AgentTool
Arguments: prompt: string "The task for the agent to perform"
Usage: Launch a new agent that has access to tools for searching and reading files

Tool: BashTool
Arguments: command: string "The command to execute", [optional] timeout: number "Optional timeout in milliseconds (max 600000)"
Usage: Execute bash commands in a persistent shell session

Tool: GlobTool
Arguments: pattern: string "The glob pattern to match files against", [optional] path: string "The directory to search in"
Usage: Find files matching glob patterns like "**/*.js"

Tool: GrepTool
Arguments: pattern: string "The regex pattern to search for", [optional] path: string "The directory to search in", [optional] include: string "File pattern to include"
Usage: Search file contents using regular expressions

Tool: ViewTool
Arguments: file_path: string "The absolute path to the file to read", [optional] offset: number "Line to start reading from", [optional] limit: number "Number of lines to read"
Usage: Read files from the filesystem

Tool: WebFetch
Arguments: url: string "The URL to fetch content from", [optional] headers: object "HTTP headers", [optional] timeout: number "Timeout in milliseconds"
Usage: Fetch content from specific documentation and code hosting websites

Tool: ThinkTool
Arguments: prompt: string "The thinking prompt to explore", [optional] intensity: string "How intensely to think (normal, hard, ultra)"
Usage: Make a detailed plan by thinking step-by-step about a problem

Example usage:
{
  "description": "Check repository status",
  "invocations": [
    {
      "tool_name": "BashTool",
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
        "pattern": "function",
        "include": "*.ts"
      }
    }
  ]
}
\`;
  },
  
  inputSchema,
  
  isReadOnly() {
    return true;
  },
  
  async isEnabled() {
    return true;
  },
  
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
  },
  
  renderToolUseMessage({ description, invocations }, { verbose }) {
    return description || \`Calling \${invocations.length} tools\`;
  },
  
  renderToolResultMessage({ results, durationMs }) {
    return (
      <Box justifyContent="space-between" width="100%">
        <Box flexDirection="column">
          <Text>  ⎿ Completed {results.length} tool invocations</Text>
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
} satisfies Tool<typeof inputSchema, BatchToolOutput>;`,

  'BatchTool/prompt.ts': `
// Prompt for BatchTool
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
\`
`
};

// Main functions
/**
 * Create the directory structure for a tool
 */
function createToolDirectory(toolName, version) {
  // Create base directories
  const versionDir = path.join(TOOLS_DIR, version);
  const toolDir = path.join(versionDir, toolName);
  
  // Create nested directories
  fs.mkdirSync(toolDir, { recursive: true });
  
  return toolDir;
}

/**
 * Write tool implementation files
 */
function writeToolFiles(toolDir, toolName, files) {
  for (const file of files) {
    const filePath = path.join(toolDir, file);
    const content = TOOL_TEMPLATES[`${toolName}/${file}`] || '';
    
    // Create parent directory if needed
    const dirPath = path.dirname(filePath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    
    fs.writeFileSync(filePath, content);
    console.log(`Created: ${filePath}`);
  }
}

/**
 * Create tool.ts file with exports
 */
function createToolsIndex(version) {
  const versionDir = path.join(TOOLS_DIR, version);
  const toolsIndexPath = path.join(versionDir, 'tools.ts');
  
  // Find tools in this version
  const tools = [];
  for (const release of RELEASES) {
    if (release.version <= version) {
      for (const feature of release.key_features) {
        if (!tools.includes(feature.name)) {
          tools.push(feature.name);
        }
      }
    }
  }
  
  // Create index file
  const imports = tools.map(tool => `import { ${tool} } from './${tool}/${tool}';`).join('\n');
  const exports = `export const tools = [\n  ${tools.join(',\n  ')}\n];\n`;
  
  const content = `/**
 * Tool exports for Claude Code ${version}
 */

${imports}

${exports}

export type Tool = typeof ${tools[0]};
`;
  
  fs.writeFileSync(toolsIndexPath, content);
  console.log(`Created: ${toolsIndexPath}`);
}

/**
 * Create README for each version
 */
function createVersionReadme(version) {
  const versionDir = path.join(TOOLS_DIR, version);
  const readmePath = path.join(versionDir, 'README.md');
  
  // Find tools in this version
  const toolsSummary = [];
  for (const release of RELEASES) {
    if (release.version <= version) {
      for (const feature of release.key_features) {
        toolsSummary.push(`- **${feature.name}** (${feature.user_facing_name})`);
      }
    }
  }
  
  // Find what's new in this version
  const currentRelease = RELEASES.find(r => r.version === version);
  const newFeatures = currentRelease?.key_features.map(f => 
    `- **${f.name}** (${f.user_facing_name})`
  ) || [];
  
  const content = `# Claude Code ${version}

## Available Tools

${toolsSummary.join('\n')}

${newFeatures.length > 0 ? `\n## New in this version\n\n${newFeatures.join('\n')}` : ''}

## Tool Interface

All tools follow a standard interface with these methods:

\`\`\`typescript
interface Tool<TInput, TOutput> {
  name: string;                    // Internal name
  userFacingName(): string;        // User-visible name
  description(): Promise<string>;  // Tool description
  inputSchema: ZodSchema;          // Input validation schema
  isReadOnly(): boolean;           // Whether tool modifies state
  isEnabled(): Promise<boolean>;   // Whether tool is available
  needsPermissions(input: TInput): boolean; // Whether tool requires permission
  validateInput?(input: TInput, context: any): Promise<ValidationResult>; // Validate input
  call(input: TInput, context: any, ...args: any[]): AsyncGenerator; // Execute tool
  renderToolUseMessage(input: TInput, context: any): React.ReactNode; // Render tool use
  renderToolResultMessage(result: TOutput): React.ReactNode; // Render result
  renderToolUseRejectedMessage(input: TInput): React.ReactNode; // Render rejection
  renderResultForAssistant(result: TOutput): string; // Format for Claude
}
\`\`\`
`;
  
  fs.writeFileSync(readmePath, content);
  console.log(`Created: ${readmePath}`);
}

/**
 * Create the main README
 */
function createMainReadme() {
  const readmePath = path.join(OUTPUT_DIR, 'README.md');
  
  const content = `# Claude Code Reconstructed Releases

This directory contains reconstructed implementations of Claude Code tools across different versions.

## Directory Structure

\`\`\`
tools/
  0.2.9/    - Early version with basic tools
  0.2.18/   - Version with ViewTool (renamed from FileReadTool)
  0.2.35/   - Version with WebFetch addition
  0.2.44/   - Version with ThinkTool addition
  0.2.45/   - Version with BatchTool (Call) addition
  0.2.49/   - Latest analyzed version
\`\`\`

## Feature Evolution Timeline

| Version | CLI Entry | Key Features Added |
|---------|-----------|-------------------|
| 0.2.9   | cli.mjs   | AgentTool (Task), FileReadTool (Read), BashTool (Bash) |
| 0.2.18  | cli.mjs   | ViewTool (View), GlobTool (Glob), GrepTool (Grep) |
| 0.2.35  | cli.js    | WebFetch (Web Fetch) |
| 0.2.44  | cli.js    | ThinkTool (Think) |
| 0.2.45  | cli.js    | BatchTool (Call) |
| 0.2.49  | cli.js    | MCP server scope renaming |

## Implementation Notes

These are reconstructed implementations based on analysis of minified code and feature evolution patterns. They aim to faithfully represent the design patterns and interfaces of the original code, though specific implementation details may vary.

The reconstructions focus on:

1. Tool interfaces
2. Input/output schemas
3. Permission handling
4. UI rendering patterns
5. Error handling
6. Tool interactions

Each tool follows the standard interface pattern established in the Claude Code architecture, with consistent naming and method signatures.
`;
  
  fs.writeFileSync(readmePath, content);
  console.log(`Created: ${readmePath}`);
}

/**
 * Main function to reconstruct releases
 */
async function main() {
  console.log('Claude Code Release Reconstructor');
  console.log('================================');
  
  // Create output directory
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.mkdirSync(TOOLS_DIR, { recursive: true });
  
  // Process each release
  for (const release of RELEASES) {
    console.log(`\nProcessing release ${release.version}...`);
    
    // Create tools for this release
    for (const feature of release.key_features) {
      const toolDir = createToolDirectory(feature.name, release.version);
      writeToolFiles(toolDir, feature.name, feature.files);
    }
    
    // Create tools index
    createToolsIndex(release.version);
    
    // Create README
    createVersionReadme(release.version);
  }
  
  // Create main README
  createMainReadme();
  
  console.log('\nReconstruction complete!');
  console.log(`Results are available in ${OUTPUT_DIR}`);
}

// Run the program
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});