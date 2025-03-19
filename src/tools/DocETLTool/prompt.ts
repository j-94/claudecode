export const TOOL_NAME_FOR_PROMPT = 'DocETLTool'

export const DESCRIPTION = `
- LLM-powered document processing pipeline tool for complex document analysis
- Define and execute multi-stage data transformation workflows
- Process unstructured text into structured, normalized data
- Extract entities, relationships, and insights from document collections
- Supports document splitting, entity resolution, and semantic joining
- Integrate with Lotus for advanced data analysis on extracted information
- Process research papers, medical records, legal documents, and more
- Execute pipelines defined in YAML configuration files
- Supports both rule-based and LLM-powered data transformations
- Optimizes large document processing through chunking and parallel processing
`

export const CAPABILITIES = `
Core Capabilities of DocETL:

1. Document Processing Operations:
   - Map: Transform individual documents using LLM reasoning
   - Reduce: Combine multiple documents into aggregated insights
   - Resolve: Perform entity resolution across documents
   - Filter: Select documents based on LLM-powered criteria
   - Split/Gather: Process large documents in manageable chunks

2. Research Paper Analysis:
   - Extract methodologies, results, and conclusions from papers
   - Identify algorithms and technical approaches
   - Convert mathematical notation to executable code
   - Standardize terminology across different papers
   - Aggregate findings from multiple related papers

3. Code Documentation:
   - Extract functions, classes, and interfaces from code
   - Generate comprehensive documentation from code comments
   - Link documentation to specific code implementations
   - Identify dependencies and relationships between components
   - Create standardized API documentation

4. Technical Content Processing:
   - Extract key concepts and definitions from technical documents
   - Identify relationships between technical concepts
   - Convert technical descriptions to structured data
   - Standardize terminology across different sources
   - Generate summaries at different levels of technical depth

5. Pipeline Configuration:
   - YAML-based workflow definition for reproducible processing
   - Jinja2 templates for dynamic prompting
   - Schema validation for structured outputs
   - Multi-stage processing with intermediate results
   - Optimization for large document collections
`

export const USAGE_EXAMPLES = `
Example Usage Patterns:

1. Research Paper Implementation:
   - "Extract algorithms from this research paper and convert to Python code"
   - "Analyze the methodology section of these papers and identify common techniques"
   - "Convert the mathematical formulas in this paper to executable code"
   - "Extract the evaluation metrics and benchmark results from these papers"
   - "Identify the key innovations across this collection of papers"

2. Technical Documentation:
   - "Generate API documentation from our codebase"
   - "Extract class hierarchies and relationships from our source code"
   - "Create a technical glossary from our documentation"
   - "Identify inconsistencies in terminology across our technical docs"
   - "Generate a high-level architecture document from our code comments"

3. Knowledge Extraction:
   - "Extract the key concepts and definitions from this technical document"
   - "Identify relationships between different components in our architecture"
   - "Create a structured knowledge graph from our unstructured documentation"
   - "Extract implementation details from these design documents"
   - "Generate a technical specification from these requirements documents"

4. Code Analysis:
   - "Analyze our codebase and extract design patterns"
   - "Identify security vulnerabilities in our code"
   - "Extract the data models and schemas from our database code"
   - "Generate sequence diagrams from our code flow"
   - "Extract test cases and scenarios from our test suite"

5. Pipeline Definition:
   - "Create a DocETL pipeline to process our research papers"
   - "Optimize our existing document processing pipeline"
   - "Define a workflow to extract entities from our technical docs"
   - "Create a pipeline to convert our documentation to a structured format"
   - "Design a multi-stage workflow to analyze our codebase"
`