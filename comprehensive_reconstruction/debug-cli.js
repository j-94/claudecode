#!/usr/bin/env node

/**
 * Debug CLI for Claude Code
 * 
 * A simple CLI interface for testing and debugging the reconstructed tools
 * directly, without the interactive UI components.
 */

import { BatchTool } from './src/tools/BatchTool/BatchTool.tsx';
import { BashTool } from './src/tools/BashTool/BashTool.tsx';
import { View } from './src/tools/View/View.tsx';
import { GlobTool } from './src/tools/GlobTool/GlobTool.tsx';
import { GrepTool } from './src/tools/GrepTool/GrepTool.tsx';
import { LSTool } from './src/tools/lsTool/lsTool.tsx';
import { ThinkTool } from './src/tools/ThinkTool/ThinkTool.tsx';
import { MACRO } from './src/constants/macro.js';

import { Command } from 'commander';

// Tool registry
const tools = {
  BatchTool,
  Bash: BashTool,
  View,
  Glob: GlobTool,
  Grep: GrepTool,
  LS: LSTool,
  Think: ThinkTool
};

// Context for tool execution
const context = {
  cwd: process.cwd(),
  tools: Object.values(tools),
  debug: true,
  verbose: true
};

// Set up the CLI
const program = new Command();

program
  .name('debug-claude')
  .description(`Claude Code Debug CLI v${MACRO.VERSION}`)
  .version(MACRO.VERSION)
  .option('-v, --verbose', 'Show verbose output', false)
  .option('--debug', 'Enable debug mode', false);

// List available tools
program
  .command('list-tools')
  .description('List all available tools')
  .action(() => {
    console.log('Available Tools:');
    for (const [name, tool] of Object.entries(tools)) {
      const desc = typeof tool.description === 'string' 
        ? tool.description.substring(0, 60) + '...'
        : 'No description available';
      console.log(`- ${name}: ${desc}`);
    }
  });

// Bash command
program
  .command('bash <command>')
  .description('Execute a bash command')
  .action(async (command) => {
    console.log(`Executing: ${command}`);
    try {
      const result = await BashTool.call({ command }, context);
      console.log('\nOutput:');
      console.log(result.stdout);
      
      if (result.stderr) {
        console.error('\nErrors:');
        console.error(result.stderr);
      }
      
      console.log(`\nExecution Stats:
- Success: ${!result.stderr}
- Stdout Lines: ${result.stdoutLines}
- Stderr Lines: ${result.stderrLines}
- Interrupted: ${result.interrupted}`);
    } catch (error) {
      console.error('Error executing bash command:', error);
    }
  });

// View command
program
  .command('view <file_path>')
  .description('View file contents')
  .option('-o, --offset <number>', 'Line offset', parseInt)
  .option('-l, --limit <number>', 'Line limit', parseInt)
  .action(async (filePath, options) => {
    console.log(`Reading file: ${filePath}`);
    try {
      const result = await View.call({
        file_path: filePath,
        offset: options.offset,
        limit: options.limit
      }, context);
      console.log('\nFile content:');
      console.log(result);
    } catch (error) {
      console.error('Error reading file:', error);
    }
  });

// Glob command
program
  .command('glob <pattern>')
  .description('Find files using glob pattern')
  .option('-p, --path <path>', 'Search path')
  .action(async (pattern, options) => {
    const searchPath = options.path || process.cwd();
    console.log(`Searching for files matching "${pattern}" in ${searchPath}`);
    try {
      const result = await GlobTool.call({
        pattern,
        path: searchPath
      }, context);
      console.log('\nMatching files:');
      console.log(result);
    } catch (error) {
      console.error('Error finding files:', error);
    }
  });

// Grep command
program
  .command('grep <pattern>')
  .description('Search for pattern in files')
  .option('-p, --path <path>', 'Search path')
  .option('-i, --include <pattern>', 'File pattern to include')
  .action(async (pattern, options) => {
    const searchPath = options.path || process.cwd();
    console.log(`Searching for "${pattern}" in ${searchPath}`);
    try {
      const result = await GrepTool.call({
        pattern,
        path: searchPath,
        include: options.include
      }, context);
      console.log('\nSearch results:');
      console.log(result);
    } catch (error) {
      console.error('Error searching files:', error);
    }
  });

// LS command
program
  .command('ls [path]')
  .description('List files in directory')
  .action(async (dirPath = process.cwd()) => {
    console.log(`Listing directory: ${dirPath}`);
    try {
      const result = await LSTool.call({ path: dirPath }, context);
      console.log('\nDirectory contents:');
      console.log(result);
    } catch (error) {
      console.error('Error listing directory:', error);
    }
  });

// Batch command
program
  .command('batch')
  .description('Run a batch of sample commands')
  .action(async () => {
    console.log('Running batch sample:');
    try {
      const result = await BatchTool.call({
        description: "Sample batch operation",
        invocations: [
          {
            tool_name: "Bash", 
            input: { command: "pwd" }
          },
          {
            tool_name: "LS", 
            input: { path: process.cwd() }
          }
        ]
      }, context);
      
      console.log('\nBatch Results:');
      console.log(JSON.stringify(result, null, 2));
    } catch (error) {
      console.error('Error executing batch:', error);
    }
  });

// Parse command line arguments
program.parse(process.argv);