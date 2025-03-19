import React, { useState } from 'react'
import { Box, Text, useInput } from 'ink'
import { Select } from '@inkjs/ui'
import TextInput from './TextInput.js'
import { getTheme } from '../utils/theme.js'
import { addMcpServer, ensureConfigScope } from '../services/mcpClient.js'
import { MCPServerDialogCopy } from './MCPServerDialogCopy.js'
import { useExitOnCtrlCD } from '../hooks/useExitOnCtrlCD.js'

type ModeSelectionProps = {
  onSelect: (mode: 'stdio' | 'sse') => void
  onCancel: () => void
}

function ModeSelection({ onSelect, onCancel }: ModeSelectionProps) {
  useInput((_input, key) => {
    if (key.escape) {
      onCancel()
    }
  })

  return (
    <Box flexDirection="column" gap={1}>
      <Text bold>Select MCP Server Type</Text>
      <Text>Choose the type of MCP server you want to add:</Text>
      
      <Select
        options={[
          { label: 'Standard I/O (stdio) - Run local command', value: 'stdio' },
          { label: 'Server-Sent Events (SSE) - Connect to remote endpoint', value: 'sse' },
        ]}
        onChange={value => onSelect(value as 'stdio' | 'sse')}
      />
      
      <Text dimColor>Enter to confirm · Esc to cancel</Text>
    </Box>
  )
}

type StdioSetupProps = {
  onSubmit: (name: string, command: string, args: string[], env: Record<string, string>) => void
  onBack: () => void
  onCancel: () => void
}

function StdioSetup({ onSubmit, onBack, onCancel }: StdioSetupProps) {
  const [step, setStep] = useState<'name' | 'command' | 'args' | 'env'>('name')
  const [name, setName] = useState('')
  const [command, setCommand] = useState('')
  const [args, setArgs] = useState('')
  const [env, setEnv] = useState('')
  
  useInput((_input, key) => {
    if (key.escape) {
      if (step === 'name') {
        onBack()
      } else {
        onCancel()
      }
    }
  })

  const handleNext = () => {
    if (step === 'name' && name.trim()) {
      setStep('command')
    } else if (step === 'command' && command.trim()) {
      setStep('args')
    } else if (step === 'args') {
      setStep('env')
    } else if (step === 'env') {
      // Parse environment variables
      const envVars: Record<string, string> = {}
      env.split(',').forEach(pair => {
        const [key, value] = pair.split('=').map(s => s.trim())
        if (key && value) {
          envVars[key] = value
        }
      })
      
      // Parse args
      const argArray = args.trim() ? args.split(' ') : []
      
      onSubmit(name, command, argArray, envVars)
    }
  }

  const theme = getTheme()

  return (
    <Box flexDirection="column" gap={1}>
      <Text bold>Add Standard I/O (stdio) MCP Server</Text>
      
      {step === 'name' && (
        <>
          <Text>Enter a name for this MCP server:</Text>
          <TextInput
            value={name}
            onChange={setName}
            onSubmit={handleNext}
            placeholder="my-server"
          />
          <Text dimColor>Enter to continue · Esc to go back</Text>
        </>
      )}
      
      {step === 'command' && (
        <>
          <Text>Enter the command to execute:</Text>
          <TextInput
            value={command}
            onChange={setCommand}
            onSubmit={handleNext}
            placeholder="python server.py"
          />
          <Text dimColor>Enter to continue · Esc to cancel</Text>
        </>
      )}
      
      {step === 'args' && (
        <>
          <Text>Enter any command arguments (space-separated):</Text>
          <TextInput
            value={args}
            onChange={setArgs}
            onSubmit={handleNext}
            placeholder="--port 8000 --debug"
          />
          <Text dimColor>Enter to continue · Esc to cancel</Text>
        </>
      )}
      
      {step === 'env' && (
        <>
          <Text>Enter environment variables (comma-separated KEY=VALUE pairs):</Text>
          <TextInput
            value={env}
            onChange={setEnv}
            onSubmit={handleNext}
            placeholder="API_KEY=xyz123,DEBUG=true"
          />
          <Text dimColor>Enter to finish · Esc to cancel</Text>
        </>
      )}

      <Box marginY={1}>
        <Text color={theme.dimmed}>
          {step === 'name' ? '● ○ ○ ○' : step === 'command' ? '○ ● ○ ○' : step === 'args' ? '○ ○ ● ○' : '○ ○ ○ ●'}
        </Text>
      </Box>
    </Box>
  )
}

type SseSetupProps = {
  onSubmit: (name: string, url: string) => void
  onBack: () => void
  onCancel: () => void
}

function SseSetup({ onSubmit, onBack, onCancel }: SseSetupProps) {
  const [step, setStep] = useState<'name' | 'url'>('name')
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  
  useInput((_input, key) => {
    if (key.escape) {
      if (step === 'name') {
        onBack()
      } else {
        onCancel()
      }
    }
  })

  const handleNext = () => {
    if (step === 'name' && name.trim()) {
      setStep('url')
    } else if (step === 'url' && url.trim()) {
      onSubmit(name, url)
    }
  }

  const theme = getTheme()

  return (
    <Box flexDirection="column" gap={1}>
      <Text bold>Add Server-Sent Events (SSE) MCP Server</Text>
      
      {step === 'name' && (
        <>
          <Text>Enter a name for this MCP server:</Text>
          <TextInput
            value={name}
            onChange={setName}
            onSubmit={handleNext}
            placeholder="my-sse-server"
          />
          <Text dimColor>Enter to continue · Esc to go back</Text>
        </>
      )}
      
      {step === 'url' && (
        <>
          <Text>Enter the SSE endpoint URL:</Text>
          <TextInput
            value={url}
            onChange={setUrl}
            onSubmit={handleNext}
            placeholder="http://localhost:8000/sse"
          />
          <Text dimColor>Enter to finish · Esc to cancel</Text>
        </>
      )}

      <Box marginY={1}>
        <Text color={theme.dimmed}>
          {step === 'name' ? '● ○' : '○ ●'}
        </Text>
      </Box>
    </Box>
  )
}

type ScopeSelectionProps = {
  onSelect: (scope: 'project' | 'global') => void
  onCancel: () => void
}

function ScopeSelection({ onSelect, onCancel }: ScopeSelectionProps) {
  useInput((_input, key) => {
    if (key.escape) {
      onCancel()
    }
  })

  return (
    <Box flexDirection="column" gap={1}>
      <Text bold>Select Configuration Scope</Text>
      <Text>Where should this MCP server configuration be saved?</Text>
      
      <Select
        options={[
          { label: 'Project (local to current directory)', value: 'project' },
          { label: 'Global (available in all projects)', value: 'global' },
        ]}
        onChange={value => onSelect(value as 'project' | 'global')}
      />
      
      <Text dimColor>Enter to confirm · Esc to cancel</Text>
    </Box>
  )
}

type SuccessMessageProps = {
  name: string
  serverType: 'stdio' | 'sse'
  scope: 'project' | 'global'
  onDone: () => void
}

function SuccessMessage({ name, serverType, scope, onDone }: SuccessMessageProps) {
  const theme = getTheme()
  
  useInput((_input, key) => {
    if (key.return || key.escape) {
      onDone()
    }
  })

  return (
    <Box flexDirection="column" gap={1}>
      <Text bold color={theme.success}>Success!</Text>
      <Text>
        {serverType === 'stdio' 
          ? `Added stdio MCP server "${name}" to ${scope} configuration.`
          : `Added SSE MCP server "${name}" to ${scope} configuration.`
        }
      </Text>
      <Text>You can now use this server with Claude Code.</Text>
      <Text dimColor>Press Enter to finish</Text>
    </Box>
  )
}

type Props = {
  onDone: () => void
}

export function MCPServerWizard({ onDone }: Props) {
  const [stage, setStage] = useState<
    'intro' | 'mode' | 'scope' | 'stdio' | 'sse' | 'success'
  >('intro')
  const [serverType, setServerType] = useState<'stdio' | 'sse'>('stdio')
  const [scope, setScope] = useState<'project' | 'global'>('project')
  const [serverName, setServerName] = useState('')
  
  const theme = getTheme()
  const exitState = useExitOnCtrlCD(() => process.exit(0))

  useInput((_input, key) => {
    if (key.escape && stage === 'intro') {
      onDone()
    }
  })

  const handleAddStdioServer = (
    name: string, 
    command: string, 
    args: string[], 
    env: Record<string, string>
  ) => {
    try {
      setServerName(name)
      const configScope = ensureConfigScope(scope)
      addMcpServer(
        name,
        { type: 'stdio', command, args, env },
        configScope
      )
      setStage('success')
    } catch (error) {
      console.error((error as Error).message)
      onDone()
    }
  }

  const handleAddSseServer = (name: string, url: string) => {
    try {
      setServerName(name)
      const configScope = ensureConfigScope(scope)
      addMcpServer(
        name,
        { type: 'sse', url },
        configScope
      )
      setStage('success')
    } catch (error) {
      console.error((error as Error).message)
      onDone()
    }
  }

  return (
    <Box
      flexDirection="column"
      gap={1}
      padding={1}
      borderStyle="round"
      borderColor={theme.primary}
    >
      {stage === 'intro' && (
        <>
          <Text bold color={theme.primary}>
            MCP Server Setup Wizard
          </Text>
          <Text>
            This wizard will help you configure a new Model Context Protocol (MCP) server.
          </Text>
          <MCPServerDialogCopy />
          <Text>Ready to set up a new MCP server?</Text>
          
          <Select
            options={[
              { label: 'Yes, continue', value: 'continue' },
              { label: 'No, cancel', value: 'cancel' },
            ]}
            onChange={value => {
              if (value === 'continue') {
                setStage('mode')
              } else {
                onDone()
              }
            }}
          />
          
          <Text dimColor>
            {exitState.pending ? (
              <>Press {exitState.keyName} again to exit</>
            ) : (
              <>Enter to continue · Esc to cancel</>
            )}
          </Text>
        </>
      )}

      {stage === 'mode' && (
        <ModeSelection
          onSelect={mode => {
            setServerType(mode)
            setStage('scope')
          }}
          onCancel={onDone}
        />
      )}

      {stage === 'scope' && (
        <ScopeSelection
          onSelect={selectedScope => {
            setScope(selectedScope)
            setStage(serverType === 'stdio' ? 'stdio' : 'sse')
          }}
          onCancel={onDone}
        />
      )}
      
      {stage === 'stdio' && (
        <StdioSetup
          onSubmit={handleAddStdioServer}
          onBack={() => setStage('mode')}
          onCancel={onDone}
        />
      )}
      
      {stage === 'sse' && (
        <SseSetup
          onSubmit={handleAddSseServer}
          onBack={() => setStage('mode')}
          onCancel={onDone}
        />
      )}
      
      {stage === 'success' && (
        <SuccessMessage
          name={serverName}
          serverType={serverType}
          scope={scope}
          onDone={onDone}
        />
      )}
    </Box>
  )
}