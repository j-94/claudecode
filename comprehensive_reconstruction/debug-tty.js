#!/usr/bin/env node

/**
 * TTY Debug Utility for Claude CLI
 * 
 * This script helps diagnose TTY-related issues that could affect
 * the Claude CLI's interactive mode.
 */

import { spawnSync } from 'child_process';

console.log('TTY Diagnostics:');
console.log('----------------');

// Check stdin and stdout
console.log('TTY Status:');
console.log(`  process.stdin.isTTY: ${process.stdin.isTTY}`);
console.log(`  process.stdout.isTTY: ${process.stdout.isTTY}`);
console.log(`  process.stderr.isTTY: ${process.stderr.isTTY}`);

// Check Raw Mode capability
console.log('\nRaw Mode:');
if (process.stdin.isTTY) {
  try {
    console.log('  Attempting to set raw mode...');
    process.stdin.setRawMode(true);
    console.log('  √ Raw mode set successfully');
    process.stdin.setRawMode(false);
    console.log('  √ Raw mode reset successfully');
  } catch (error) {
    console.log(`  ✗ Error setting raw mode: ${error.message}`);
  }
} else {
  console.log('  ✗ Cannot set raw mode (stdin is not a TTY)');
}

// Check terminal environment
console.log('\nTerminal Environment:');
console.log(`  TERM: ${process.env.TERM || 'not set'}`);
console.log(`  COLORTERM: ${process.env.COLORTERM || 'not set'}`);
console.log(`  NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
console.log(`  Platform: ${process.platform}`);

// Check terminal dimensions
console.log('\nTerminal Dimensions:');
try {
  const columns = process.stdout.columns;
  const rows = process.stdout.rows;
  console.log(`  Columns: ${columns || 'unknown'}`);
  console.log(`  Rows: ${rows || 'unknown'}`);
} catch (error) {
  console.log(`  Cannot determine dimensions: ${error.message}`);
}

// Check for potential issues
console.log('\nPotential Issues:');
if (!process.stdin.isTTY) {
  console.log('  ✗ stdin is not a TTY (required for interactive mode)');
}
if (!process.stdout.isTTY) {
  console.log('  ✗ stdout is not a TTY (required for interactive mode)');
}
if (!process.stdin.isTTY && !process.stdout.isTTY) {
  console.log('  ✗ Running in a non-interactive environment (pipe or redirect)');
  console.log('    Interactive mode will not work; use --print mode instead');
}

// Add recommendations
console.log('\nRecommendations:');
if (!process.stdin.isTTY || !process.stdout.isTTY) {
  console.log('  • Run Claude CLI directly in a terminal without pipes or redirects');
  console.log('  • Use --print mode for non-interactive use cases');
} else {
  console.log('  • TTY environment looks good for interactive mode');
  console.log('  • If you still have issues, check terminal compatibility with Ink');
}

console.log('\nRunning Claude CLI in debug mode:');
console.log('-------------------------------');
console.log('Command: node run-claude.js --version');

// Run claude version as a simple test
try {
  const result = spawnSync('node', ['run-claude.js', '--version'], {
    stdio: 'inherit',
    env: process.env
  });
  console.log(`\nExit code: ${result.status || 0}`);
} catch (error) {
  console.log(`\nError running command: ${error.message}`);
}

// Exit with a clear message
console.log('\nDiagnostics complete. Use this information to troubleshoot TTY issues.');