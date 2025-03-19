import { existsSync, lstatSync, mkdirSync, readdirSync, readFileSync } from 'fs'
import { Box, Text } from 'ink'
import { join } from 'path'
import * as React from 'react'
import { z } from 'zod'
import { FallbackToolUseRejectedMessage } from '../../components/FallbackToolUseRejectedMessage.js'
import { Tool } from '../../Tool.js'
import { MEMORY_DIR } from '../../utils/env.js'
import { DESCRIPTION, PROMPT } from './prompt.js'

const inputSchema = z.strictObject({
  file_path: z
    .string()
    .optional()
    .describe('Optional path to a specific memory file to read'),
  key: z
    .string()
    .optional()
    .describe('Key name of the memory item to read')
})

export const MemoryReadTool = {
  name: 'MemoryRead',
  async description() {
    return DESCRIPTION
  },
  async prompt() {
    return PROMPT
  },
  inputSchema,
  userFacingName() {
    return 'Read Memory'
  },
  async isEnabled() {
    // Enable memory tools for all users in development and ant users in production
    return process.env.NODE_ENV === 'development' || process.env.USER_TYPE === 'ant'
  },
  isReadOnly() {
    return true
  },
  needsPermissions() {
    return false
  },
  renderResultForAssistant({ content }) {
    return content
  },
  renderToolUseMessage(input) {
    return Object.entries(input)
      .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
      .join(', ')
  },
  renderToolUseRejectedMessage() {
    return <FallbackToolUseRejectedMessage />
  },
  renderToolResultMessage(output) {
    return (
      <Box justifyContent="space-between" overflowX="hidden" width="100%">
        <Box flexDirection="row">
          <Text>&nbsp;&nbsp;⎿ &nbsp;</Text>
          <Text>{output.content}</Text>
        </Box>
      </Box>
    )
  },
  async validateInput({ file_path, key }) {
    // If file_path is provided directly, validate it
    if (file_path) {
      const fullPath = join(MEMORY_DIR, file_path)
      if (!fullPath.startsWith(MEMORY_DIR)) {
        return { result: false, message: 'Invalid memory file path' }
      }
      if (!existsSync(fullPath)) {
        return { result: false, message: 'Memory file does not exist' }
      }
    }
    
    // If key is provided, validate it as a file path
    if (key) {
      const fullPath = join(MEMORY_DIR, key)
      if (!fullPath.startsWith(MEMORY_DIR)) {
        return { result: false, message: 'Invalid memory key' }
      }
      if (!existsSync(fullPath)) {
        return { result: false, message: `Memory key "${key}" does not exist` }
      }
    }
    
    // At least one of file_path or key must be provided when reading a specific file
    if (!file_path && !key && !process.env.LIST_ALL_MEMORY) {
      return { result: true } // This will list all memory files
    }
    
    return { result: true }
  },
  async *call({ file_path, key }) {
    mkdirSync(MEMORY_DIR, { recursive: true })

    // Support both parameter styles - either file_path or key
    const usedFilePath = file_path || key
    
    // If a specific file is requested (via either parameter), return its contents
    if (usedFilePath) {
      const fullPath = join(MEMORY_DIR, usedFilePath)
      if (!existsSync(fullPath)) {
        throw new Error(`Memory file does not exist: ${usedFilePath}`)
      }
      const content = readFileSync(fullPath, 'utf-8')
      yield {
        type: 'result',
        data: {
          content,
          value: content, // Add this for backward compatibility
        },
        resultForAssistant: this.renderResultForAssistant({ content }),
      }
      return
    }

    // Otherwise return the index and file list
    const files = readdirSync(MEMORY_DIR, { recursive: true })
      .map(f => join(MEMORY_DIR, f.toString()))
      .filter(f => !lstatSync(f).isDirectory())
      .map(f => `- ${f}`)
      .join('\n')

    const indexPath = join(MEMORY_DIR, 'index.md')
    const index = existsSync(indexPath) ? readFileSync(indexPath, 'utf-8') : ''

    const quotes = "'''"
    const content = `Here are the contents of the root memory file, \`${indexPath}\`:
${quotes}
${index}
${quotes}

Files in the memory directory:
${files}`
    yield {
      type: 'result',
      data: { content },
      resultForAssistant: this.renderResultForAssistant({ content }),
    }
  },
} satisfies Tool<typeof inputSchema, { content: string }>
