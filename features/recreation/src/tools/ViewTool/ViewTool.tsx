import React from 'react';
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
    return `
Reads a file from the local filesystem.

Usage:
- The file_path parameter must be an absolute path, not a relative path
- By default, it reads up to 2000 lines starting from the beginning of the file
- You can optionally specify a line offset and limit (especially handy for long files), but it's recommended to read the whole file by not providing these parameters
- Any lines longer than 2000 characters will be truncated
- Results are returned using cat -n format, with line numbers starting at 1
- For image files, the tool will display the image for you
For Jupyter notebooks (.ipynb files), use the ReadNotebook instead
`;
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
        message: `Cannot access file: ${error instanceof Error ? error.message : String(error)}`
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
          resultForAssistant: `[Image file: ${path.basename(file_path)}]`,
          data: {
            content: `[Image file: ${path.basename(file_path)}]`,
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
      throw new Error(`Failed to read file: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
  
  renderToolUseMessage({ file_path, offset, limit }, { verbose }) {
    if (!verbose) {
      // Show abbreviated path for non-verbose mode
      const fileName = path.basename(file_path);
      return `${fileName}${offset ? ` (from line ${offset})` : ''}`;
    }
    
    return `${file_path}${offset ? ` (from line ${offset})${limit ? `, ${limit} lines` : ''}` : ''}`;
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
