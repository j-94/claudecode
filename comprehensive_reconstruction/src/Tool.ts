/**
 * Tool interface for Claude Code tools
 * Defines the common structure for all tools
 */

export interface Tool {
  /** Internal name of the tool */
  name: string;
  
  /** User-facing name for the tool */
  userFacingName: string;
  
  /** Description of what the tool does */
  description: string;
  
  /** 
   * Function to call the tool with parameters
   * @param params - Tool-specific parameters
   * @returns Tool result
   */
  call: (params: any) => Promise<any>;
  
  /**
   * Check if the tool is enabled
   * @returns Promise resolving to boolean indicating if tool is enabled
   */
  isEnabled?: () => Promise<boolean>;
  
  /**
   * Check if the tool is read-only (doesn't modify state)
   * @returns boolean indicating if tool is read-only
   */
  isReadOnly?: () => boolean;
  
  /**
   * Get tool schema
   * @returns JSON schema for the tool
   */
  schema?: () => any;
}