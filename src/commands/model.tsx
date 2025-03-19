import { Command } from '../commands.js'
import * as React from 'react'
import { Box, Text, useInput } from 'ink'
import { useState } from 'react'
import figures from 'figures'
import { getTheme } from '../utils/theme.js'
import { getGlobalConfig, saveGlobalConfig } from '../utils/config.js'
import chalk from 'chalk'
import { useExitOnCtrlCD } from '../hooks/useExitOnCtrlCD.js'

type Props = {
  onClose: () => void
}

interface ModelOption {
  id: string
  name: string
  description: string
}

export function ModelSelector({ onClose }: Props): React.ReactNode {
  const [globalConfig, setGlobalConfig] = useState(getGlobalConfig())
  const initialConfig = React.useRef(getGlobalConfig())
  const [selectedIndex, setSelectedIndex] = useState(0)
  const exitState = useExitOnCtrlCD(() => process.exit(0))

  // Available models
  const modelOptions: ModelOption[] = [
    {
      id: 'claude-3-7-sonnet-20250219',
      name: 'Claude 3.7 Sonnet (default)',
      description: 'Balanced for performance and cost',
    },
    {
      id: 'claude-3-5-sonnet-20240620',
      name: 'Claude 3.5 Sonnet',
      description: 'Well-balanced model',
    },
    {
      id: 'claude-3-5-haiku-20241022',
      name: 'Claude 3.5 Haiku',
      description: 'Fast and efficient model',
    },
  ]

  // Get current model from config
  const currentModel = globalConfig.preferredModel || 'claude-3-7-sonnet-20250219'
  
  // Initialize selected index to match current model
  React.useEffect(() => {
    const currentModelIndex = modelOptions.findIndex(option => option.id === currentModel)
    if (currentModelIndex >= 0) {
      setSelectedIndex(currentModelIndex)
    }
  }, [currentModel])

  useInput((input, key) => {
    if (key.escape) {
      // Log any changes that were made
      if (globalConfig.preferredModel !== initialConfig.current.preferredModel) {
        console.log(chalk.gray(`  ⎿  Switched to model: ${chalk.bold(globalConfig.preferredModel || 'default')}`))
      }
      onClose()
      return
    }

    function selectModel() {
      const selectedModel = modelOptions[selectedIndex]
      if (!selectedModel) return

      const config = { ...getGlobalConfig(), preferredModel: selectedModel.id }
      saveGlobalConfig(config)
      setGlobalConfig(config)
    }

    if (key.return || input === ' ') {
      selectModel()
      return
    }

    if (key.upArrow) {
      setSelectedIndex(prev => Math.max(0, prev - 1))
    }

    if (key.downArrow) {
      setSelectedIndex(prev => Math.min(modelOptions.length - 1, prev + 1))
    }
  })

  return (
    <>
      <Box
        flexDirection="column"
        borderStyle="round"
        borderColor={getTheme().secondaryBorder}
        paddingX={1}
        marginTop={1}
      >
        <Box flexDirection="column" minHeight={2} marginBottom={1}>
          <Text bold>Model Selection</Text>
          <Text dimColor>Choose which Claude model to use</Text>
        </Box>

        {modelOptions.map((model, i) => {
          const isSelected = i === selectedIndex
          const isActive = model.id === globalConfig.preferredModel

          return (
            <Box key={model.id} flexDirection="column" paddingY={1}>
              <Box>
                <Text color={isSelected ? 'blue' : undefined}>
                  {isSelected ? figures.pointer : ' '} {model.name}
                  {isActive && !isSelected ? ' ' + figures.radioOn : ''}
                </Text>
              </Box>
              <Box marginLeft={2}>
                <Text color={isSelected ? 'blue' : undefined} dimColor={!isSelected}>
                  {model.description}
                </Text>
              </Box>
            </Box>
          )
        })}
      </Box>
      <Box marginLeft={3}>
        <Text dimColor>
          {exitState.pending ? (
            <>Press {exitState.keyName} again to exit</>
          ) : (
            <>↑/↓ to select · Enter/Space to choose · Esc to close</>
          )}
        </Text>
      </Box>
    </>
  )
}

const model = {
  type: 'local-jsx',
  name: 'model',
  description: 'Select which Claude model to use',
  isEnabled: true,
  isHidden: false,
  async call(onDone) {
    return <ModelSelector onClose={onDone} />
  },
  userFacingName() {
    return 'model'
  },
} satisfies Command

export default model