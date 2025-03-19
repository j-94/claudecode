import React from 'react';
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
    return `
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
`;
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
      const regex = new RegExp(`(^|\\s)${banned}(\\s|$)`);
      if (regex.test(command)) {
        return {
          result: false,
          message: `Command '${banned}' is not allowed for security reasons`
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
        output += output.length > 0 ? "\n" + result.stderr : result.stderr;
      }
      
      // Truncate if too long
      const MAX_OUTPUT_LENGTH = 30000;
      const truncated = output.length > MAX_OUTPUT_LENGTH;
      if (truncated) {
        output = output.substring(0, MAX_OUTPUT_LENGTH) + "\n\n[Output truncated...]";
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
      
      throw new Error(`Command execution failed: ${error instanceof Error ? error.message : String(error)}`);
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
        <Text>  ⎿ {success ? 'Command completed' : `Command failed (exit code ${exitCode})`}</Text>
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
