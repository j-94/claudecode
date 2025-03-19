// Export all tools from a single location
import { Tool } from '../tools';

// Import individual tools
import { BashTool } from './BashTool/BashTool';
import { ViewTool } from './ViewTool/ViewTool';
import { BatchTool } from './BatchTool/BatchTool';

// Combine all tools into array
export const allTools: Tool[] = [
  BashTool,
  ViewTool,
  BatchTool,
  // Add other tools here as they are implemented
];

// Export individual tools
export {
  BashTool,
  ViewTool,
  BatchTool,
};

// Export tool prompts
export { bashToolPrompt } from './BashTool/prompt';
export { viewToolPrompt } from './ViewTool/prompt';
export { batchToolPrompt } from './BatchTool/prompt';
