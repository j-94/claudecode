import { mkdirSync, writeFileSync } from 'fs'
import { Box, Text } from 'ink'
import { dirname, join } from 'path'
import * as React from 'react'
import { z } from 'zod'
import { FallbackToolUseRejectedMessage } from '../../components/FallbackToolUseRejectedMessage.js'
import { Tool } from '../../Tool.js'
import { MEMORY_DIR } from '../../utils/env.js'
import { DESCRIPTION, PROMPT } from './prompt.js'

const inputSchema = z.strictObject({
  file_path: z.string().optional().describe('Path to the memory file to write'),
  content: z.string().optional().describe('Content to write to the file'),
  key: z.string().optional().describe('Key to use as the filename for the memory item'),
  value: z.string().optional().describe('Value to store in the memory file')
}).refine(data => (!!data.file_path && !!data.content) || (!!data.key && !!data.value), {
  message: "Either file_path+content OR key+value must be provided"
})

export const MemoryWriteTool = {
  name: 'MemoryWrite',
  async description() {
    return DESCRIPTION
  },
  async prompt() {
    return PROMPT
  },
  inputSchema,
  userFacingName() {
    return 'Write Memory'
  },
  async isEnabled() {
    // Enable memory tools for all users in development and ant users in production
    return process.env.NODE_ENV === 'development' || process.env.USER_TYPE === 'ant'
  },
  isReadOnly() {
    return false
  },
  needsPermissions() {
    return false
  },
  renderResultForAssistant(content) {
    console.log("Memory write successful");
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
  renderToolResultMessage() {
    return (
      <Box justifyContent="space-between" overflowX="hidden" width="100%">
        <Box flexDirection="row">
          <Text>{'  '}⎿ Updated memory</Text>
        </Box>
      </Box>
    )
  },
  async validateInput({ file_path, key }) {
    // If file_path is provided, check that it's valid
    if (file_path) {
      const fullPath = join(MEMORY_DIR, file_path)
      if (!fullPath.startsWith(MEMORY_DIR)) {
        return { result: false, message: 'Invalid memory file path' }
      }
    }
    // If neither file_path nor key is provided, reject
    if (!file_path && !key) {
      return { result: false, message: 'Either file_path or key must be provided' }
    }
    return { result: true }
  },
  async *call({ file_path, content, key, value }) {
    // Support both parameter styles: either file_path+content or key+value
    const usedFilePath = file_path || key
    const usedContent = content || value
    
    if (!usedFilePath) {
      throw new Error('Either file_path or key must be provided')
    }
    
    if (usedContent === undefined) {
      throw new Error('Either content or value must be provided')
    }
    
    const fullPath = join(MEMORY_DIR, usedFilePath)
    mkdirSync(dirname(fullPath), { recursive: true })
    writeFileSync(fullPath, usedContent, 'utf-8')
    yield {
      type: 'result',
      data: 'Saved',
      resultForAssistant: 'Saved',
    }
  },
} satisfies Tool<typeof inputSchema, string>
