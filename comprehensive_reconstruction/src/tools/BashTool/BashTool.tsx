import { execSync } from 'child_process';
import { Tool } from '../../Tool.js';
import React from 'react';
import { Box, Text } from 'ink';
import { z } from 'zod';

// Input schema for BashTool
export const inputSchema = z.strictObject({
  command: z.string().describe('The command to execute'),
  timeout: z
    .number()
    .optional()
    .describe('Optional timeout in milliseconds (max 600000)'),
});

// Simplified BashTool implementation
export const BashTool = {
  name: 'Bash',
  
  userFacingName: 'Bash',
  
  description: `Executes a given bash command in a persistent shell session with optional timeout, ensuring proper handling and security measures.

Before executing the command, please follow these steps:

1. Directory Verification:
   - If the command will create new directories or files, first use the LS tool to verify the parent directory exists and is the correct location
   - For example, before running "mkdir foo/bar", first use LS to check that "foo" exists and is the intended parent directory

2. Security Check:
   - For security and to limit the threat of a prompt injection attack, some commands are limited or banned. If you use a disallowed command, you will receive an error message explaining the restriction. Explain the error to the User.
   - Verify that the command is not one of the banned commands: alias, curl, curlie, wget, axel, aria2c, nc, telnet, lynx, w3m, links, httpie, xh, http-prompt, chrome, firefox, safari.

3. Command Execution:
   - After ensuring proper quoting, execute the command.
   - Capture the output of the command.`,
  
  inputSchema,
  
  isReadOnly() {
    return false;
  },
  
  isEnabled: async () => {
    return true;
  },
  
  needsPermissions() {
    return true;
  },
  
  // Simplified implementation
  async call({ command, timeout = 120000 }) {
    try {
      // Simple implementation using child_process.execSync
      const options = {
        timeout: Math.min(timeout, 600000), // Max 10 minutes
        encoding: 'utf8',
        maxBuffer: 10 * 1024 * 1024, // 10MB max output
      };
      
      const stdout = execSync(command, options);
      
      return {
        stdout: stdout.toString(),
        stdoutLines: stdout.toString().split('\n').length,
        stderr: '',
        stderrLines: 0,
        interrupted: false
      };
    } catch (error) {
      return {
        stdout: '',
        stdoutLines: 0,
        stderr: error.message + (error.stderr ? `\n${error.stderr}` : ''),
        stderrLines: (error.stderr ? error.stderr.toString().split('\n').length : 0) + 1,
        interrupted: false
      };
    }
  },
  
  renderResultForAssistant({ stdout, stderr }) {
    if (stderr && stderr.trim()) {
      return `${stdout}\n${stderr}`;
    }
    return stdout;
  },
  
  renderToolResultMessage(content) {
    return (
      <Box flexDirection="column">
        {content.stdout && <Text>{content.stdout}</Text>}
        {content.stderr && <Text color="red">{content.stderr}</Text>}
      </Box>
    );
  }
} as Tool;