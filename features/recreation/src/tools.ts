import { z } from 'zod';
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
}
