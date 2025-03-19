# SelfImproveTool Implementation Guide

This document provides a comprehensive guide for implementing and extending the SelfImproveTool, a meta-programming tool that enables Claude Code to analyze and improve its own codebase.

## Core Architecture

The SelfImproveTool is built on three key components:

1. **GlobTool** - For collecting and filtering files to analyze
2. **LotusTool** - For semantic understanding of code relationships and patterns
3. **DocETLTool** - For structured processing and analysis of code components

The tool follows the standard Claude Code tool interface pattern but adds meta-programming capabilities by leveraging these existing tools to analyze the codebase itself.

## Implementation Details

### Tool Interface

The SelfImproveTool implements the standard Tool interface with these key components:

- **inputSchema** - Defines valid analysis parameters
- **isEnabled** - Checks dependencies (Lotus and DocETL)
- **call** - Orchestrates the multi-stage analysis process
- **renderToolUseMessage/renderToolResultMessage** - Display formatting

### Analysis Process

The tool follows a four-stage analysis pipeline:

1. **File Collection** - Uses GlobTool to gather relevant files for analysis
2. **Semantic Analysis** - Uses LotusTool to understand code relationships
3. **Structural Analysis** - Uses DocETLTool to process and analyze code structure
4. **Result Processing** - Combines and formats the analysis results

### Caching

Results are cached to improve performance:

- Cache key based on analysis type, depth, scope, and format
- Cache expiration after 24 hours
- Separate cache directory to avoid polluting the codebase

## Integration with Tools Subsystem

The SelfImproveTool integrates with the Claude Code tools subsystem by:

1. Following the standard Tool interface pattern
2. Delegating specific tasks to specialized tools (Glob, Lotus, DocETL)
3. Using the shared ToolUseContext for consistent execution environment
4. Implementing permission checking for target directory access

## Extending the Tool

### Adding New Analysis Types

To add a new analysis type:

1. Update the `inputSchema` to include the new type in the enum
2. Add a new case in the `analyzeLotusPatterns` function
3. Consider if DocETL pipeline changes are needed for the new analysis type
4. Update the prompt.ts file to describe the new capability

### Supporting New Output Formats

To add a new output format:

1. Add the format to the `outputFormat` enum in the inputSchema
2. Update the `processResults` function to handle the new format
3. Consider if DocETL pipeline changes are needed for the new format

### Creating Custom Analysis Rules

For specialized analysis types:

1. Leverage the 'custom' analysisType with customPrompt
2. Consider creating a dedicated pipeline template for complex analyses
3. Extend the DocETL pipeline generator to support new schema types

## Performance Considerations

- File filtering is critical - avoid analyzing node_modules and other large directories
- The cache mechanism prevents redundant analysis of unchanged code
- DocETL optimization flag improves performance for large codebases
- The depth level parameter allows trading off between speed and detail

## Security Considerations

- The tool is read-only and cannot modify files
- Permission checks ensure the user has access to analyze the target directory
- The tool avoids persisting sensitive information in cache files

## Examples

### Architecture Analysis

```typescript
await SelfImproveTool.call({
  analysisType: 'architecture',
  targetPath: '/path/to/claude-code',
  depthLevel: 'deep',
  outputFormat: 'markdown',
  scope: 'tools'
}, context)
```

### Custom Analysis

```typescript
await SelfImproveTool.call({
  analysisType: 'custom',
  customPrompt: 'Analyze how error handling is implemented across the codebase',
  depthLevel: 'medium',
  outputFormat: 'json'
}, context)
```

## Troubleshooting

Common issues and solutions:

- **Missing Dependencies**: Ensure Lotus and DocETL are properly installed and configured
- **Permission Errors**: Verify read access to the target directory
- **Performance Issues**: Try reducing depth level or narrowing scope for large codebases
- **Empty Results**: Check if files are being properly collected in the first stage