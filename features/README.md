# Claude Code Features Evolution

This directory contains an analysis of how Claude Code features have evolved from version 0.2.18 to version 0.2.49.

## Major changes:

1. **Tool Structure Changes**: The CLI tools have been renamed and reorganized
   - `FileRead` → `View`
   - `FileEdit` → `Edit`
   - `NotebookRead` → `ReadNotebook`
   - `FileWrite` → `Replace`

2. **New Commands**:
   - `clear` - Clear conversation history and free up context
   - Additional MCP (Model Control Protocol) functionality for server management

3. **New Tools**:
   - `BatchTool` - Execute multiple tool calls in parallel
   - `WebFetch` - (Disabled by default) Access to fetch content from URLs mentioned by the user

4. **Security Improvements**:
   - More sophisticated permission checking for file access
   - URL security validation for the WebFetch tool

5. **CLI Improvements**:
   - JSON output option (`--json`)
   - Additional command-line arguments for configuration

Files in this directory contain extracted code and notes about each feature.