import * as React from 'react'
import { Box, Text } from 'ink'
import type { Command } from '../commands.js'
import { ResumeConversation } from '../screens/ResumeConversation.js'
import { render } from 'ink'
import { CACHE_PATHS, loadLogList } from '../utils/log.js'

export default {
  type: 'local-jsx',
  name: 'resume',
  description: '[ANT-ONLY] Resume a previous conversation. Set CLAUDE_EXPERIMENTAL=1 for experimental features.',
  isEnabled: process.env.USER_TYPE === 'ant',
  isHidden: process.env.USER_TYPE !== 'ant',
  userFacingName() {
    return 'resume'
  },
  async call(onDone, { options: { commands, tools, verbose } }) {
    // Check for experimental checkpoint mode via environment variable
    const isExperimental = process.env.CLAUDE_EXPERIMENTAL === '1';
    
    // Handle experimental checkpoint mode
    if (isExperimental) {
      render(
        <Box flexDirection="column">
          <Text bold>🧪 Experimental Checkpoint Mode</Text>
          <Text>Enhanced conversation resumption with advanced features:</Text>
          <Text>- Access to development snapshots</Text>
          <Text>- Conversation branches and merging</Text>
          <Text>- Deep context recovery</Text>
          <Text>- State preservation across sessions</Text>
          <Text>Note: This feature is under active development.</Text>
        </Box>
      )
      setTimeout(() => {
        onDone()
      }, 4000)
      return null
    }
    
    const logs = await loadLogList(CACHE_PATHS.messages())
    render(
      <ResumeConversation
        commands={commands}
        context={{ unmount: onDone }}
        logs={logs}
        tools={tools}
        verbose={verbose}
      />,
    )
    // This return is here for type only
    return null
  },
} satisfies Command
