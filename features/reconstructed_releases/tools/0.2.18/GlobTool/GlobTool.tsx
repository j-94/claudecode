import React from 'react';
import { Box, Text } from 'ink';
import { z } from 'zod';
import { Tool } from '../../tools';

// Input schema for GlobTool
const inputSchema = z.object({
  // Schema definition
});

// Output interface
interface GlobToolOutput {
  // Output definition
}

// GlobTool implementation
export const GlobTool = {
  name: 'GlobTool',
  
  userFacingName() { 
    return "Glob";
  },
  
  async description() {
    return `
Finds files matching glob patterns
`;
  },
  
  inputSchema,
  
  isReadOnly() {
    return true;
  },
  
  async isEnabled() {
    return true;
  },
  
  needsPermissions(input) {
    return false;
  },
  
  async *call(input, context) {
    // Implementation
    yield {
      type: 'result',
      resultForAssistant: 'Result',
      data: {}
    };
  },
  
  renderToolUseMessage(input, { verbose }) {
    return "Tool use message";
  },
  
  renderToolResultMessage(result) {
    return (
      <Box flexDirection="column">
        <Text>  ⎿ Tool result</Text>
      </Box>
    );
  },
  
  renderToolUseRejectedMessage() {
    return <Text>  ⎿ Tool cancelled</Text>;
  },
  
  renderResultForAssistant(result) {
    return "Result for assistant";
  }
};
