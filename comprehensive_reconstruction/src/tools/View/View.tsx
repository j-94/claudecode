import { ImageBlockParam } from '@anthropic-ai/sdk/resources/index.mjs'
import { existsSync, readFileSync, statSync } from 'fs'
import { Box, Text } from 'ink'
import * as path from 'path'
import { extname, relative } from 'path'
import * as React from 'react'
import { z } from 'zod'
import { FallbackToolUseRejectedMessage } from '../../components/FallbackToolUseRejectedMessage.js'
import { HighlightedCode } from '../../components/HighlightedCode.js'
import type { Tool } from '../../Tool.js'
import { getCwd } from '../../utils/state.js'
import { logError } from '../../utils/log.js'
import { getTheme } from '../../utils/theme.js'
import { DESCRIPTION, PROMPT } from './prompt.js'
import { hasReadPermission } from '../../utils/permissions/filesystem.js'

const inputSchema = z.strictObject({
  file_path: z.string().describe('The absolute path to the file to read'),
  offset: z
    .number()
    .optional()
    .describe(
      'The line number to start reading from. Only provide if the file is too large to read at once',
    ),
  limit: z
    .number()
    .optional()
    .describe(
      'The number of lines to read. Only provide if the file is too large to read at once.',
    ),
})



export const View = {
  name: 'View',
} satisfies Tool<typeof inputSchema>
