// Prompt for BashTool
export const bashToolPrompt = `
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
`;
