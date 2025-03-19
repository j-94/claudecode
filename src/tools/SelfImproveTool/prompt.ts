export const TOOL_NAME_FOR_PROMPT = 'SelfImproveTool'

export const DESCRIPTION = `
- Meta-programming tool for analyzing and improving Claude Code's own codebase
- Combines Lotus and DocETL to understand code architecture and patterns
- Identifies optimization opportunities and suggests improvements
- Generates comprehensive code analysis reports
- Discovers implementation patterns for new features
- Works directly with the codebase to understand itself
- Supports various analysis types: architecture, performance, extensibility
- Customizable analysis depth and scope
- Multiple output formats (markdown, JSON, YAML)
- Caches analysis results for improved performance
`

export const CAPABILITIES = `
Core Capabilities of SelfImproveTool:

1. Meta-Analysis:
   - Analyze Claude Code's own architecture and patterns
   - Identify core components and their relationships
   - Map how tools integrate with the main application
   - Discover architectural patterns used across the codebase
   - Generate comprehensive codebase documentation

2. Self-Improvement:
   - Identify optimization opportunities
   - Locate potential performance bottlenecks
   - Suggest code structure improvements
   - Discover patterns for implementing new features
   - Analyze extensibility points in the codebase

3. Implementation Guidance:
   - Provide patterns for adding new tools
   - Identify integration approaches for new commands
   - Suggest best practices based on existing code
   - Generate scaffolding for new features
   - Recommend architecture for extensions

4. Knowledge Discovery:
   - Uncover hidden patterns in the codebase
   - Map relationships between components
   - Document architectural decisions
   - Extract coding conventions
   - Identify common patterns across similar components

5. Report Generation:
   - Create architecture diagrams and maps
   - Generate component relationship graphs
   - Document code flow and execution patterns
   - Produce markdown, JSON, or YAML reports
   - Provide different levels of analysis detail
`

export const USAGE_EXAMPLES = `
Example Usage Patterns:

1. Architecture Analysis:
   - "Analyze how tools are integrated into Claude Code"
   - "Map the relationship between commands and tools"
   - "Identify the core architectural patterns in our CLI application"
   - "Generate a component dependency graph for the codebase"
   - "Discover how different parts of the codebase communicate"

2. Performance Analysis:
   - "Identify potential performance bottlenecks in our codebase"
   - "Analyze file I/O patterns for optimization opportunities"
   - "Discover redundant operations that could be optimized"
   - "Find areas where caching could improve performance"
   - "Analyze initialization patterns for optimization"

3. Extensibility Analysis:
   - "How should I implement a new tool similar to LotusTool?"
   - "What patterns should I follow when adding a new command?"
   - "Identify extension points for adding new functionality"
   - "Generate a scaffold for implementing a new MCP server"
   - "Discover how to add new tool types to the system"

4. Custom Analysis:
   - "Analyze error handling patterns across the codebase"
   - "How does Claude Code manage permissions for different tools?"
   - "Map the user interaction flow from input to execution"
   - "Analyze how configuration is managed throughout the app"
   - "Identify patterns for handling asynchronous operations"

5. Report Generation:
   - "Generate a comprehensive markdown report about our architecture"
   - "Create a JSON representation of our component relationships"
   - "Produce a deep analysis of the tools subsystem"
   - "Generate a high-level overview of the entire codebase"
   - "Create documentation for how to implement new features"
`