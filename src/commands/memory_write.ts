import { Command } from '../commands.js'
import { MemoryWriteTool } from '../tools/MemoryWriteTool/MemoryWriteTool.js'

export default {
  type: 'local',
  name: 'memory-write',
  description: 'Store information persistently across sessions',
  isEnabled: true,
  isHidden: process.env.NODE_ENV !== 'development' && process.env.USER_TYPE !== 'ant',
  userFacingName() {
    return 'memory-write'
  },
  async call(args: string, context) {
    // Parse arguments in format key="value" value="data"
    const keyMatch = args.match(/key\s*=\s*["']?([\w\-_]+)["']?/)
    const valueMatch = args.match(/value\s*=\s*["']?([^"']+)["']?/)
    
    if (!keyMatch) {
      return "Error: Missing required parameter 'key'. Usage: /memory-write key=\"your_key\" value=\"your_value\""
    }
    
    if (!valueMatch) {
      return "Error: Missing required parameter 'value'. Usage: /memory-write key=\"your_key\" value=\"your_value\""
    }
    
    const key = keyMatch[1]
    const value = valueMatch[1]
    
    try {
      // Use MemoryWriteTool to write the value
      // Properly map key to key and value to value as expected by MemoryWriteTool
      let result
      for await (const toolResult of MemoryWriteTool.call({ key, value }, {
        ...context,
        messageId: undefined,
        readFileTimestamps: {},
      })) {
        if (toolResult.type === 'result') {
          result = toolResult.data
          break
        }
      }
      
      return `Successfully stored value for key "${key}"`
    } catch (error) {
      return `Error writing to memory: ${error.message}`
    }
  },
} satisfies Command