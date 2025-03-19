import * as React from 'react'
import { Box, Text } from 'ink'
import { getTotalTokens } from '../cost-tracker.js'
import { useState, useEffect } from 'react'
import chalk from 'chalk'

interface TokenUsageDisplayProps {
  verbose?: boolean
  messages?: any[] // Replace with the actual type if available
}

export function TokenUsageDisplay({ 
  verbose = false,
  messages = []
}: TokenUsageDisplayProps): React.ReactElement {
  const [tokenUsage, setTokenUsage] = useState(getTotalTokens())
  
  // Update the token usage when messages change
  useEffect(() => {
    setTokenUsage(getTotalTokens())
  }, [messages])

  if (!verbose) {
    return (
      <Box>
        <Text color="gray">Tokens: {tokenUsage.total.toLocaleString()}</Text>
      </Box>
    )
  }

  return (
    <Box flexDirection="column">
      <Text color="gray">
        Tokens: {tokenUsage.total.toLocaleString()} (in: {tokenUsage.input.toLocaleString()}, out: {tokenUsage.output.toLocaleString()}, cached: {tokenUsage.cached.toLocaleString()})
      </Text>
    </Box>
  )
}