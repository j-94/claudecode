// Prompt for ViewTool
export const viewToolPrompt = `
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
`;
