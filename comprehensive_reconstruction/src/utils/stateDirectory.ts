/**
 * State directory utilities
 * 
 * Functions to manage Claude Code state directories
 */
import { existsSync, mkdirSync } from 'fs'
import os from 'os'
import path from 'path'

// Get state directory for Claude Code
export function getStateDirectory() {
  const stateDir = path.join(os.homedir(), '.claude')
  if (!existsSync(stateDir)) {
    try {
      mkdirSync(stateDir, { recursive: true })
    } catch (error) {
      console.error(`Failed to create state directory ${stateDir}:`, error)
    }
  }
  return stateDir
}

// Get logs directory
export function getLogsDirectory() {
  const logsDir = path.join(getStateDirectory(), 'logs')
  if (!existsSync(logsDir)) {
    try {
      mkdirSync(logsDir, { recursive: true })
    } catch (error) {
      console.error(`Failed to create logs directory ${logsDir}:`, error)
    }
  }
  return logsDir
}

// Get config directory
export function getConfigDirectory() {
  const configDir = path.join(getStateDirectory(), 'config')
  if (!existsSync(configDir)) {
    try {
      mkdirSync(configDir, { recursive: true })
    } catch (error) {
      console.error(`Failed to create config directory ${configDir}:`, error)
    }
  }
  return configDir
}

// Get cache directory
export function getCacheDirectory() {
  const cacheDir = path.join(getStateDirectory(), 'cache')
  if (!existsSync(cacheDir)) {
    try {
      mkdirSync(cacheDir, { recursive: true })
    } catch (error) {
      console.error(`Failed to create cache directory ${cacheDir}:`, error)
    }
  }
  return cacheDir
}