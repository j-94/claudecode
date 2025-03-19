#!/usr/bin/env node

/**
 * Claude CLI Launcher
 * 
 * This script runs the Claude CLI with the original implementation
 * using the proper TypeScript compilation through tsx.
 */

// Execute the CLI through TSX directly
import { spawnSync } from 'child_process';
import { existsSync } from 'fs';
import { resolve } from 'path';

// Configure essential environment variables
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// Set up global MACRO object for compatibility
global.MACRO = { VERSION: '0.2.50' };

// Add package checking
function checkPackages() {
  // Don't check packages with ES modules, as require.resolve isn't compatible
  // Skip this check, but we'll check for necessary files instead
  return true;
}

// Check for required files
function checkFiles() {
  const required = [
    './src/entrypoints/cli.tsx',
    './src/constants/macro.ts',
    './src/tools.ts'
  ];
  
  const missing = [];
  
  for (const file of required) {
    if (!existsSync(resolve(process.cwd(), file))) {
      missing.push(file);
    }
  }
  
  if (missing.length > 0) {
    console.error('Missing required files:', missing.join(', '));
    process.exit(1);
  }
}

// Configure TTY for interactive mode
function configureInteractiveTTY() {
  // Set specific environment variables to help with interactive mode
  process.env.FORCE_COLOR = '1';
  process.env.TERM = process.env.TERM || 'xterm-256color';
  
  // Important for Ink's raw mode
  process.env.INK_ENABLE_RAW_MODE = '1';
  
  // Check if stdin/stdout are TTYs
  const stdinIsTTY = process.stdin.isTTY;
  const stdoutIsTTY = process.stdout.isTTY;
  
  if (!stdinIsTTY || !stdoutIsTTY) {
    console.warn('Warning: stdin or stdout is not a TTY. Interactive mode may not function correctly.');
    console.warn(`stdin.isTTY: ${stdinIsTTY}, stdout.isTTY: ${stdoutIsTTY}`);
  }
  
  return { stdinIsTTY, stdoutIsTTY };
}

// Detect operating system and make any OS-specific adjustments
function detectAndConfigureOS() {
  const platform = process.platform;
  
  // Set OS-specific environment variables
  if (platform === 'win32') {
    // Windows-specific configuration
    process.env.FORCE_HYPERLINK = '0'; // Disable hyperlinks on Windows terminals
  } else if (platform === 'darwin') {
    // macOS-specific configuration
    process.env.FORCE_HYPERLINK = '1'; 
  } else {
    // Linux and other Unix-like systems
    process.env.FORCE_HYPERLINK = '1';
  }
  
  return platform;
}

// Main function to run the CLI
function runCLI() {
  // Check requirements
  checkPackages();
  checkFiles();
  
  // Disable warnings
  const nodeOptions = process.env.NODE_OPTIONS || '';
  process.env.NODE_OPTIONS = `${nodeOptions} --no-warnings`;
  
  // Configure OS-specific settings
  const platform = detectAndConfigureOS();
  
  // Run the CLI through tsx with preload
  console.log('Starting Claude CLI...');
  
  // Check if we're just checking version or help (non-interactive)
  const isNonInteractive = process.argv.includes('--version') || 
                          process.argv.includes('-v') || 
                          process.argv.includes('--help') || 
                          process.argv.includes('-h') ||
                          process.argv.includes('--print') ||
                          process.argv.includes('-p');
  
  // Use different command for interactive vs non-interactive
  if (isNonInteractive) {
    // Non-interactive mode is simpler to run
    console.log('Running in non-interactive mode...');
    const result = spawnSync('npx', [
      'tsx',
      '--require=./preload.js',
      './src/entrypoints/cli.tsx', 
      ...process.argv.slice(2)
    ], {
      stdio: 'inherit',
      env: process.env
    });
    return result.status || 0;
  } else {
    // For interactive mode, we need to configure TTY properly
    console.log('Running in interactive mode...');
    
    // Configure TTY for interactive mode
    const { stdinIsTTY, stdoutIsTTY } = configureInteractiveTTY();
    
    // If we have proper TTY support, try running in interactive mode
    if (stdinIsTTY && stdoutIsTTY) {
      try {
        // Run CLI with properly configured TTY
        const result = spawnSync('npx', [
          'tsx',
          '--require=./preload.js',
          './src/entrypoints/cli.tsx'
        ], {
          stdio: 'inherit',
          env: process.env,
          shell: false
        });
        
        // Check if we had an error (non-zero exit code)
        if (result.status !== 0) {
          console.error('Interactive mode failed with exit code:', result.status);
          console.error('Falling back to print mode...');
          return runPrintMode();
        }
        
        return result.status || 0;
      } catch (error) {
        console.error('Error running interactive mode:', error.message);
        console.error('Falling back to print mode...');
        return runPrintMode();
      }
    } else {
      console.warn('No TTY available, falling back to print mode...');
      return runPrintMode();
    }
  }
}

// Fallback to print mode
function runPrintMode() {
  // Use --print mode with a simple prompt for testing
  const result = spawnSync('npx', [
    'tsx',
    '--require=./preload.js',
    './src/entrypoints/cli.tsx',
    '-p',  // Force print mode to avoid Ink issues 
    'Hello! This is a test of the Claude CLI.'
  ], {
    stdio: 'inherit',
    env: process.env
  });
  process.exit(result.status || 0);
}

// Run the CLI
runCLI();