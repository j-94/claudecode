#!/usr/bin/env node

/**
 * Simple script to start the anthropic-proxy server for using OpenRouter with Claude Code
 * 
 * This script installs the necessary dependencies and runs the proxy server with the
 * user's OpenRouter API key.
 */

const { execSync } = require('child_process');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Get OpenRouter API key from user or environment
async function getApiKey() {
  const envKey = process.env.OPENROUTER_API_KEY;
  if (envKey) {
    console.log('Using OpenRouter API key from environment variables');
    return envKey;
  }

  return new Promise((resolve) => {
    rl.question('Enter your OpenRouter API key: ', (apiKey) => {
      resolve(apiKey.trim());
    });
  });
}

// Main function
async function main() {
  console.log('Setting up anthropic-proxy for OpenRouter...');
  
  try {
    // Check if anthropic-proxy is installed
    try {
      execSync('npm list -g anthropic-proxy', { stdio: 'ignore' });
      console.log('✅ anthropic-proxy is already installed');
    } catch (error) {
      console.log('Installing anthropic-proxy...');
      execSync('npm install -g anthropic-proxy', { stdio: 'inherit' });
      console.log('✅ anthropic-proxy installed successfully');
    }

    // Get API key from user
    const apiKey = await getApiKey();
    if (!apiKey) {
      console.error('❌ API key is required. Please get one from https://openrouter.ai/keys');
      process.exit(1);
    }

    // Save to .env file for future use
    const envPath = path.join(process.cwd(), '.env');
    let envContent = '';
    try {
      envContent = fs.readFileSync(envPath, 'utf8');
    } catch (error) {
      // File doesn't exist, create new one
    }

    // Check if OPENROUTER_API_KEY already exists in the file
    if (!envContent.includes('OPENROUTER_API_KEY=')) {
      fs.writeFileSync(
        envPath, 
        envContent + `\nOPENROUTER_API_KEY=${apiKey}\nUSE_OPENROUTER=true\n`,
        'utf8'
      );
      console.log('✅ Saved API key to .env file');
    }

    // Show instructions for running Claude
    console.log('\n🚀 Starting anthropic-proxy server...');
    console.log('Press Ctrl+C to stop the server\n');

    // Run the proxy with the API key
    const proxyCommand = `OPENROUTER_API_KEY=${apiKey} anthropic-proxy`;
    execSync(proxyCommand, { stdio: 'inherit' });

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});