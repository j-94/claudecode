import { Box, Text } from 'ink'
import React from 'react'
import { z } from 'zod'
import { Cost } from '../../components/Cost.js'
import { FallbackToolUseRejectedMessage } from '../../components/FallbackToolUseRejectedMessage.js'
import { Tool } from '../../Tool.js'
import { getCwd } from '../../utils/state.js'
import { logError } from '../../utils/log.js'
import { DESCRIPTION, CAPABILITIES, USAGE_EXAMPLES } from './prompt.js'
import { LotusTool } from '../LotusTool/LotusTool.js'
import { DocETLTool } from '../DocETLTool/DocETLTool.js'
import { GlobTool } from '../GlobTool/GlobTool.js'
import { fileExists, getAbsolutePath } from '../../utils/file.js'
import { ToolUseContext } from '../../Tool.js'
import { getAnthropicApiKey } from '../../utils/config.js'
import { join } from 'path'
import { randomUUID } from 'crypto'
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs'

const inputSchema = z.strictObject({
  analysisType: z.enum(['codebase', 'architecture', 'performance', 'extensibility', 'custom']),
  targetPath: z.string().optional().describe('Path to analyze, defaults to current directory'),
  customPrompt: z.string().optional().describe('Custom analysis prompt when using the custom analysis type'),
  outputFormat: z.enum(['json', 'markdown', 'yaml']).optional().default('markdown'),
  depthLevel: z.enum(['shallow', 'medium', 'deep']).optional().default('medium'),
  scope: z.string().optional().describe('Optional scope to limit analysis, e.g. "tools", "commands"')
})

type Input = z.infer<typeof inputSchema>
type Output = {
  result: any
  summary: string
  durationMs: number
}

// Cache directory for analysis results
const CACHE_DIR = join(getCwd(), '.claude-analysis-cache')

export const SelfImproveTool: Tool = {
  name: 'SelfImproveTool',
  async description() {
    return `${DESCRIPTION}\n\n${CAPABILITIES}\n\n${USAGE_EXAMPLES}`
  },
  userFacingName() {
    return 'SelfImprove'
  },
  inputSchema,
  isReadOnly() {
    return true
  },
  async isEnabled() {
    try {
      // Make sure required API keys are available
      const apiKey = getAnthropicApiKey()
      
      // Check if Lotus and DocETL tools are available
      const lotusEnabled = await LotusTool.isEnabled()
      const docETLEnabled = await DocETLTool.isEnabled()
      
      // All dependencies must be enabled for this tool to work
      return !!apiKey && lotusEnabled && docETLEnabled
    } catch (error) {
      logError(`Error checking SelfImproveTool availability: ${error}`)
      return false
    }
  },
  needsPermissions({ targetPath }) {
    return targetPath ? !hasReadPermission(targetPath) : false
  },
  async prompt() {
    return `Use this tool to analyze and improve Claude Code's own codebase. It leverages Lotus and DocETL to understand code architecture, identify patterns, and suggest improvements.

Key capabilities:
- Analyzing codebase architecture and patterns
- Identifying optimization opportunities
- Suggesting feature extensions
- Discovering implementation patterns for new features

Example usage:
- "Analyze the tools integration architecture in our codebase"
- "Identify bottlenecks in our error handling system"
- "Discover patterns for implementing new CLI commands"
- "Generate a self-improvement plan for Claude Code"
`
  },
  renderToolUseMessage({ analysisType, targetPath, customPrompt, outputFormat, depthLevel, scope }, { verbose }) {
    let message = `analysis: "${analysisType}"`
    
    if (targetPath) {
      message += `, targetPath: "${targetPath}"`
    }
    
    if (customPrompt) {
      message += `, customPrompt: "${customPrompt}"`
    }
    
    if (outputFormat !== 'markdown') {
      message += `, outputFormat: "${outputFormat}"`
    }
    
    if (depthLevel !== 'medium') {
      message += `, depthLevel: "${depthLevel}"`
    }
    
    if (scope) {
      message += `, scope: "${scope}"`
    }
    
    return message
  },
  renderToolUseRejectedMessage() {
    return <FallbackToolUseRejectedMessage />
  },
  renderToolResultMessage(output) {
    // Handle string content for backward compatibility
    if (typeof output === 'string') {
      output = JSON.parse(output) as Output
    }

    return (
      <Box justifyContent="space-between" width="100%">
        <Box flexDirection="row">
          <Text>&nbsp;&nbsp;⎿ &nbsp;Analysis complete: </Text>
          <Text bold>{output.summary}</Text>
        </Box>
        <Cost costUSD={0} durationMs={output.durationMs} debug={false} />
      </Box>
    )
  },
  renderResultForAssistant(output) {
    try {
      if (typeof output.result === 'string') {
        return output.result
      } else {
        return JSON.stringify(output.result, null, 2)
      }
    } catch (error) {
      return `Error formatting result: ${error.message}`
    }
  },
  async *call(input: Input, context: ToolUseContext) {
    const start = Date.now()
    
    try {
      // Ensure cache directory exists
      if (!existsSync(CACHE_DIR)) {
        mkdirSync(CACHE_DIR, { recursive: true })
      }
      
      // Determine target path
      const targetPath = input.targetPath 
        ? getAbsolutePath(input.targetPath)
        : getCwd()
      
      // Generate a cache key based on inputs
      const cacheKey = `${input.analysisType}-${input.depthLevel}-${input.scope || 'all'}-${input.outputFormat}`
      const cacheFile = join(CACHE_DIR, `${cacheKey}.json`)
      
      // Check if we have a cached result that's less than 24 hours old
      if (existsSync(cacheFile)) {
        const stats = existsSync(cacheFile) ? new Date((readFileSync(cacheFile)).mtime) : null
        const cacheAge = stats ? Date.now() - stats.getTime() : Infinity
        const MAX_CACHE_AGE = 24 * 60 * 60 * 1000 // 24 hours
        
        if (cacheAge < MAX_CACHE_AGE) {
          const cachedResult = JSON.parse(readFileSync(cacheFile, 'utf8'))
          
          yield {
            type: 'result',
            resultForAssistant: this.renderResultForAssistant(cachedResult),
            data: cachedResult,
          }
          
          return
        }
      }
      
      // Step 1: Use GlobTool to identify relevant files for analysis
      const globResults = await collectFilesForAnalysis(input, targetPath, context)
      
      // Step 2: Use Lotus for semantic understanding of the codebase
      const lotusResults = await analyzeLotusPatterns(input, targetPath, context)
      
      // Step 3: Use DocETL to process and analyze the code
      const docETLResults = await analyzeThroughDocETL(input, targetPath, context)
      
      // Step 4: Combine and process the results
      const combinedResults = await processResults(input, globResults, lotusResults, docETLResults)
      
      // Cache the results
      writeFileSync(cacheFile, JSON.stringify(combinedResults, null, 2))
      
      // Return the processed results
      const output = {
        result: combinedResults,
        summary: `Completed ${input.analysisType} analysis at ${input.depthLevel} depth`,
        durationMs: Date.now() - start,
      }
      
      yield {
        type: 'result',
        resultForAssistant: this.renderResultForAssistant(output),
        data: output,
      }
    } catch (error) {
      logError(`Error in SelfImproveTool: ${error}`)
      
      yield {
        type: 'result',
        resultForAssistant: `Error performing analysis: ${error.message}`,
        data: { 
          error: error.message, 
          summary: `Failed to complete ${input.analysisType} analysis`,
          durationMs: Date.now() - start
        },
      }
    }
  },
}

// Helper function to check read permissions
function hasReadPermission(path: string): boolean {
  try {
    return existsSync(path) && true
  } catch {
    return false
  }
}

// Helper function to collect files for analysis
async function collectFilesForAnalysis(input: Input, targetPath: string, context: ToolUseContext): Promise<string[]> {
  const patterns = []
  
  // Determine file patterns based on analysis type and scope
  if (input.scope) {
    patterns.push(`**/${input.scope}/**/*.(ts|tsx|js|jsx)`)
  } else {
    patterns.push('**/*.(ts|tsx|js|jsx)')
  }
  
  // Exclude node_modules, build artifacts, etc.
  const excludePatterns = ['**/node_modules/**', '**/dist/**', '**/build/**']
  
  // Use GlobTool to collect relevant files
  const files = []
  for (const pattern of patterns) {
    for await (const result of GlobTool.call({ pattern, path: targetPath }, context)) {
      if (result.type === 'result' && result.data.files) {
        files.push(...result.data.files)
      }
    }
  }
  
  return files
}

// Helper function to analyze codebase with Lotus
async function analyzeLotusPatterns(input: Input, targetPath: string, context: ToolUseContext): Promise<any> {
  // Prepare Lotus query based on analysis type
  let query
  
  switch (input.analysisType) {
    case 'codebase':
      query = 'Analyze the overall codebase architecture and identify core components and their relationships'
      break
    case 'architecture':
      query = 'Identify the key architectural patterns used in the codebase, focusing on how components interact'
      break
    case 'performance':
      query = 'Locate potential performance bottlenecks and optimization opportunities in the codebase'
      break
    case 'extensibility':
      query = 'Analyze how the codebase can be extended and identify patterns for adding new features'
      break
    case 'custom':
      query = input.customPrompt || 'Analyze the codebase'
      break
  }
  
  // Enhance query with scope if provided
  if (input.scope) {
    query += ` (focusing on the ${input.scope} area)`
  }
  
  // Add depth level to the query
  if (input.depthLevel === 'shallow') {
    query += ' (high-level overview)'
  } else if (input.depthLevel === 'deep') {
    query += ' (detailed in-depth analysis)'
  }
  
  // Execute Lotus query
  const lotusResults = []
  for await (const result of LotusTool.call({ 
    query, 
    dataPath: targetPath,
    semanticSearch: true
  }, context)) {
    if (result.type === 'result' && result.data) {
      lotusResults.push(result.data)
    }
  }
  
  return lotusResults
}

// Helper function to analyze codebase with DocETL
async function analyzeThroughDocETL(input: Input, targetPath: string, context: ToolUseContext): Promise<any> {
  // Create a temporary pipeline file
  const pipelinePath = join(CACHE_DIR, `pipeline-${randomUUID()}.yaml`)
  const pipelineContent = generateDocETLPipeline(input)
  
  writeFileSync(pipelinePath, pipelineContent)
  
  // Execute DocETL pipeline
  const docETLResults = []
  for await (const result of DocETLTool.call({
    operation: 'run',
    dataPath: targetPath,
    pipelinePath,
    optimize: true
  }, context)) {
    if (result.type === 'result' && result.data) {
      docETLResults.push(result.data)
    }
  }
  
  return docETLResults
}

// Helper function to generate DocETL pipeline
function generateDocETLPipeline(input: Input): string {
  const depth = input.depthLevel === 'shallow' ? 'Overview' : 
               input.depthLevel === 'deep' ? 'Detailed' : 'Standard'
  
  const analysisType = input.analysisType === 'custom' ? 'Custom' : 
                      input.analysisType.charAt(0).toUpperCase() + input.analysisType.slice(1)
  
  const prompt = input.customPrompt || `Analyze the codebase for ${analysisType} insights`
  
  // Generate pipeline YAML
  return `
default_model: claude-3-7-sonnet-20250219

datasets:
  code:
    path: ./
    type: directory

operations:
  - name: extract_structure
    type: map
    optimize: true
    output:
      schema:
        components: "list[{name: string, type: string, responsibility: string}]"
        architecture: "object"
        patterns: "list[string]"
    prompt: |
      Analyze this code and extract the key components, architecture and patterns:
      {{ input.text }}

  - name: identify_integration_points
    type: map
    input: extract_structure.output
    output:
      schema:
        integration_points: "list[{source: string, target: string, relationship: string}]"
        improvement_opportunities: "list[string]"
    prompt: |
      Based on this code analysis, identify the integration points between components
      and potential improvement opportunities:
      {{ input }}

  - name: generate_${input.outputFormat}_report
    type: reduce
    input: identify_integration_points.output
    output:
      format: ${input.outputFormat}
    prompt: |
      Create a ${depth} ${analysisType} Analysis report that explains how the components integrate
      and identifies improvement opportunities:
      
      Analysis depth: ${input.depthLevel}
      ${input.scope ? `Analysis scope: ${input.scope}` : ''}
      
      ${prompt}
      
      Input: {{ input }}
`
}

// Helper function to process and combine results
async function processResults(
  input: Input, 
  globResults: string[], 
  lotusResults: any[], 
  docETLResults: any[]
): Promise<any> {
  // Process results based on output format
  switch (input.outputFormat) {
    case 'json':
      return {
        analysisType: input.analysisType,
        depthLevel: input.depthLevel,
        scope: input.scope || 'all',
        timestamp: new Date().toISOString(),
        filesAnalyzed: globResults.length,
        lotusInsights: lotusResults,
        docETLAnalysis: docETLResults
      }
    case 'yaml':
      // Convert to JSON and then to YAML format
      return {
        analysisType: input.analysisType,
        depthLevel: input.depthLevel,
        scope: input.scope || 'all',
        timestamp: new Date().toISOString(),
        filesAnalyzed: globResults.length,
        lotusInsights: lotusResults,
        docETLAnalysis: docETLResults
      }
    case 'markdown':
    default:
      // Format as markdown
      let markdown = `# ${input.analysisType.charAt(0).toUpperCase() + input.analysisType.slice(1)} Analysis Report\n\n`
      markdown += `- **Analysis Type:** ${input.analysisType}\n`
      markdown += `- **Depth Level:** ${input.depthLevel}\n`
      markdown += `- **Scope:** ${input.scope || 'Full Codebase'}\n`
      markdown += `- **Files Analyzed:** ${globResults.length}\n`
      markdown += `- **Timestamp:** ${new Date().toISOString()}\n\n`
      
      markdown += `## Key Insights\n\n`
      
      // Add Lotus insights
      if (lotusResults.length > 0) {
        markdown += `### Semantic Analysis\n\n`
        lotusResults.forEach(result => {
          if (typeof result === 'object') {
            markdown += JSON.stringify(result, null, 2) + '\n\n'
          } else {
            markdown += result + '\n\n'
          }
        })
      }
      
      // Add DocETL analysis
      if (docETLResults.length > 0) {
        markdown += `### Structural Analysis\n\n`
        docETLResults.forEach(result => {
          if (typeof result === 'object') {
            markdown += JSON.stringify(result, null, 2) + '\n\n'
          } else {
            markdown += result + '\n\n'
          }
        })
      }
      
      return markdown
  }
}