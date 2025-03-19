#!/usr/bin/env node

/**
 * Claude Code CLI - Reconstructed
 * 
 * A simplified command-line interface for Claude Code that works with
 * the reconstructed tools without requiring all the complex dependencies.
 */

import path from 'path';
import { fileURLToPath } from 'url';
import { Command } from 'commander';
import chalk from 'chalk';
import { BatchTool } from './src/tools/BatchTool/BatchTool.js';
import { BashTool } from './src/tools/BashTool/BashTool.js';
import { View } from './src/tools/View/View.js';
import { GlobTool } from './src/tools/GlobTool/GlobTool.js';
import { GrepTool } from './src/tools/GrepTool/GrepTool.js';
import { LSTool } from './src/tools/lsTool/lsTool.js';
import { ThinkTool } from './src/tools/ThinkTool/ThinkTool.js';

// Get the version from package.json
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PACKAGE_VERSION = '0.2.50';
const PRODUCT_NAME = 'Claude Code';

// Set up tool registry
const toolRegistry = {
  BatchTool,
  Bash: BashTool,
  View,
  GlobTool, 
  GrepTool,
  LS: LSTool,
  ThinkTool
};

// Simple context for tool execution
const context = {
  cwd: process.cwd(),
  tools: Object.values(toolRegistry),
  debug: false,
  verbose: false
};

// Main CLI setup
const program = new Command();

program
  .name('claude')
  .description(`${PRODUCT_NAME} Reconstructed CLI - A simplified implementation for tool testing`)
  .version(PACKAGE_VERSION, '-v, --version')
  .option('-d, --debug', 'Enable debug mode')
  .option('--verbose', 'Enable verbose output');

// Tools command - view available tools
program
  .command('tools')
  .description('List all available tools')
  .action(async () => {
    console.log(chalk.cyan.bold(`\n${PRODUCT_NAME} Tools`));
    console.log(chalk.cyan('='.repeat(PRODUCT_NAME.length + 6)));
    
    for (const [key, tool] of Object.entries(toolRegistry)) {
      console.log(chalk.green(`\n${tool.name} (${key})`));
      console.log(tool.description || 'No description available');
    }
  });

// Bash command
program
  .command('bash <command>')
  .description('Execute a bash command')
  .action(async (command) => {
    try {
      const result = await BashTool.call({ command }, context);
      console.log(result);
    } catch (error) {
      console.error(chalk.red('Error executing bash command:'), error.message);
    }
  });

// View command
program
  .command('view <file_path>')
  .description('View contents of a file')
  .option('-o, --offset <number>', 'Line to start reading from', parseInt)
  .option('-l, --limit <number>', 'Number of lines to read', parseInt)
  .action(async (file_path, options) => {
    try {
      const result = await View.call({
        file_path,
        offset: options.offset,
        limit: options.limit
      }, context);
      console.log(result);
    } catch (error) {
      console.error(chalk.red('Error viewing file:'), error.message);
    }
  });

// Glob command
program
  .command('glob <pattern>')
  .description('Find files matching pattern')
  .option('-p, --path <path>', 'Directory to search in', process.cwd())
  .action(async (pattern, options) => {
    try {
      const result = await GlobTool.call({
        pattern,
        path: options.path
      }, context);
      console.log(result);
    } catch (error) {
      console.error(chalk.red('Error finding files:'), error.message);
    }
  });

// Grep command
program
  .command('grep <pattern>')
  .description('Search for pattern in files')
  .option('-p, --path <path>', 'Directory to search in', process.cwd())
  .option('-i, --include <pattern>', 'File pattern to include')
  .action(async (pattern, options) => {
    try {
      const result = await GrepTool.call({
        pattern,
        path: options.path,
        include: options.include
      }, context);
      console.log(result);
    } catch (error) {
      console.error(chalk.red('Error searching files:'), error.message);
    }
  });

// LS command
program
  .command('ls [path]')
  .description('List files in directory')
  .action(async (dirPath = process.cwd()) => {
    try {
      const result = await LSTool.call({ path: dirPath }, context);
      console.log(result);
    } catch (error) {
      console.error(chalk.red('Error listing directory:'), error.message);
    }
  });

// Batch command
program
  .command('batch')
  .description('Run a batch of commands')
  .option('-d, --description <desc>', 'Batch description', 'Batch operation')
  .action(async (options) => {
    try {
      // Default batch example
      const result = await BatchTool.call({
        description: options.description,
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
      
      console.log(chalk.cyan.bold(`\nBatch Results (${result.length} operations in ${result.durationMs}ms):`));
      
      result.results.forEach(({ tool_name, result, error, success }) => {
        console.log(chalk.cyan(`\n--- ${tool_name} ${success ? 'Success' : 'Error'} ---`));
        if (success) {
          console.log(result);
        } else {
          console.log(chalk.red(error));
        }
      });
    } catch (error) {
      console.error(chalk.red('Error executing batch:'), error.message);
    }
  });

// Think command
program
  .command('think <query>')
  .description('Use ThinkTool for planning steps')
  .action(async (query) => {
    try {
      const result = await ThinkTool.call({ query }, context);
      console.log(chalk.cyan.bold("\nThinking Process:"));
      console.log(result);
    } catch (error) {
      console.error(chalk.red('Error executing ThinkTool:'), error.message);
    }
  });

// Default command (if no specific command is provided)
program
  .action(() => {
    console.log(chalk.cyan.bold(`\n${PRODUCT_NAME} Reconstructed CLI (v${PACKAGE_VERSION})`));
    console.log(chalk.cyan('A simplified implementation for tool testing\n'));
    console.log('To see available commands, run: claude --help');
    console.log('To see available tools, run: claude tools');
  });

// Parse command line arguments
program.parse(process.argv);