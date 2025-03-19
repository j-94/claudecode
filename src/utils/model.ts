import { memoize } from 'lodash-es'
import { getDynamicConfig, getExperimentValue } from '../services/statsig.js'
import { logError } from './log.js'
import { getGlobalConfig } from './config.js'

export const USE_BEDROCK = !!process.env.CLAUDE_CODE_USE_BEDROCK
export const USE_VERTEX = !!process.env.CLAUDE_CODE_USE_VERTEX

export interface ModelConfig {
  bedrock: string
  vertex: string
  firstParty: string
}

const DEFAULT_MODEL_CONFIG: ModelConfig = {
  bedrock: 'us.anthropic.claude-3-7-sonnet-20250219-v1:0',
  vertex: 'claude-3-7-sonnet@20250219',
  firstParty: 'claude-3-7-sonnet-20250219',
}

export const SMALL_FAST_MODEL = USE_BEDROCK
  ? 'us.anthropic.claude-3-5-haiku-20241022-v1:0'
  : USE_VERTEX
    ? 'claude-3-5-haiku@20241022'
    : 'claude-3-5-haiku-20241022'

/**
 * Helper to get the model config from statsig or defaults
 * Relies on the built-in caching from StatsigClient
 */
async function getModelConfig(): Promise<ModelConfig> {
  try {
    return await getDynamicConfig<ModelConfig>(
      'tengu-capable-model-config',
      DEFAULT_MODEL_CONFIG,
    )
  } catch (error) {
    logError(error)
    return DEFAULT_MODEL_CONFIG
  }
}

// Check if a model is a research model
export function isResearchModel(modelName: string | undefined): boolean {
  return Boolean(modelName?.startsWith('research-'))
}

// Check if research model access is enabled
export function hasResearchModelAccess(): boolean {
  // For development environment, don't restrict research model access
  if (process.env.NODE_ENV === 'development') {
    return true
  }
  
  // For internal users, always allow research model access
  if (process.env.USER_TYPE === 'ant') {
    return true
  }
  
  // For others, check configuration
  const config = getGlobalConfig()
  return Boolean(config.researchModelAccess)
}

// Check if a specific model is allowed
export function isModelAllowed(modelName: string): boolean {
  if (!isResearchModel(modelName)) {
    return true // Non-research models are always allowed
  }
  
  const config = getGlobalConfig()
  if (!config.researchModelAccess) {
    return false // Research models not enabled
  }
  
  // If allowedModels is not specified, but researchModelAccess is true,
  // all research models are allowed
  if (!config.allowedModels || config.allowedModels.length === 0) {
    return true
  }
  
  // Otherwise, check if the model is in the allowed list
  return config.allowedModels.includes(modelName)
}

export const getSlowAndCapableModel = memoize(async (): Promise<string> => {
  // If ANTHROPIC_MODEL is set in env and it's a valid model, use it
  if (process.env.ANTHROPIC_MODEL) {
    const modelName = process.env.ANTHROPIC_MODEL
    
    // For research models, verify access is enabled
    if (isResearchModel(modelName) && !hasResearchModelAccess()) {
      console.warn(`Research model ${modelName} requested but research model access is not enabled.`)
      // Fall back to default model
    } else {
      return modelName
    }
  }
  
  // Check for user preferred model from config
  const globalConfig = getGlobalConfig()
  if (globalConfig.preferredModel) {
    // Verify research model access if needed
    if (isResearchModel(globalConfig.preferredModel) && !hasResearchModelAccess()) {
      console.warn(`Research model ${globalConfig.preferredModel} requested but research model access is not enabled.`)
      // Fall back to default model
    } else {
      return globalConfig.preferredModel
    }
  }
  
  // Special handling for internal users
  if (process.env.USER_TYPE === 'ant') {
    // Use experiment-defined model for internal users
    return (
      await getExperimentValue('chihuahua', {
        color: 'research-claude-denim',
      })
    ).color
  }

  if (process.env.USER_TYPE === 'SWE_BENCH') {
    if (process.env.ANTHROPIC_MODEL) {
      return process.env.ANTHROPIC_MODEL
    }
  }

  // Default model selection
  const config = await getModelConfig()
  if (USE_BEDROCK) {
    return config.bedrock
  }
  if (USE_VERTEX) {
    return config.vertex
  }
  return config.firstParty
})

export async function isDefaultSlowAndCapableModel(): Promise<boolean> {
  const config = getGlobalConfig()
  
  return (
    (!process.env.ANTHROPIC_MODEL && !config.preferredModel) ||
    process.env.ANTHROPIC_MODEL === (await getSlowAndCapableModel()) ||
    config.preferredModel === (await getSlowAndCapableModel())
  )
}

/**
 * Get the region for a specific Vertex model
 * Checks for hardcoded model-specific environment variables first,
 * then falls back to CLOUD_ML_REGION env var or default region
 */
export function getVertexRegionForModel(
  model: string | undefined,
): string | undefined {
  if (model?.startsWith('claude-3-5-haiku')) {
    return process.env.VERTEX_REGION_CLAUDE_3_5_HAIKU
  } else if (model?.startsWith('claude-3-5-sonnet')) {
    return process.env.VERTEX_REGION_CLAUDE_3_5_SONNET
  } else if (model?.startsWith('claude-3-7-sonnet')) {
    return process.env.VERTEX_REGION_CLAUDE_3_7_SONNET
  }
}
