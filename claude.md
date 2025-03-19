# Claude Code: Terminal AI Assistant

![](https://img.shields.io/badge/Node.js-18%2B-brightgreen?style=flat-square)

## Overview

Claude Code is a terminal-based AI assistant that helps you write, edit, and understand code through natural language interactions. Built with Ink (React for the terminal), it provides a rich interactive experience right in your command line, with features like file editing, code navigation, command execution, Git integration, context awareness, and tool integration.

### Core Features

- **File Editing**: Edit files, fix bugs, and add features across your codebase
- **Code Navigation**: Search and understand your codebase structure  
- **Command Execution**: Run and fix tests, lint, and other commands
- **Git Integration**: Manage history, commits, PRs, and merge conflicts
- **Context Awareness**: Claude understands your codebase's structure and style
- **Tool Integration**: Integrates with tools like Lotus for data analysis and DocETL for document processing

### Terminal UI (Ink Components)

- Interactive REPL with rich formatting
- Syntax highlighting for code snippets  
- Permission dialogs for file operations
- Command history with arrow-key navigation
- Progress indicators for long-running tasks  
- Structured diffs for file changes

## Installation and Setup

1. **Install Node.js** (version 18 or higher)
2. **Clone the repository**:
   ```bash
   git clone https://github.com/anthropic/claude-code.git
   cd claude-code
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Build the project**:
   ```bash
   npm run build
   ```
5. **Run Claude Code**:
   ```bash
   npm start
   ```

## Common Commands

```bash
# Start an interactive session
claude

# Execute a one-off query 
claude "explain the algorithm in myfile.js" --print

# Resume a previous conversation
claude resume  

# View conversation logs
claude log

# Check for updates
claude update

# Configure settings
claude config set -g theme dark
```

### Slash Commands

- `/help` - Get command assistance
- `/compact` - Reduce conversation size  
- `/clear` - Clear the terminal
- `/login` - Authenticate your session
- `/logout` - End your session

## Configuration and API

Claude Code can be configured through environment variables and command line arguments. The available options are:

### Environment Variables

- `CLAUDE_API_KEY`: Your Anthropic API key for accessing the Claude models.
- `CLAUDE_MODEL`: The specific Claude model to use (default: `claude-v1.3-25-stable`).
- `CLAUDE_TEMPERATURE`: Sampling temperature for response generation (default: `0.5`).
- `CLAUDE_MAX_TOKENS`: Maximum number of tokens to generate per response (default: `512`).

### Command Line Arguments

- `--api-key <key>`: Specify your Anthropic API key.
- `--model <model>`: Specify the Claude model to use.
- `--temperature <value>`: Set the sampling temperature for response generation.
- `--max-tokens <number>`: Set the maximum number of tokens to generate per response.
- `--print`: Print the response to the console instead of opening an interactive session.

## Tools Integration

Claude Code integrates with the following research tools to enhance its capabilities:

### Lotus Data Analysis Tool

Lotus is an advanced data analysis framework that allows natural language querying of structured data. It combines the capabilities of pandas, SQL, and semantic search to enable complex data operations through simple English instructions.

**Key Capabilities:**

- Natural language data querying
- Semantic search and filtering
- Complex data transformations
- Statistical analysis and visualization
- Integration with various data sources
- Contextual understanding of data schemas

**Example Queries:**

- "Find documents discussing neural networks even if they don't use that exact term"
- "Which parts of our codebase relate to the ideas in this research paper?"
- "Discover connections between these technical concepts across our documentation"
- "Find implementations that match the approach described in this architecture"
- "Find the average age of users who made more than 5 purchases"
- "Identify outliers in the temperature readings from sensor data"
- "Create a timeseries analysis of stock prices with moving averages"
- "Extract sentiment trends from customer reviews over the past year"

**Usage Example:**

```bash
# Install Lotus
npm install @lotus-data/lotus

# Execute a Lotus query
lotus query "find correlations between variables X and Y" --data my_dataset.csv
```

### DocETL Document Processing Tool

DocETL is a framework for creating and executing LLM-powered document processing pipelines, designed for complex document analysis tasks. It provides a declarative YAML interface to define data operations on unstructured datasets.

**Key Operations:**

- **Map**: Transform individual documents using LLM reasoning
- **Reduce**: Combine multiple documents into aggregated insights
- **Resolve**: Perform entity resolution across documents
- **Filter**: Select documents based on LLM-powered criteria
- **Split/Gather**: Process large documents in manageable chunks

**Example Use Cases:**

- Extract methodologies, results, and conclusions from research papers
- Standardize terminology across medical records
- Identify citation patterns and research trends across publications
- Extract algorithms and convert mathematical notation to code

**Usage Example:**

```bash
# Install DocETL
pip install docetl

# Run a DocETL pipeline
docetl run pipeline.yaml

# Optimize a pipeline for large documents
docetl build pipeline.yaml

# Run an optimized pipeline  
docetl run pipeline_opt.yaml
```

**Example Pipeline:**

```yaml
# DocETL pipeline for research paper processing
default_model: claude-3-7-sonnet-20250219

datasets:
  papers:
    path: research_papers.json
    type: file

operations:
  - name: extract_algorithms
    type: map
    optimize: true
    output:
      schema:
        algorithms: "list[{name: string, description: string, pseudocode: string}]"
    prompt: |
      Extract algorithms from the research paper:
      {{ input.text }}

  - name: convert_to_code
    type: map
    prompt: |
      Convert this algorithm pseudocode to Python:
      {{ input.pseudocode }}
    output:
      schema:
        code: string
        complexity: string
        requirements: "list[string]"
```

## Advanced Usage

### Internal Tools and Features

Claude Code includes several advanced internal tools that enhance its capabilities:

#### Memory Tools
- **MemoryReadTool**: Access persistent memory across conversations
  ```
  /memory-read key="project_preferences"
  ```
- **MemoryWriteTool**: Store information persistently across sessions
  ```
  /memory-write key="preferred_libraries" value="{'react': 'preferred', 'vue': 'alternative'}"
  ```

#### Self-Improvement
- **SelfImproveTool**: Meta-programming for codebase analysis
  ```
  /self-improve analysis="architecture" scope="tools" depth="medium"
  ```
  
#### Context Visualization
- **ctx_viz**: Visualize context window usage and management
  ```
  /ctx-viz
  ```
  
#### Enhanced Resume
- **resume**: Advanced conversation resumption with checkpointing
  ```
  # To use in interactive mode:
  /resume checkpoint="experimental"
  
  # To use in command line mode:
  claude resume --checkpoint=experimental
  
  # To use with environment variable:
  CLAUDE_EXPERIMENTAL=1 claude resume
  ```
  
  Available checkpoint modes:
  - `experimental`: Access development snapshots and conversation branches
  - `deep`: Enable deep context recovery for complex conversations
  - `semantic`: Semantic-based conversation reconstruction
  
#### Voice Interaction
- **listen**: Voice interaction capability
  ```
  /listen
  ```

## Research Implementation Workflow

1. **Data Preparation**:
   - Process raw data with DocETL's map/filter operations
   - Standardize entities with resolve operations
   - Structure outputs with schema validation

2. **Analysis**:
   - Query processed data with Lotus
   - Perform statistical analyses and visualizations
   - Extract patterns and insights

3. **Implementation**:
   - Convert research algorithms to code
   - Create test cases and validation processes
   - Document implementation decisions

## Integration Examples

**Analyze Research Papers and Implement Algorithms**

```yaml
# DocETL pipeline for research paper processing
default_model: claude-3-7-sonnet-20250219

datasets:
  papers:
    path: research_papers.json
    type: file

operations:
  - name: extract_algorithms
    type: map
    optimize: true
    output:
      schema:
        algorithms: "list[{name: string, description: string, pseudocode: string}]"
    prompt: |
      Extract algorithms from the research paper:
      {{ input.text }}

  - name: convert_to_code
    type: map
    prompt: |
      Convert this algorithm pseudocode to Python:
      {{ input.pseudocode }}
    output:
      schema:
        code: string
        complexity: string
        requirements: "list[string]"
```

Then analyze the output with Lotus:
```
query: "Find algorithms with similar complexity patterns and group by approach"
```

### Model Context Protocol (MCP) Servers

Claude Code includes several custom MCP (Model Context Protocol) servers that extend its functionality:

#### GitHub Search Server

Allows searching GitHub repositories and extracting file structures and content.

**Tools:**

- `github-search__search_repositories`: Search for GitHub repositories matching a query
- `github-search__fetch_directory_structure`: Fetch the directory structure of a specific GitHub repository
- `github-search__fetch_file_content`: Fetch the content of a specific file in a GitHub repository

**Example Usage:**

```bash
# Search for repositories
claude "Find machine learning repositories on GitHub and analyze their structure"

# Clone specific directories from GitHub
claude "Clone the components directory from react-bootstrap repository and explain its architecture"
```

#### Architect Server

Provides tools for analyzing code architecture, generating project templates, and cloning GitHub directories.

**Tools:**

- `architect__analyze_structure`: Analyze a directory structure and provide insights
- `architect__generate_template`: Generate a project template (react, node-api, etc.)
- `architect__clone_github_directory`: Clone a specific directory from a GitHub repository

**Example Usage:**

```bash
# Generate a project template
claude "Create a React project template in the ./my-new-app directory"

# Analyze code architecture
claude "Analyze the architecture of the src directory and suggest improvements"
```

#### Terminal Capture Server

Captures terminal output and sends it to Claude for analysis.

**Tools:**

- `terminal_capture__capture_terminal`: Captures terminal output to a specified file path
- `terminal_capture__send_to_claude`: Sends a file containing terminal output to Claude API and returns the response

**Example Usage:**

```bash
# Capture terminal session and analyze it
claude "Capture my terminal session while I debug this application and analyze the output"

# Send existing terminal output to Claude
claude "Send the terminal output in debug.log to Claude and explain any errors"
```

**Setup Requirements:**

- An Anthropic API key in `.env` file (`ANTHROPIC_API_KEY=your_key_here`)
- Terminal capture currently works best on macOS

#### Sentry Server

Retrieves and analyzes issues from Sentry.io.

**Tools:**

- `sentry__get_issues`: Retrieve issues from Sentry.io
- `sentry__get_issue_details`: Get detailed information about a specific issue
- `sentry__analyze_errors`: Analyze error patterns across multiple issues

**Example Usage:**

```bash
# Get recent Sentry issues
claude "Show me the latest critical errors from our production environment in Sentry"

# Debug a specific error
claude "Analyze the root cause of Sentry issue ID-12345 and suggest fixes"
```

**Setup Requirements:**

- A Sentry.io auth token in `.env` file (`SENTRY_AUTH_TOKEN=your_token_here`)
- Sentry organization and project configuration

## Development

### Git History

```
# Latest changes first
2025-07-03: Added Terminal Capture MCP server for capturing and analyzing terminal output
2025-07-03: Added GitHub Search and Architect MCP servers
2025-07-03: Disabled stagehand MCP server by adding .mcprc file and rejecting it in project config
2025-04-03: Initialized claude.md with documentation of features and tools
2025-04-03: Added DocETL and Lotus tools to claude-code
2025-02-26: Update README.md (da716d7)
2025-02-26: Add all the original files from the deleted 0.2.8 npm package (ca97a02)
2025-02-25: Initial commit (8bf1bb8)
```

### Recent File Changes

```
# Major changes (latest first)
M README.md - Updated documentation
M src/screens/Doctor.tsx - Modified Doctor screen
M src/tools.ts - Added support for DocETL and Lotus tools
M src/utils/env.ts - Updated environment utilities
+ .mcprc - Added to disable stagehand MCP tool

# New files/directories
?? src/tools/DocETLTool/ - Added DocETL document processing tool
?? src/tools/LotusTool/ - Added Lotus data analysis tool
?? stagehand-mcp/ - Added Stagehand MCP functionality (disabled)
?? style-guide.md - Added style guide documentation
?? test-docetl-data.md - Added test data for DocETL
?? test-docetl-pipeline.yaml - Added test pipeline for DocETL  
?? test-lotus-data.csv - Added test data for Lotus
```

### Developer Guide

To contribute to the development of Claude Code, follow these steps:

1. **Fork the repository** on GitHub.
2. **Clone your fork**:
   ```bash
   git clone https://github.com/your-username/claude-code.git
   cd claude-code
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Create a new branch** for your changes:
   ```bash
   git checkout -b my-new-feature
   ```
5. **Make your changes** and commit them with descriptive messages.
6. **Push your changes** to your fork:
   ```bash
   git push origin my-new-feature
   ```
7. **Open a Pull Request** on the main repository.

### Troubleshooting

**Issue:** Claude Code is not responding or stuck in a loop.

**Solution:**

- Try restarting the process by pressing `Ctrl+C` and running `npm start` again.
- Check your API key and model configuration settings.
- If the issue persists, create a new issue on the GitHub repository with relevant logs.

**Issue:** Errors related to Lotus or DocETL tool integration.

**Solution:**

- Ensure you have installed the required dependencies (`@lotus-data/lotus` and `docetl`).
- Check the tool documentation for any specific setup or configuration steps.
- Verify that your data and pipeline files are correctly formatted.
- If the issue persists, create a new issue on the GitHub repository with relevant details.

**Issue:** Errors or unexpected behavior with MCP servers.

**Solution:**

- Ensure you have the required setup and permissions for the specific MCP server (e.g., API keys, GitHub access, etc.).
- Check the server configuration and tool documentation for any specific requirements.
- If the issue persists, create a new issue on the GitHub repository with relevant details and logs.

If you encounter any other issues or have suggestions for improvements, please create a new issue on the GitHub repository.