import React from 'react'
import { render } from 'ink'
import { MCPServerWizard } from '../components/MCPServerWizard.js'
import { Command } from '../commands.js'
import { logEvent } from '../services/statsig.js'

export const mcpAddCommand: Command = {
  type: 'wizard',
  name: 'mcp_add',
  description: 'Interactive wizard to add a new MCP server',
  userFacingName: () => 'mcp add',
  progressMessage: 'Setting up MCP server',
  isEnabled: true,
  isHidden: false,
  
  async getComponentForCommand() {
    return new Promise<React.ReactNode>(resolve => {
      logEvent('tengu_mcp_add_wizard', {})
      
      const handleDone = () => {
        result.unmount()
        resolve(null)
      }
      
      const result = render(
        <MCPServerWizard onDone={handleDone} />,
        { exitOnCtrlC: false }
      )
    })
  }
}