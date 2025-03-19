import { Command } from '../commands.js'
import { MemoryReadTool } from '../tools/MemoryReadTool/MemoryReadTool.js'

export default {
  type: 'local',
  name: 'memory-read',
  description: 'Read from persistent memory across conversations',
  isEnabled: true,
  isHidden: process.env.NODE_ENV !== 'development' && process.env.USER_TYPE !== 'ant',
  userFacingName() {
    return 'memory-read'
  },
  async call(args: string, context) {
    // Parse arguments in format key="value"
    const keyMatch = args.match(/key\s*=\s*["']?([\w\-_]+)["']?/)
    
    if (!keyMatch) {
      return "Error: Missing required parameter 'key'. Usage: /memory-read key=\"your_key\""
    }
    
    const key = keyMatch[1]
    
    try {
      // Use MemoryReadTool to read the value
      // Map key to key as expected by MemoryReadTool
      let result
      for await (const toolResult of MemoryReadTool.call({ key }, {
        ...context,
        messageId: undefined,
        readFileTimestamps: {},
      })) {
        if (toolResult.type === 'result') {
          result = toolResult.data
          break
        }
      }
      
      // Format the result for display
      if (result && result.content) {
        try {
          // Try to parse as JSON for prettier display
          const parsed = JSON.parse(result.content)
          return `Memory value for key "${key}":\n\n${JSON.stringify(parsed, null, 2)}`
        } catch {
          // Not JSON, return as is
          return `Memory value for key "${key}":\n\n${result.content}`
        }
      } else {
        return `No value found for key "${key}"`
      }
    } catch (error) {
      return `Error reading from memory: ${error.message}`
    }
  },
} satisfies Command