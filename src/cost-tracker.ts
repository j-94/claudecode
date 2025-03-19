import chalk from 'chalk'
import { useEffect } from 'react'
import { formatDuration } from './utils/format.js'
import {
  getCurrentProjectConfig,
  saveCurrentProjectConfig,
} from './utils/config.js'
import { SESSION_ID } from './utils/log.js'

// DO NOT ADD MORE STATE HERE OR BORIS WILL CURSE YOU
const STATE: {
  totalCost: number
  totalAPIDuration: number
  startTime: number
  totalTokens: {
    input: number
    output: number
    cached: number
  }
} = {
  totalCost: 0,
  totalAPIDuration: 0,
  startTime: Date.now(),
  totalTokens: {
    input: 0,
    output: 0,
    cached: 0
  }
}

export function addToTotalCost(cost: number, duration: number): void {
  STATE.totalCost += cost
  STATE.totalAPIDuration += duration
}

export function addToTotalTokens(input: number, output: number, cached: number = 0): void {
  STATE.totalTokens.input += input;
  STATE.totalTokens.output += output;
  STATE.totalTokens.cached += cached;
}

export function getTotalTokens(): { input: number, output: number, cached: number, total: number } {
  const { input, output, cached } = STATE.totalTokens;
  return {
    input,
    output,
    cached,
    total: input + output
  };
}

export function getTotalCost(): number {
  return STATE.totalCost
}

export function getTotalDuration(): number {
  return Date.now() - STATE.startTime
}

export function getTotalAPIDuration(): number {
  return STATE.totalAPIDuration
}

function formatCost(cost: number): string {
  return `$${cost > 0.5 ? round(cost, 100).toFixed(2) : cost.toFixed(4)}`
}

export function formatTotalCost(): string {
  const tokens = getTotalTokens();
  return chalk.grey(
    `Total cost: ${formatCost(STATE.totalCost)}
Total tokens: ${tokens.total.toLocaleString()} (in: ${tokens.input.toLocaleString()}, out: ${tokens.output.toLocaleString()}, cached: ${tokens.cached.toLocaleString()})
Total duration (API): ${formatDuration(STATE.totalAPIDuration)}
Total duration (wall): ${formatDuration(getTotalDuration())}`,
  )
}

export function useCostSummary(): void {
  useEffect(() => {
    const f = () => {
      process.stdout.write('\n' + formatTotalCost() + '\n')

      // Save last cost, duration, and token usage to project config
      const projectConfig = getCurrentProjectConfig()
      const tokens = getTotalTokens();
      saveCurrentProjectConfig({
        ...projectConfig,
        lastCost: STATE.totalCost,
        lastAPIDuration: STATE.totalAPIDuration,
        lastDuration: getTotalDuration(),
        lastSessionId: SESSION_ID,
        lastTokenUsage: {
          input: tokens.input,
          output: tokens.output,
          cached: tokens.cached,
          total: tokens.total
        },
      })
    }
    process.on('exit', f)
    return () => {
      process.off('exit', f)
    }
  }, [])
}

function round(number: number, precision: number): number {
  return Math.round(number * precision) / precision
}

// Only used in tests
export function resetStateForTests(): void {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('resetStateForTests can only be called in tests')
  }
  STATE.startTime = Date.now()
  STATE.totalCost = 0
  STATE.totalAPIDuration = 0
  STATE.totalTokens = {
    input: 0,
    output: 0,
    cached: 0
  }
}
