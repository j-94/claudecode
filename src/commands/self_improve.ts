import { Command } from '../commands.js'
import { SelfImproveTool } from '../tools/SelfImproveTool/SelfImproveTool.js'

export default {
  type: 'local',
  name: 'self-improve',
  description: 'Meta-programming for analyzing and improving Claude Code',
  isEnabled: true,
  isHidden: process.env.USER_TYPE !== 'ant',
  userFacingName() {
    return 'self-improve'
  },
  async call(args: string, context) {
    // Parse arguments
    const analysisMatch = args.match(/analysis\s*=\s*["']?(codebase|architecture|performance|extensibility|custom)["']?/)
    const scopeMatch = args.match(/scope\s*=\s*["']?([\w\-_\/]+)["']?/)
    const depthMatch = args.match(/depth\s*=\s*["']?(shallow|medium|deep)["']?/)
    const customPromptMatch = args.match(/prompt\s*=\s*["']?([^"']+)["']?/)
    const outputFormatMatch = args.match(/format\s*=\s*["']?(markdown|json|yaml)["']?/)
    
    if (!analysisMatch) {
      return "Error: Missing required parameter 'analysis'. Usage: /self-improve analysis=\"architecture\" [scope=\"tools\"] [depth=\"medium\"] [format=\"markdown\"] [prompt=\"custom prompt\"]"
    }
    
    const analysisType = analysisMatch[1] as any
    const scope = scopeMatch ? scopeMatch[1] : undefined
    const depthLevel = depthMatch ? depthMatch[1] as any : 'medium'
    const customPrompt = customPromptMatch ? customPromptMatch[1] : undefined
    const outputFormat = outputFormatMatch ? outputFormatMatch[1] as any : 'markdown'
    
    try {
      // Inform the user that analysis is starting
      console.log(`Starting ${analysisType} analysis with ${depthLevel} depth...`)
      
      // Use SelfImproveTool to perform the analysis
      let result
      for await (const toolResult of SelfImproveTool.call({
        analysisType,
        scope,
        depthLevel,
        customPrompt,
        outputFormat
      }, {
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
      if (result && result.result) {
        if (typeof result.result === 'object') {
          return `Analysis complete in ${result.durationMs}ms:\n\n${JSON.stringify(result.result, null, 2)}`
        } else {
          return `Analysis complete in ${result.durationMs}ms:\n\n${result.result}`
        }
      } else {
        return `Analysis failed or returned empty results.`
      }
    } catch (error) {
      return `Error performing analysis: ${error.message}`
    }
  },
} satisfies Command