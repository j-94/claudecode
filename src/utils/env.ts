import { execFileNoThrow } from './execFileNoThrow.js'
import { memoize } from 'lodash-es'
import { join } from 'path'
import { homedir } from 'os'
import { existsSync } from 'fs'
import { config } from 'dotenv'
import { getCwd } from './state.js'

// Base directory for all Claude Code data files (except config.json for backwards compatibility)
export const CLAUDE_BASE_DIR =
  process.env.CLAUDE_CONFIG_DIR ?? join(homedir(), '.claude')

// Config and data paths
export const GLOBAL_CLAUDE_FILE = process.env.CLAUDE_CONFIG_DIR
  ? join(CLAUDE_BASE_DIR, 'config.json')
  : join(homedir(), '.claude.json')
export const MEMORY_DIR = join(CLAUDE_BASE_DIR, 'memory')

// Load .env file if it exists in the current directory
export function loadEnv() {
  // Try to load .env from current directory
  const envPath = join(getCwd(), '.env')
  if (existsSync(envPath)) {
    config({ path: envPath })
    return true
  }
  
  // If no .env file in current directory, try to load from .claude directory
  const claudeEnvPath = join(CLAUDE_BASE_DIR, '.env')
  if (existsSync(claudeEnvPath)) {
    config({ path: claudeEnvPath })
    return true
  }
  
  return false
}

// Function to display current environment settings for research tools
export function getResearchToolsEnvInfo(): Record<string, any> {
  return {
    lotus: {
      apiKeyAvailable: !!process.env.LOTUS_API_KEY || !!process.env.OPENAI_API_KEY,
      apiKeySource: process.env.LOTUS_API_KEY ? 'LOTUS_API_KEY' : 
                    process.env.OPENAI_API_KEY ? 'OPENAI_API_KEY' : 'Not Available'
    },
    docETL: {
      apiKeyAvailable: !!process.env.DOCETL_API_KEY || !!process.env.OPENAI_API_KEY || !!process.env.ANTHROPIC_API_KEY,
      apiKeySource: process.env.DOCETL_API_KEY ? 'DOCETL_API_KEY' : 
                   process.env.OPENAI_API_KEY ? 'OPENAI_API_KEY' : 
                   process.env.ANTHROPIC_API_KEY ? 'ANTHROPIC_API_KEY' : 'Not Available',
      model: process.env.DOCETL_MODEL || 'gpt-4 (default)'
    },
    claudeModel: {
      model: process.env.ANTHROPIC_MODEL || 'default',
      isResearchModel: process.env.ANTHROPIC_MODEL?.startsWith('research-') || false
    },
    debug: process.env.DEBUG === 'true'
  }
}

// Initialize environment variables
loadEnv()

const getIsDocker = memoize(async (): Promise<boolean> => {
  // Check for .dockerenv file
  const { code } = await execFileNoThrow('test', ['-f', '/.dockerenv'])
  if (code !== 0) {
    return false
  }
  return process.platform === 'linux'
})

const hasInternetAccess = memoize(async (): Promise<boolean> => {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 1000)

    await fetch('http://1.1.1.1', {
      method: 'HEAD',
      signal: controller.signal,
    })

    clearTimeout(timeout)
    return true
  } catch {
    return false
  }
})

// all of these should be immutable
export const env = {
  getIsDocker,
  hasInternetAccess,
  isCI: Boolean(process.env.CI),
  platform:
    process.platform === 'win32'
      ? 'windows'
      : process.platform === 'darwin'
        ? 'macos'
        : 'linux',
  nodeVersion: process.version,
  terminal: process.env.TERM_PROGRAM,
}
