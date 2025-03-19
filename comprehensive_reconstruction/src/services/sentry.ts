import * as Sentry from '@sentry/node'
import { getUser } from '../utils/user.js'
import { env } from '../utils/env.js'
import { getCwd } from '../utils/state.js'
import { SENTRY_DSN } from '../constants/keys.js'
import { getGateValues } from './statsig.js'
import { SESSION_ID } from '../utils/log.js'
import { getIsGit } from '../utils/git.js'
import { MACRO } from '../constants/macro.js'

export function initSentry(): void {
  // Simple initialization that works without complex integrations
  try {
    Sentry.init({
      dsn: SENTRY_DSN,
      release: MACRO.VERSION
    });
  } catch (error) {
    console.error('Failed to initialize Sentry:', error);
  }
}

export async function captureException(error: unknown): Promise<void> {
  try {
    const [isGit, user] = await Promise.all([getIsGit(), getUser()])
    Sentry.setExtras({
      nodeVersion: env.nodeVersion,
      platform: env.platform,
      cwd: getCwd(),
      isCI: env.isCI,
      isGit,
      isTest: process.env.NODE_ENV === 'test',
      packageVersion: MACRO.VERSION,
      sessionId: SESSION_ID,
      statsigGates: getGateValues(),
      terminal: env.terminal,
      userType: process.env.USER_TYPE,
    })
    Sentry.setUser({
      id: user.userID,
      email: user.email,
    })
    Sentry.captureException(error)
  } catch {
    // ignore errors generated in error capture
  }
}