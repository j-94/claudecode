/**
 * Preload script for Claude CLI
 * 
 * Sets up global variables and patches that are needed for the CLI to run properly.
 * This file is loaded before the main CLI script to establish the global environment.
 */

// Set up global MACRO object
global.MACRO = { VERSION: '0.2.50' };

// Polyfill missing APIs if necessary
if (!global.fetch) {
  try {
    // Try to load node-fetch
    const nodeFetch = require('node-fetch');
    global.fetch = nodeFetch;
    global.Headers = nodeFetch.Headers;
    global.Request = nodeFetch.Request;
    global.Response = nodeFetch.Response;
  } catch (error) {
    console.warn('node-fetch not available, fetch API may not work');
  }
}

// Patch console for better error reporting
const originalConsoleError = console.error;
console.error = function(...args) {
  // Filter out some known harmless errors
  const errorText = args.join(' ');
  if (
    errorText.includes('ExperimentalWarning') ||
    errorText.includes('--trace-warnings') ||
    errorText.includes('Statsig') ||
    errorText.includes('Warning: Using stdin in non-TTY')
  ) {
    return;
  }
  
  return originalConsoleError.apply(this, args);
};

// TTY Support and Patches
try {
  // Support for Ink's raw mode in different TTY environments
  if (process.stdin.isTTY && process.stdout.isTTY) {
    // If we're in a TTY, try to patch stdin/stdout handling for Ink
    const tty = require('tty');
    
    // Ensure we can handle setRawMode
    if (typeof process.stdin.setRawMode !== 'function') {
      const originalSetRawMode = tty.ReadStream.prototype.setRawMode;
      
      // Create a safe wrapper around setRawMode
      process.stdin.setRawMode = function(mode) {
        try {
          // If we're a TTY, use the original implementation
          if (this.isTTY) {
            return originalSetRawMode.call(this, mode);
          }
          
          // Otherwise, just quietly return
          return this;
        } catch (error) {
          console.warn('Warning: Failed to set raw mode:', error.message);
          return this;
        }
      };
    }
    
    // Handle exit gracefully
    process.on('beforeExit', () => {
      try {
        process.stdin.setRawMode?.(false);
      } catch (e) {
        // Ignore errors during shutdown
      }
    });
  }
} catch (error) {
  console.warn('Warning: TTY patching failed:', error.message);
}