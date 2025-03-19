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
let docETLPackageAvailable = false
let docETLInitialized = false
let DocETL: any = null

// Check for environment variables needed by DocETL
const DOCETL_API_KEY = process.env.DOCETL_API_KEY || process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY
const DOCETL_MODEL = process.env.DOCETL_MODEL || 'gpt-4'

// Initialize the DocETL environment
function initializeDocETLEnvironment() {
  if (docETLInitialized) return

  if (!DOCETL_API_KEY) {
    console.warn('No DOCETL_API_KEY, OPENAI_API_KEY, or ANTHROPIC_API_KEY found in environment. DocETL will use simulation mode.')
    return
  }

  try {
    // Try to set up the DocETL environment
    process.env.DOCETL_API_KEY = DOCETL_API_KEY
    process.env.DOCETL_MODEL = DOCETL_MODEL
    
    // Try to import the DocETL package if available
    try {
      DocETL = require('docetl')
      docETLPackageAvailable = true
      console.log('DocETL package loaded successfully')
    } catch (error) {
      // Package not available, will use simulated results
      console.warn('DocETL package not available, using simulated results')
    }
    
    docETLInitialized = true
  } catch (error) {
    console.error('Failed to initialize DocETL environment:', error)
  }
}

// Initialize environment (only once)
if (!docETLInitialized) {
  initializeDocETLEnvironment()
}

const inputSchema = z.strictObject({
  operation: z.string().describe('The DocETL operation to perform (map, reduce, resolve, filter, etc.)'),
  pipelinePath: z.string().optional().describe('Path to YAML pipeline definition file'),
  dataPath: z.string().optional().describe('Path to input data file or directory'),
  outputPath: z.string().optional().describe('Path to write output data'),
  prompt: z.string().optional().describe('Custom prompt to use for the operation'),
  schema: z.string().optional().describe('Output schema definition in JSON format'),
  optimize: z.boolean().optional().describe('Whether to optimize the pipeline')
})

type Input = typeof inputSchema
type Output = {
  result: any
  summary: string
  durationMs: number
}

export const DocETLTool = {
  name: TOOL_NAME_FOR_PROMPT,
  async description() {
    return `${DESCRIPTION}\n\n${CAPABILITIES}\n\n${USAGE_EXAMPLES}`
  },
  userFacingName() {
    return 'DocProcessor'
  },
  inputSchema,
  isReadOnly() {
    return false // Can write output files
  },
  async isEnabled() {
    // If we already know DocETL is available, avoid redundant checks
    if (docETLPackageAvailable) {
      return true
    }
    
    try {
      // Try to check if our Python virtual environment with DocETL is available
      // Use Node.js built-in module directly to avoid dynamic require
      const { execSync } = require('child_process')
      
      try {
        // Get current working directory for relative paths
        const cwd = process.cwd()
        console.log('Current working directory:', cwd)
        
        // Check if our virtual environment exists (using relative path)
        const venvPath = `${cwd}/docetl-env311`
        const output = execSync(`ls -la ${venvPath}`).toString()
        console.log('DocETL virtual environment found, checking if docetl is installed')
        
        // Try to run docetl from the virtual environment
        const docetlVersion = execSync(`source ${venvPath}/bin/activate && python -c "import docetl; print(docetl.__version__)"`).toString().trim()
        console.log(`DocETL package found, version: ${docetlVersion}`)
        docETLPackageAvailable = true
        return true
      } catch (error) {
        console.warn(`DocETL Python environment check failed: ${error.message}`)
        return false
      }
    } catch (error) {
      // Only log this message once
      if (!docETLInitialized) {
        console.warn('DocETL package not available. Tool will be disabled.')
      }
      return false // Don't enable if DocETL package is not available
    }
  },
  needsPermissions({ dataPath, outputPath, pipelinePath }) {
    // Check permissions for all paths that might be accessed
    const paths = [dataPath, outputPath, pipelinePath].filter(Boolean) as string[]
    return paths.some(path => !hasReadPermission(path))
  },
  async prompt() {
    return DESCRIPTION
  },
  renderToolUseMessage({ operation, pipelinePath, dataPath, outputPath, prompt, schema, optimize }, { verbose }) {
    let message = `operation: "${operation}"`
    
    if (pipelinePath) {
      const { absolutePath, relativePath } = getAbsoluteAndRelativePaths(pipelinePath)
      message += `, pipelinePath: "${verbose ? absolutePath : relativePath}"`
    }
    
    if (dataPath) {
      const { absolutePath, relativePath } = getAbsoluteAndRelativePaths(dataPath)
      message += `, dataPath: "${verbose ? absolutePath : relativePath}"`
    }
    
    if (outputPath) {
      const { absolutePath, relativePath } = getAbsoluteAndRelativePaths(outputPath)
      message += `, outputPath: "${verbose ? absolutePath : relativePath}"`
    }
    
    if (prompt) {
      message += `, prompt: "${prompt.substring(0, 30)}${prompt.length > 30 ? '...' : ''}"`
    }
    
    if (schema) {
      message += `, schema: defined`
    }
    
    if (optimize !== undefined) {
      message += `, optimize: ${optimize}`
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
          <Text>&nbsp;&nbsp;⎿ &nbsp;DocETL operation: </Text>
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
  async *call({ operation, pipelinePath, dataPath, outputPath, prompt, schema, optimize }, { abortController }) {
    const start = Date.now()
    
    try {
      // Make sure we've tried to initialize the environment (only once)
      if (!docETLInitialized) {
        initializeDocETLEnvironment()
        docETLInitialized = true
      }
      
      // Debug info about environment
      const debugInfo = {
        docETLPackageAvailable,
        docETLInitialized,
        apiKeyAvailable: !!DOCETL_API_KEY,
        model: DOCETL_MODEL,
        operation,
        pipelinePath: pipelinePath || 'none',
        dataPath: dataPath || 'none',
        outputPath: outputPath || 'none',
        hasPrompt: !!prompt,
        hasSchema: !!schema,
        optimize: optimize || false
      }
      
      console.log('DocETL Tool Debug Info:', JSON.stringify(debugInfo, null, 2))
      
      let result;
      
      // Attempt to use the real DocETL implementation if available
      if (docETLPackageAvailable && DocETL && DOCETL_API_KEY) {
        try {
          console.log('Attempting to use real DocETL implementation...')
          
          // Validate paths if provided
          const pathsToCheck = [dataPath, pipelinePath].filter(Boolean) as string[]
          for (const path of pathsToCheck) {
            const absolutePath = getAbsolutePath(path)
            // For input files, check they exist
            if (!(await fileExists(absolutePath))) {
              throw new Error(`File not found: ${path}`)
            }
            console.log(`File validated: ${absolutePath}`)
          }
          
          // Initialize DocETL with the operation
          const options = {
            apiKey: DOCETL_API_KEY,
            model: DOCETL_MODEL,
            operation: operation.toLowerCase(),
            pipelineFile: pipelinePath ? getAbsolutePath(pipelinePath) : undefined,
            dataPath: dataPath ? getAbsolutePath(dataPath) : undefined,
            outputPath: outputPath ? getAbsolutePath(outputPath) : undefined,
            optimizePipeline: optimize || false,
          }
          
          console.log('Creating DocETL client with options:', JSON.stringify({
            ...options,
            apiKey: options.apiKey ? '[REDACTED]' : undefined
          }, null, 2))
          
          const docETLClient = new DocETL.Client(options)
          
          // If a custom prompt is provided, use it
          if (prompt) {
            console.log(`Setting custom prompt: "${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}"`)
            docETLClient.setPrompt(prompt)
          }
          
          // If a schema is provided, use it
          if (schema) {
            console.log('Setting custom schema')
            docETLClient.setSchema(schema)
          }
          
          // Execute the operation
          console.log(`Executing operation: "${operation}"`)
          result = await docETLClient.execute()
          console.log('Operation executed successfully with real implementation')
          
          // If we got this far, the real implementation worked
          result = {
            ...result,
            metadata: {
              ...(result.metadata || {}),
              implementation: 'real',
              duration: Date.now() - start
            }
          }
        } catch (docETLError) {
          // Log the error and don't fall back to simulation
          console.error('Error using real DocETL implementation:', docETLError)
          logError(`Error using real DocETL implementation: ${docETLError.message}.`)
          docETLError.stack && logError(docETLError.stack)
          
          // Don't fall back to simulation, just throw the error
          throw docETLError
        }
      } else {
        // Try to use our Python virtual environment with DocETL
        console.log('Trying to use DocETL virtual environment')
        
        try {
          // Use Node.js built-in module directly to avoid dynamic require
          const { execSync } = require('child_process')
          const fs = require('fs')
          const path = require('path')
          
          // Validate paths if provided
          const pathsToCheck = [dataPath, pipelinePath].filter(Boolean) as string[]
          for (const p of pathsToCheck) {
            const absolutePath = path.resolve(p)
            if (!fs.existsSync(absolutePath)) {
              throw new Error(`File not found: ${p}`)
            }
            console.log(`File validated: ${absolutePath}`)
          }
          
          // Create a temporary YAML pipeline file if one wasn't provided
          let tempPipelineFile = null
          if (!pipelinePath) {
            tempPipelineFile = `/tmp/docetl_pipeline_${Date.now()}.yaml`
            const pipelineContent = `
default_model: ${DOCETL_MODEL || 'gpt-4o-mini'}

datasets:
  documents:
    path: "${dataPath ? path.resolve(dataPath) : 'data.json'}"
    type: file

operations:
  - name: process_documents
    type: ${operation.toLowerCase()}
    ${optimize ? 'optimize: true' : ''}
    ${prompt ? `prompt: |\n      ${prompt.replace(/\n/g, '\n      ')}` : ''}
    ${schema ? `output:\n      schema: ${schema}` : ''}

pipeline:
  steps:
    - name: document_processing
      input: documents
      operations:
        - process_documents
  output:
    type: file
    path: ${outputPath || 'docetl_output.json'}
    intermediate_dir: intermediate_results
`
            fs.writeFileSync(tempPipelineFile, pipelineContent)
            console.log(`Created temporary pipeline file: ${tempPipelineFile}`)
            pipelinePath = tempPipelineFile
          }
          
          // Run the DocETL command
          console.log('Running DocETL command with virtual environment')
          const cwd = process.cwd()
          const venvPath = `${cwd}/docetl-env311`
          const cmd = `source ${venvPath}/bin/activate && DOCETL_MODEL=${DOCETL_MODEL || 'gpt-4o-mini'} OPENAI_API_KEY=${DOCETL_API_KEY} docetl run "${pipelinePath}"`
          console.log(`Executing: ${cmd.replace(DOCETL_API_KEY, '[REDACTED]')}`)
          
          const output = execSync(cmd).toString()
          console.log('DocETL command executed successfully')
          
          // Try to read the results file
          let resultFile = outputPath
          if (!resultFile) {
            resultFile = 'docetl_output.json'
          }
          
          if (fs.existsSync(resultFile)) {
            const resultContent = fs.readFileSync(resultFile, 'utf-8')
            result = JSON.parse(resultContent)
            console.log(`Read results from ${resultFile}`)
          } else {
            // Parse output from command
            result = {
              operation,
              success: true,
              output: output,
              metadata: {
                implementation: 'python_env',
                duration: Date.now() - start
              }
            }
          }
          
          // Clean up temporary file if created
          if (tempPipelineFile && fs.existsSync(tempPipelineFile)) {
            fs.unlinkSync(tempPipelineFile)
            console.log(`Removed temporary pipeline file: ${tempPipelineFile}`)
          }
        } catch (error) {
          console.error('Error using DocETL virtual environment:', error)
          throw new Error(`Failed to execute DocETL operation: ${error.message}`)
        }
      }
      
      const output = {
        result,
        summary: `Executed ${operation} operation on ${result.documentsProcessed || 'multiple'} documents`,
        durationMs: Date.now() - start,
      }
      
      yield {
        type: 'result',
        resultForAssistant: this.renderResultForAssistant(output),
        data: output,
      }
    } catch (error) {
      console.error('Critical error in DocETL tool:', error)
      yield {
        type: 'result',
        resultForAssistant: `Error executing DocETL operation: ${error.message}`,
        data: { 
          error: error.message, 
          summary: `Failed to execute ${operation} operation`,
          durationMs: Date.now() - start 
        },
      }
    }
  },
} satisfies Tool<Input, Output>

// Helper functions
function hasReadPermission(path: string | undefined) {
  // This would need proper implementation based on your permissions system
  return true
}

// Function to generate simulated results when real implementation is not available
function getSimulatedResult(
  operation: string, 
  pipelinePath?: string, 
  dataPath?: string, 
  outputPath?: string,
  prompt?: string,
  schema?: string,
  optimize?: boolean,
  startTime: number = Date.now()
) {
  console.log('Using enhanced simulation mode for DocETL with real file processing');
  
  // Try to actually read the dataPath file for more realistic simulation
  let fileContent = null;
  if (dataPath) {
    try {
      const fs = require('fs');
      const path = require('path');
      const absolutePath = path.resolve(dataPath);
      if (fs.existsSync(absolutePath)) {
        fileContent = fs.readFileSync(absolutePath, 'utf-8');
        console.log(`Successfully read file: ${absolutePath} (${fileContent.length} bytes)`);
      }
    } catch (error) {
      console.error(`Error reading file: ${error.message}`);
    }
  }
  
  let simulatedResult
  
  // Define different responses based on the operation type
  switch (operation.toLowerCase()) {
    case 'map':
      simulatedResult = {
        operationType: 'map',
        documentsProcessed: 10,
        pipeline: pipelinePath || "default",
        results: [
          { id: "doc1", extracted: { 
              entities: ["Neural Network", "Transformer", "Attention Mechanism"],
              concepts: ["Deep Learning", "Natural Language Processing"],
              summary: "Discusses advances in transformer architecture for NLP tasks",
              sentiment: "positive"
            }
          },
          { id: "doc2", extracted: { 
              entities: ["Reinforcement Learning", "Q-Learning", "Policy Gradient"],
              concepts: ["Robotics", "Decision Making"],
              summary: "Reviews application of RL methods in robotic control systems",
              sentiment: "neutral"
            }
          },
          { id: "doc3", extracted: { 
              entities: ["Genetic Algorithm", "Evolutionary Computing", "Fitness Function"],
              concepts: ["Optimization", "Biologically Inspired Computing"],
              summary: "Proposes a novel genetic algorithm for multi-objective optimization",
              sentiment: "positive"
            }
          }
        ],
        metadata: {
          success: true,
          implementation: 'simulated',
          optimized: optimize || false,
          prompts: prompt ? 1 : 3,
          tokens: {
            input: 8762,
            output: 4215
          },
          duration: Date.now() - startTime
        }
      }
      break;
      
    case 'reduce':
      simulatedResult = {
        operationType: 'reduce',
        documentsProcessed: 15,
        pipeline: pipelinePath || "default",
        reduceKey: "topic",
        aggregatedResults: [
          { 
            key: "Natural Language Processing",
            count: 7,
            summary: "Collection of papers discussing transformer architectures, attention mechanisms, and language modeling. Key advances include improved context handling, multilingual capabilities, and computational efficiency improvements.",
            entities: ["Transformer", "Attention", "BERT", "GPT", "Embedding"],
            sentiments: { positive: 5, neutral: 2, negative: 0 }
          },
          { 
            key: "Computer Vision",
            count: 5,
            summary: "Studies on object detection, image segmentation, and visual recognition systems. Papers propose novel network architectures and training methods for improved accuracy.",
            entities: ["CNN", "Object Detection", "Segmentation", "Feature Extraction"],
            sentiments: { positive: 3, neutral: 1, negative: 1 }
          },
          { 
            key: "Reinforcement Learning",
            count: 3,
            summary: "Research on policy optimization, multi-agent systems, and game-theoretic approaches to RL. Innovations focus on sample efficiency and generalization.",
            entities: ["Policy Gradient", "Q-Learning", "MARL", "Sample Efficiency"],
            sentiments: { positive: 2, neutral: 1, negative: 0 }
          }
        ],
        metadata: {
          success: true,
          implementation: 'simulated',
          optimized: optimize || false,
          tokens: {
            input: 12540,
            output: 2835
          },
          duration: Date.now() - startTime
        }
      }
      break;
    
    case 'resolve':
      simulatedResult = {
        operationType: 'resolve',
        documentsProcessed: 30,
        pipeline: pipelinePath || "default",
        entityResolutions: [
          {
            canonicalForm: "Transformer Architecture",
            variants: ["transformer", "transformer model", "transformer architecture", "transformer-based models"],
            confidence: 0.97,
            count: 18
          },
          {
            canonicalForm: "Reinforcement Learning",
            variants: ["RL", "reinforcement learning", "reinforcement-learning", "reinforcement based learning"],
            confidence: 0.95,
            count: 12
          },
          {
            canonicalForm: "Geoffrey Hinton",
            variants: ["Hinton", "Geoffrey E. Hinton", "G. Hinton", "Geoffrey Hinton", "Prof. Hinton"],
            confidence: 0.99,
            count: 8
          }
        ],
        metadata: {
          success: true,
          implementation: 'simulated',
          optimized: optimize || false,
          blockingKeys: ["first_letter", "embedding_cluster"],
          comparisons: {
            total: 142,
            blocked: 1254,
            matched: 38
          },
          duration: Date.now() - startTime
        }
      }
      break;
    
    case 'filter':
      simulatedResult = {
        operationType: 'filter',
        documentsProcessed: 50,
        documentsSelected: 12,
        pipeline: pipelinePath || "default",
        filterCriteria: prompt || "Papers with novel methodologies and significant results",
        filteredDocuments: [
          { 
            id: "doc7", 
            title: "Novel Graph Neural Network Approach for Molecular Property Prediction",
            reason: "Introduces new methodology with empirical validation"
          },
          { 
            id: "doc12", 
            title: "Efficient Transformers: A Survey of Modelling and Optimization Techniques",
            reason: "Comprehensive survey with significant impact potential"
          },
          { 
            id: "doc23", 
            title: "Self-Supervised Learning for Speech Recognition in Low-Resource Languages",
            reason: "Novel approach addressing important problem with strong results"
          }
        ],
        metadata: {
          success: true,
          implementation: 'simulated',
          optimized: optimize || false,
          tokens: {
            input: 21450,
            output: 5320
          },
          duration: Date.now() - startTime
        }
      }
      break;
      
    case 'split':
      simulatedResult = {
        operationType: 'split',
        documentsProcessed: 3,
        chunksCreated: 28,
        pipeline: pipelinePath || "default",
        chunkingStrategy: {
          method: "semantic_paragraphs",
          maxTokens: 512,
          overlap: 50
        },
        chunkSummary: [
          { documentId: "doc1", chunks: 12, avgChunkSize: 487 },
          { documentId: "doc2", chunks: 9, avgChunkSize: 503 },
          { documentId: "doc3", chunks: 7, avgChunkSize: 492 }
        ],
        metadata: {
          success: true,
          implementation: 'simulated',
          optimized: optimize || false,
          duration: Date.now() - startTime
        }
      }
      break;
    
    case 'gather':
      simulatedResult = {
        operationType: 'gather',
        chunksProcessed: 28,
        documentsReconstructed: 3,
        pipeline: pipelinePath || "default",
        gatherStrategy: {
          method: "weighted_merge",
          deduplication: true
        },
        reconstructionSummary: [
          { 
            documentId: "doc1", 
            originalChunks: 12,
            mergedContent: "Comprehensive document about transformer architectures...",
            keyInsights: ["Attention mechanism improvements", "Scaling properties", "Training optimizations"]
          },
          { 
            documentId: "doc2", 
            originalChunks: 9,
            mergedContent: "Research on reinforcement learning applications...",
            keyInsights: ["Policy gradient methods", "Sample efficiency techniques", "Multi-agent coordination"]
          },
          { 
            documentId: "doc3", 
            originalChunks: 7,
            mergedContent: "Survey of computer vision techniques...",
            keyInsights: ["Object detection advances", "Semantic segmentation", "Few-shot learning"]
          }
        ],
        metadata: {
          success: true,
          implementation: 'simulated',
          optimized: optimize || false,
          duration: Date.now() - startTime
        }
      }
      break;
      
    case 'build':
      simulatedResult = {
        operationType: 'build',
        pipelineOptimized: pipelinePath || "pipeline.yaml",
        outputPath: outputPath || "pipeline_opt.yaml",
        pipeline: pipelinePath || "default",
        optimizations: [
          "Added blocking rules for resolve operations",
          "Split map operations for large documents",
          "Added gather operations for split documents",
          "Optimized operation order for memory efficiency",
          "Added schema validation for critical operations"
        ],
        operationCounts: {
          original: {
            map: 3,
            reduce: 1,
            resolve: 1,
            filter: 1
          },
          optimized: {
            map: 5,  // Split into smaller operations
            reduce: 1,
            resolve: 1,
            filter: 1,
            split: 2,  // Added to handle large documents
            gather: 2   // Added to reconstruct after splitting
          }
        },
        metadata: {
          success: true,
          implementation: 'simulated',
          estimatedImprovements: {
            memory: "-45%",
            speed: "+30%",
            reliability: "+60%"
          },
          duration: Date.now() - startTime
        }
      }
      break;
      
    case 'run':
      simulatedResult = {
        operationType: 'run',
        pipelineExecuted: pipelinePath || "pipeline.yaml",
        outputPath: outputPath || "results.json",
        documentsProcessed: 25,
        pipeline: pipelinePath || "default",
        executionSummary: {
          operations: 12,
          successfulOperations: 12,
          failedOperations: 0,
          totalTokens: 156432,
          totalCost: "$2.34"
        },
        results: [
          {
            documentId: "doc1",
            processed: true,
            outputSize: 12.5,  // KB
            entityCount: 18,
            processingTime: 3.2  // seconds
          },
          {
            documentId: "doc2",
            processed: true,
            outputSize: 8.7,
            entityCount: 12,
            processingTime: 2.8
          }
        ],
        metadata: {
          success: true,
          implementation: 'simulated',
          optimized: optimize || false,
          duration: Date.now() - startTime
        }
      }
      break;
      
    default:
      // Generic response for any other operation
      simulatedResult = {
        operationType: operation,
        documentsProcessed: 8,
        pipeline: pipelinePath || "default",
        results: [
          { id: "doc1", processed: true, status: "success" },
          { id: "doc2", processed: true, status: "success" },
          { id: "doc3", processed: true, status: "success" }
        ],
        metadata: {
          success: true,
          implementation: 'simulated',
          optimized: optimize || false,
          duration: Date.now() - startTime
        }
      }
  }
  
  // If a schema was provided, show what it would look like
  if (schema) {
    simulatedResult.schema = {
      provided: schema,
      validated: true,
      conformance: "All outputs conform to schema",
      example: {
        title: "Example Document",
        entities: ["Entity1", "Entity2"],
        confidence: 0.95
      }
    }
  }
  
  return simulatedResult
}