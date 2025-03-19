/**
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
  BashTool,
  ViewTool,
  BatchTool,
  // Tool prompt content
  bashToolPrompt,
  viewToolPrompt,
  batchToolPrompt
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
export { PersistentShell } from './utils/PersistentShell';