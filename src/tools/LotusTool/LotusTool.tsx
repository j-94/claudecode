import { Box, Text } from 'ink'
import React from 'react'
import { z } from 'zod'
import { Cost } from '../../components/Cost.js'
import { FallbackToolUseRejectedMessage } from '../../components/FallbackToolUseRejectedMessage.js'
import { Tool } from '../../Tool.js'
import { getCwd } from '../../utils/state.js'
import {
  getAbsolutePath,
  getAbsoluteAndRelativePaths,
  fileExists,
} from '../../utils/file.js'
import { CAPABILITIES, DESCRIPTION, TOOL_NAME_FOR_PROMPT, USAGE_EXAMPLES } from './prompt.js'
import { logError } from '../../utils/log.js'
import 'dotenv/config.js'

// Define a variable to track if the real implementation is available
let lotusPackageAvailable = false
let lotusInitialized = false
let Lotus: any = null

// Check for environment variables needed by Lotus
const LOTUS_API_KEY = process.env.LOTUS_API_KEY || process.env.OPENAI_API_KEY

// Initialize the Lotus environment
async function initializeLotusEnvironment() {
  if (lotusInitialized) return

  if (!LOTUS_API_KEY) {
    console.warn('No LOTUS_API_KEY or OPENAI_API_KEY found in environment. Lotus will use simulation mode.')
    return
  }

  try {
    // Try to set up the Lotus environment
    process.env.LOTUS_API_KEY = LOTUS_API_KEY
    
    // Setup bridge to the Python lotus package
    try {
      // Instead of require, use dynamic import with ESM
      const execModule = await import('child_process')
      const pathModule = await import('path')
      const { execSync } = execModule
      const { join } = pathModule
      
      const fs = await import('fs')
      
      // Get the script path in a way that works with ESM
      const modulePath = new URL(import.meta.url).pathname
      const scriptDir = pathModule.dirname(modulePath)
      const bridgeScript = join(scriptDir, 'LotusPythonBridge.py')
      
      console.log(`Looking for bridge script at: ${bridgeScript}`)
      
      // Make sure the bridge script exists
      if (!fs.existsSync(bridgeScript)) {
        console.warn(`Lotus Python bridge script not found at: ${bridgeScript}`)
        throw new Error(`Bridge script not found: ${bridgeScript}`)
      }
      
      // Test if we can run the bridge script
      const testResult = execSync(`python3 "${bridgeScript}" '{"test": true}'`).toString()
      const testJson = JSON.parse(testResult)
      
      if (testJson.status === 'ok') {
        Lotus = {
          // This is our bridge to the Python implementation
          Client: class LotusBridge {
            constructor(options) {
              this.options = options
            }
            
            async executeQuery(query) {
              try {
                // Re-import modules inside method to avoid ESM issues
                const { execSync } = await import('child_process')
                const pathModule = await import('path')
                const { join, dirname } = pathModule
                
                // Get the script path in a way that works with ESM
                const modulePath = new URL(import.meta.url).pathname
                const scriptDir = dirname(modulePath)
                const bridgeScript = join(scriptDir, 'LotusPythonBridge.py')
                
                const args = {
                  query: query,
                  data_path: this.options.dataPath,  // Match parameter names with Python bridge
                  dataSource: this.options.dataSource,
                  visualization: this.options.includeVisualization,
                  semantic_search: this.options.useSemanticSearch  // Match parameter names with Python bridge
                }
                
                console.log(`Executing Lotus query: ${query}`)
                console.log(`Data path: ${this.options.dataPath}`)
                
                const result = execSync(`python3 "${bridgeScript}" '${JSON.stringify(args).replace(/'/g, "\\'")}'`).toString()
                console.log('Lotus bridge executed successfully')
                
                try {
                  const resultJson = JSON.parse(result)
                  
                  if (resultJson.status === 'error') {
                    throw new Error(resultJson.message)
                  }
                  
                  return resultJson
                } catch (parseError) {
                  console.error('Error parsing bridge result:', parseError)
                  console.log('Raw bridge output:', result)
                  throw new Error(`Failed to parse bridge result: ${parseError.message}`)
                }
              } catch (error) {
                console.error('Error executing Python bridge:', error)
                throw new Error(`Failed to execute Lotus query: ${error.message}`)
              }
            }
          }
        }
        
        lotusPackageAvailable = true
        console.log('Lotus Python bridge loaded successfully')
      } else {
        console.warn('Lotus Python bridge test failed, using simulated results:', testJson.message)
      }
    } catch (error) {
      // Bridge not available, will use simulated results
      console.warn('Lotus Python bridge not available, using simulated results:', error.message)
    }
    
    lotusInitialized = true
  } catch (error) {
    console.error('Failed to initialize Lotus environment:', error)
  }
}

// Initialize environment with immediately-invoked async function
(async () => {
  try {
    await initializeLotusEnvironment()
    // Only log this message once
    if (!lotusInitialized) {
      console.log('Lotus environment initialized')
      // Set initialized to true so we don't attempt initialization again
      lotusInitialized = true
    }
  } catch (error) {
    console.error('Failed to initialize Lotus environment:', error)
  }
})()

const inputSchema = z.strictObject({
  query: z.string().describe('The natural language query to execute against your data'),
  dataPath: z.string().optional().describe('Path to data file or directory'),
  dataSource: z.string().optional().describe('Type of data source (csv, json, sql, etc.)'),
  visualization: z.boolean().optional().describe('Whether to include visualization in results'),
  semanticSearch: z.boolean().optional().describe('Whether to use semantic search capabilities')
})

type Input = typeof inputSchema
type Output = {
  result: any
  summary: string
  durationMs: number
}

export const LotusTool = {
  name: TOOL_NAME_FOR_PROMPT,
  async description() {
    return `${DESCRIPTION}\n\n${CAPABILITIES}\n\n${USAGE_EXAMPLES}`
  },
  userFacingName() {
    return 'Lotus'
  },
  inputSchema,
  isReadOnly() {
    return true
  },
  async isEnabled() {
    try {
      // Check if we already know Lotus is available
      if (lotusPackageAvailable) {
        return true
      }
      
      // First, try to use our Python bridge to Lotus
      try {
        // Use dynamic imports for ESM compatibility
        const execModule = await import('child_process')
        const pathModule = await import('path')
        const fs = await import('fs')
        const { execSync } = execModule
        const { join, dirname } = pathModule
        
        // Get the script path in a way that works with ESM
        const modulePath = new URL(import.meta.url).pathname
        const scriptDir = dirname(modulePath)
        const bridgeScript = join(scriptDir, 'LotusPythonBridge.py')
        
        // Check if the bridge script exists
        if (!fs.existsSync(bridgeScript)) {
          console.warn(`Lotus Python bridge script not found at: ${bridgeScript}`)
          throw new Error("Bridge script not found")
        }
        
        // Test if the Python bridge is available
        const testResult = execSync(`python3 "${bridgeScript}" '{"test": true}'`).toString()
        const testJson = JSON.parse(testResult)
        if (testJson.status === 'ok') {
          console.log('Lotus Python bridge is available')
          lotusPackageAvailable = true
          return true
        }
      } catch (error) {
        console.warn(`Lotus Python bridge test failed: ${error.message}`)
      }
      
      // Check if Python is available
      try {
        const execModule = await import('child_process')
        const { execSync } = execModule
        
        // Check if Python is installed and has pandas
        const pythonVersionResult = execSync('python3 -c "import pandas; import numpy; print(\'Python libraries available\')"').toString()
        if (pythonVersionResult.includes('Python libraries available')) {
          console.log('Python with required libraries is available - using simulated mode')
          return true
        }
      } catch (error) {
        console.warn(`Python check failed: ${error.message}`)
      }
      
      // Only enable if we can use the real Lotus
      console.warn('No Lotus implementation found. Tool will be disabled.')
      return false
    } catch (error) {
      console.warn(`Error checking Lotus availability: ${error.message}`)
      return false // Don't enable if we can't confirm Lotus availability
    }
  },
  needsPermissions({ dataPath }) {
    return dataPath ? !hasReadPermission(dataPath) : false
  },
  async prompt() {
    // Enhanced prompt that emphasizes natural language interface for semantic understanding
    return `${DESCRIPTION}\n\nUse natural language to explore and discover insights in your data and code:
- "Find documents that discuss similar concepts to this one, even with different terminology"
- "Which parts of our codebase relate to the ideas in this research paper?"
- "Discover connections between these technical concepts across our documentation"
- "Find implementations that match the approach described in this architecture"`
  },
  renderToolUseMessage({ query, dataPath, dataSource, visualization, semanticSearch }, { verbose }) {
    let message = `query: "${query}"`
    
    if (dataPath) {
      const { absolutePath, relativePath } = getAbsoluteAndRelativePaths(dataPath)
      message += `, dataPath: "${verbose ? absolutePath : relativePath}"`
    }
    
    if (dataSource) {
      message += `, dataSource: "${dataSource}"`
    }
    
    if (visualization !== undefined) {
      message += `, visualization: ${visualization}`
    }
    
    if (semanticSearch !== undefined) {
      message += `, semanticSearch: ${semanticSearch}`
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
          <Text>&nbsp;&nbsp;⎿ &nbsp;Query processed: </Text>
          <Text bold>{output.summary}</Text>
        </Box>
        <Cost costUSD={0} durationMs={output.durationMs} debug={false} />
      </Box>
    )
  },
  renderResultForAssistant(output) {
    try {
      // Format the result for the assistant
      if (typeof output.result === 'string') {
        return output.result
      } else {
        return JSON.stringify(output.result, null, 2)
      }
    } catch (error) {
      return `Error formatting result: ${error.message}`
    }
  },
  async *call({ query, dataPath, dataSource, visualization, semanticSearch }, { abortController }) {
    const start = Date.now()
    
    try {
      // Make sure we've tried to initialize the environment (only once)
      if (!lotusInitialized) {
        await initializeLotusEnvironment()
        lotusInitialized = true
      }
      
      // Debug info about environment
      const debugInfo = {
        lotusPackageAvailable,
        lotusInitialized,
        apiKeyAvailable: !!LOTUS_API_KEY,
        query,
        dataPath: dataPath || 'none',
        dataSource: dataSource || 'none',
        visualization: visualization || false,
        semanticSearch: semanticSearch || false
      }
      
      console.log('Lotus Tool Debug Info:', JSON.stringify(debugInfo, null, 2))
      
      let result;
      
      // Try different approaches to execute the query, in order of preference:
      // 1. Python bridge (direct integration with the Python lotus library)
      // 2. Native Lotus NPM package
      // 3. Fall back to simulation if all else fails
      
      // Approach 1: Try Python bridge first
      try {
        console.log('Attempting to use Python bridge to Lotus...')
        // Use dynamic imports for ESM compatibility
        const execModule = await import('child_process')
        const pathModule = await import('path')
        const fs = await import('fs')
        const { execSync } = execModule
        const { join, dirname } = pathModule
        
        // Get the script path in a way that works with ESM
        const modulePath = new URL(import.meta.url).pathname
        const scriptDir = dirname(modulePath)
        const bridgeScript = join(scriptDir, 'LotusPythonBridge.py')
        
        // Verify bridge script exists
        if (!fs.existsSync(bridgeScript)) {
          throw new Error(`Bridge script not found: ${bridgeScript}`)
        }
        
        // Validate dataPath if provided
        if (dataPath) {
          const absolutePath = getAbsolutePath(dataPath)
          if (!(await fileExists(absolutePath))) {
            throw new Error(`Data file not found: ${dataPath}`)
          }
          console.log(`Data file validated: ${absolutePath}`)
        } else {
          throw new Error('No data path provided for Lotus query')
        }
        
        // Prepare arguments for the bridge
        const args = {
          query: query,
          data_path: getAbsolutePath(dataPath),
          dataSource: dataSource,
          visualization: visualization || false,
          semantic_search: semanticSearch || false
        }
        
        console.log('Executing Python bridge with options:', JSON.stringify({
          ...args,
          data_path: args.data_path // Show the path, it's not sensitive
        }, null, 2))
        
        // Execute Python bridge
        const bridgeResult = execSync(`python3 "${bridgeScript}" '${JSON.stringify(args).replace(/'/g, "\\'")}'`).toString()
        console.log('Python bridge executed successfully')
        
        // Parse result
        try {
          // The Python bridge may emit multiple JSON objects, so we need to parse the last one
          const lines = bridgeResult.trim().split('\n')
          const lastLine = lines[lines.length - 1]
          result = JSON.parse(lastLine)
          
          // Add metadata to indicate this came through the Python bridge
          result = {
            ...result,
            metadata: {
              ...(result.metadata || {}),
              implementation: 'python_bridge',
              dataSource: dataPath,
              processingTime: `${Date.now() - start}ms`,
              timestamp: new Date().toISOString()
            }
          }
          console.log('Successfully parsed Python bridge result')
        } catch (parseError) {
          console.error('Error parsing Python bridge result:', parseError)
          console.log('Raw bridge output:', bridgeResult)
          throw new Error(`Failed to parse bridge result: ${parseError.message}`)
        }
      } catch (bridgeError) {
        console.warn('Python bridge failed, trying next approach:', bridgeError.message)
        
        // Approach 2: Try native Lotus NPM package
        if (lotusPackageAvailable && Lotus && LOTUS_API_KEY) {
          try {
            console.log('Attempting to use native Lotus NPM package...')
            
            // Initialize Lotus with appropriate options
            const options = {
              apiKey: LOTUS_API_KEY,
              dataPath: dataPath ? getAbsolutePath(dataPath) : undefined,
              dataSource: dataSource,
              includeVisualization: visualization || false,
              useSemanticSearch: semanticSearch || false,
            }
            
            // Create a Lotus client
            const lotusClient = new Lotus.Client(options)
            
            // Execute the query
            console.log(`Executing query via NPM package: "${query}"`)
            result = await lotusClient.executeQuery(query)
            console.log('Query executed successfully with NPM package')
            
            // Add metadata
            result = {
              ...result,
              metadata: {
                ...(result.metadata || {}),
                implementation: 'npm_package',
                dataSource: dataSource || (dataPath ? dataPath : 'default'),
                processingTime: `${Date.now() - start}ms`,
                timestamp: new Date().toISOString()
              }
            }
          } catch (npmError) {
            console.warn('Native NPM package failed:', npmError.message)
            throw npmError // Re-throw to fall back to simulation
          }
        } else {
          console.warn('NPM package not available, falling back to simulation')
          throw bridgeError // Re-throw to fall back to simulation
        }
      }
      
      // Don't use simulation mode, throw an error if real implementation fails
      if (!result) {
        console.log('All integration approaches failed')
        throw new Error('Failed to execute Lotus query with real implementation. Please check that Lotus is properly configured.')
      }
      
      // Prepare output
      const output = {
        result,
        summary: `Executed query: ${query}`,
        durationMs: Date.now() - start,
      }
      
      // Return result
      yield {
        type: 'result',
        resultForAssistant: this.renderResultForAssistant(output),
        data: output,
      }
    } catch (error) {
      console.error('Critical error in Lotus tool:', error)
      
      // Don't fall back to simulation, just return the error
      console.error('Error in Lotus tool:', error)
      yield {
        type: 'result',
        resultForAssistant: `Error executing query: ${error.message}`,
        data: { 
          error: error.message, 
          summary: `Failed to execute: ${query}`,
          durationMs: Date.now() - start 
        },
      }
    }
  },
}

// Helper function to determine query type
function determineQueryType(query: string): string {
  if (query.includes('correlation') || query.includes('relation')) {
    return 'correlation_analysis'
  } else if (query.includes('outlier') || query.includes('anomaly')) {
    return 'outlier_detection'
  } else if (query.includes('time series') || query.includes('trend')) {
    return 'time_series_analysis'
  } else if (query.includes('cluster') || query.includes('group')) {
    return 'clustering'
  } else if (query.includes('sentiment') || query.includes('opinion')) {
    return 'sentiment_analysis'
  } else {
    return 'general_analysis'
  }
}

// Helper functions
function hasReadPermission(path: string | undefined) {
  // This would need proper implementation based on your permissions system
  return true
}

// Function to generate simulated results when real implementation is not available
async function getSimulatedResult(query: string, dataPath?: string, dataSource?: string, visualization?: boolean, semanticSearch?: boolean) {
  const queryLower = query.toLowerCase()
  let simulatedResult
  
  if (queryLower.includes('correlation') || queryLower.includes('relation')) {
    simulatedResult = {
      correlationMatrix: {
        'feature1': { 'feature1': 1.0, 'feature2': 0.78, 'feature3': -0.21 },
        'feature2': { 'feature1': 0.78, 'feature2': 1.0, 'feature3': 0.15 },
        'feature3': { 'feature1': -0.21, 'feature2': 0.15, 'feature3': 1.0 }
      },
      significance: {
        'feature1_feature2': 'p < 0.001',
        'feature1_feature3': 'p = 0.12',
        'feature2_feature3': 'p = 0.34'
      },
      insights: [
        'Strong positive correlation between feature1 and feature2',
        'No significant correlation between feature1 and feature3',
        'Weak positive correlation between feature2 and feature3'
      ]
    }
  } else if (queryLower.includes('outlier') || queryLower.includes('anomaly')) {
    simulatedResult = {
      outliers: [
        { index: 14, value: 412.3, zscore: 3.8, feature: 'temperature' },
        { index: 57, value: -23.1, zscore: -4.2, feature: 'temperature' },
        { index: 103, value: 892.7, zscore: 5.1, feature: 'pressure' }
      ],
      method: 'Z-score (threshold = 3.0)',
      summary: '3 outliers detected out of 150 data points'
    }
  } else if (queryLower.includes('time series') || queryLower.includes('trend')) {
    simulatedResult = {
      timeSeries: [
        { date: '2024-01-01', value: 120, movingAvg: null },
        { date: '2024-01-02', value: 125, movingAvg: null },
        { date: '2024-01-03', value: 123, movingAvg: null },
        { date: '2024-01-04', value: 128, movingAvg: null },
        { date: '2024-01-05', value: 135, movingAvg: 126.2 },
        { date: '2024-01-06', value: 142, movingAvg: 130.6 },
        { date: '2024-01-07', value: 145, movingAvg: 134.6 }
      ],
      trendAnalysis: {
        overallTrend: 'Increasing',
        growthRate: '2.8% daily',
        seasonality: 'None detected',
        changePoints: ['2024-01-05']
      }
    }
  } else if (queryLower.includes('cluster') || queryLower.includes('group')) {
    simulatedResult = {
      clusters: [
        { id: 0, size: 42, centroid: [1.2, 3.4, 0.5], description: 'Low activity users' },
        { id: 1, size: 78, centroid: [4.5, 6.7, 0.8], description: 'Medium activity users' },
        { id: 2, size: 30, centroid: [8.9, 9.0, 7.6], description: 'High activity users' }
      ],
      method: 'K-means (k=3)',
      silhouetteScore: 0.72,
      withinClusterVariance: [12.3, 15.6, 8.9]
    }
  } else if (queryLower.includes('sentiment') || queryLower.includes('opinion')) {
    simulatedResult = {
      sentimentBreakdown: {
        positive: 156,
        neutral: 89,
        negative: 43
      },
      trends: [
        { month: 'Jan', positive: 45, neutral: 32, negative: 12 },
        { month: 'Feb', positive: 52, neutral: 28, negative: 15 },
        { month: 'Mar', positive: 59, neutral: 29, negative: 16 }
      ],
      topPositiveTerms: ['excellent', 'helpful', 'easy', 'quick', 'reliable'],
      topNegativeTerms: ['slow', 'difficult', 'confusing', 'expensive', 'buggy']
    }
  } else {
    // Default generic analysis
    simulatedResult = {
      summary: {
        recordCount: 288,
        features: 12,
        missingValues: 23,
        duplicates: 0
      },
      statistics: {
        numeric: {
          mean: { feature1: 42.5, feature2: 78.3, feature3: 12.9 },
          median: { feature1: 41.0, feature2: 76.5, feature3: 12.0 },
          std: { feature1: 4.3, feature2: 12.1, feature3: 2.8 }
        },
        categorical: {
          uniqueValues: { category1: 5, category2: 3 },
          mostCommon: { 
            category1: 'Value A (45%)', 
            category2: 'Value X (67%)' 
          }
        }
      },
      distributions: [
        'feature1: Normal distribution (p=0.78)',
        'feature2: Right-skewed distribution (skew=1.2)',
        'feature3: Bimodal distribution'
      ]
    }
  }
  
  // Add visualization if requested
  if (visualization) {
    simulatedResult.visualizations = {
      type: queryLower.includes('time series') ? 'Line Chart' : 
            queryLower.includes('correlation') ? 'Heatmap' : 
            queryLower.includes('cluster') ? 'Scatter Plot' :
            queryLower.includes('sentiment') ? 'Stacked Bar Chart' : 'Bar Chart',
      url: 'visualization_would_be_here.png',
      description: `Visualization for query: ${query}`
    }
  }
  
  // Add semantic search results if requested
  if (semanticSearch) {
    simulatedResult.semanticResults = {
      similarQueries: [
        { query: 'How does feature X relate to feature Y?', similarity: 0.89 },
        { query: 'What patterns exist in dataset Z?', similarity: 0.76 },
        { query: 'Analyze the relationship between A and B', similarity: 0.71 }
      ],
      relevanceScore: 0.92,
      contextualInsights: [
        'This analysis is related to previous queries about feature correlations',
        'Consider examining feature X in more detail based on these results'
      ]
    }
  }
  
  // Add data source info
  simulatedResult.metadata = {
    queryType: determineQueryType(queryLower),
    implementation: 'simulated',
    dataSource: dataSource || (dataPath ? dataPath : 'simulated_data'),
    processingTime: `${Date.now() - new Date().getTime()}ms`,
    timestamp: new Date().toISOString()
  }
  
  return simulatedResult
}