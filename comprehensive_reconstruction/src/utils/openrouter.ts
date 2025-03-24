/**
 * OpenRouter integration for Claude Code
 * 
 * Allows using OpenRouter as a cost-effective alternative to direct Anthropic API.
 * This works in conjunction with anthropic-proxy to translate API formats.
 */

import { logError } from './log.js'

/**
 * Check if OpenRouter integration is enabled
 */
export function isOpenRouterEnabled(): boolean {
  return Boolean(process.env.USE_OPENROUTER === 'true' || process.env.USE_OPENROUTER === '1')
}

/**
 * Get the OpenRouter API key
 */
export function getOpenRouterApiKey(): string | null {
  return process.env.OPENROUTER_API_KEY || null
}

/**
 * Get the anthropic-proxy endpoint
 */
export function getProxyEndpoint(): string | null {
  // If custom endpoint is provided, use it
  if (process.env.ANTHROPIC_PROXY_URL) {
    return process.env.ANTHROPIC_PROXY_URL
  }
  
  // Default to localhost:3000 (default for anthropic-proxy)
  if (isOpenRouterEnabled()) {
    return 'http://localhost:3000'
  }
  
  return null
}

/**
 * Validate OpenRouter configuration
 */
export function validateOpenRouterConfig(): { valid: boolean; message?: string } {
  if (isOpenRouterEnabled()) {
    // Check for API key
    if (!getOpenRouterApiKey()) {
      return { 
        valid: false, 
        message: 'OpenRouter is enabled but OPENROUTER_API_KEY is not set. Please set it in your environment.'
      }
    }
    
    // Configuration is valid
    return { valid: true }
  }
  
  // OpenRouter is not enabled, so config is valid
  return { valid: true }
}

/**
 * Initialize the anthropic-proxy if OpenRouter is enabled
 * This function can be called during startup to ensure the proxy is running
 */
export async function initializeAnthropicProxy(): Promise<void> {
  // This would normally spawn the proxy process
  // For now, we'll just log that the user should start it manually
  if (isOpenRouterEnabled()) {
    const { valid, message } = validateOpenRouterConfig()
    
    if (!valid) {
      logError(new Error(message))
      console.error(`OpenRouter configuration error: ${message}`)
      return
    }
    
    console.log('Using OpenRouter via anthropic-proxy for cost-effective API access')
    console.log('Please ensure anthropic-proxy is running:')
    console.log('npm install -g anthropic-proxy')
    console.log(`OPENROUTER_API_KEY=${getOpenRouterApiKey()} npx anthropic-proxy`)
  }
}