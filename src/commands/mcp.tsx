import React from 'react'
import { Text, Box } from 'ink'
import fs from 'fs'
import path from 'path'
import { spawn } from 'child_process'
import { getCwd } from '../utils/state.js'

const MCP_CONFIG_FILE = '.mcprc'

type MCPToolConfig = {
  type: string
  command: string
  args: string[]
  env: Record<string, string>
}

type MCPConfig = Record<string, MCPToolConfig>

/**
 * Install and manage MCP servers
 */
export const mcp = {
  type: 'local',
  name: 'mcp',
  isEnabled: true,
  isHidden: false,
  description: 'Manage Model Context Protocol (MCP) servers',
  userFacingName() {
    return 'mcp'
  },
  async call(args: string, context: any): Promise<string> {
    // Parse arguments manually
    const parts = args.split(' ').filter(Boolean)
    let action = parts[0] || 'list'
    const server = parts[1]
    const options = {
      all: parts.includes('--all') || parts.includes('-a'),
      debug: parts.includes('--debug') || parts.includes('-d')
    }
    
    const MCP_CONFIG_FILE = '.mcprc'
    
    /**
     * Reads the MCP configuration file
     */
    function getMCPConfig(): MCPConfig {
      const projectRoot = getCwd()
      const configPath = path.join(projectRoot, MCP_CONFIG_FILE)
      
      if (!fs.existsSync(configPath)) {
        return {}
      }
      
      try {
        const configContent = fs.readFileSync(configPath, 'utf-8')
        return JSON.parse(configContent)
      } catch (error) {
        console.error(`Error reading MCP config: ${error}`)
        return {}
      }
    }
    
    /**
     * Lists all configured MCP servers
     */
    async function listMCPServers(debug = false) {
      const config = getMCPConfig()
      const servers = Object.keys(config)
      
      if (servers.length === 0) {
        console.log('No MCP servers configured. Use "claude mcp add <server-name>" to add one.')
        return
      }
      
      console.log('\nConfigured MCP Servers:')
      
      for (const server of servers) {
        const serverConfig = config[server]
        console.log(`\n• ${server}:`)
        console.log(`  - Type: ${serverConfig.type}`)
        console.log(`  - Command: ${serverConfig.command} ${serverConfig.args.join(' ')}`)
        
        if (debug && Object.keys(serverConfig.env).length > 0) {
          console.log('  - Environment:')
          for (const [key, value] of Object.entries(serverConfig.env)) {
            console.log(`    ${key}: ${value}`)
          }
        }
      }
      
      console.log('\nUse "claude mcp start <server-name>" to start a server')
    }
    
    /**
     * Installs an MCP server
     */
    async function installMCPServer(serverName: string, debug = false) {
      const config = getMCPConfig()
      
      if (!config[serverName]) {
        console.error(`Server "${serverName}" not found in MCP configuration`)
        return
      }
      
      console.log(`Installing MCP server: ${serverName}...`)
      
      // Implementation depends on server type
      switch (serverName) {
        case 'github-search':
          await installGitHubSearchServer(debug)
          break
        case 'architect':
          await installArchitectServer(debug)
          break
        case 'terminal-capture':
          await installTerminalCaptureServer(debug)
          break
        default:
          console.log(`No specific installation steps for ${serverName}, checking dependencies...`)
          await checkServerDependencies(serverName, config[serverName], debug)
          break
      }
    }
    
    /**
     * Installs all configured MCP servers
     */
    async function installAllMCPServers(debug = false) {
      const config = getMCPConfig()
      const servers = Object.keys(config)
      
      if (servers.length === 0) {
        console.log('No MCP servers configured')
        return
      }
      
      for (const server of servers) {
        await installMCPServer(server, debug)
      }
    }
    
    /**
     * Starts an MCP server
     */
    async function startMCPServer(serverName: string, debug = false) {
      const config = getMCPConfig()
      
      if (!config[serverName]) {
        console.error(`Server "${serverName}" not found in MCP configuration`)
        return
      }
      
      const serverConfig = config[serverName]
      console.log(`Starting MCP server: ${serverName}...`)
      
      // Create log directory if it doesn't exist
      const projectRoot = getCwd()
      const logDir = path.join(projectRoot, 'mcp-logs')
      if (!fs.existsSync(logDir)) {
        try {
          fs.mkdirSync(logDir, { recursive: true });
          console.log(`Created logs directory: ${logDir}`);
        } catch (err) {
          console.error(`Failed to create logs directory: ${err}`);
        }
      }
      
      const logFile = path.join(logDir, `${serverName}.log`)
      const logStream = fs.createWriteStream(logFile, { flags: 'a' })
      
      const env = { ...process.env, ...serverConfig.env }
      
      if (debug) {
        console.log(`Command: ${serverConfig.command} ${serverConfig.args.join(' ')}`)
        console.log(`Log file: ${logFile}`)
      }
      
      try {
        // Add timestamp to log
        logStream.write(`\n[${new Date().toISOString()}] Starting ${serverName} server\n`)
        
        const stdio = debug ? 'inherit' : ['ignore', logStream, logStream]
        
        const child = spawn(serverConfig.command, serverConfig.args, {
          env,
          stdio: stdio as any, // Type assertion needed
          detached: true
        })
        
        child.unref()
        
        // Handle process events
        if (!debug) {
          child.on('error', (err) => {
            logStream.write(`\n[ERROR] ${err.message}\n`)
            console.error(`Error starting ${serverName}: ${err.message}`)
          })
          
          // Check if process started successfully (wait a short time)
          await new Promise(resolve => setTimeout(resolve, 500))
        }
        
        if (child.pid) {
          console.log(`Server ${serverName} started with PID ${child.pid}`)
          console.log(`Logs available at: ${logFile}`)
          return true
        } else {
          console.error(`Failed to start ${serverName} server`)
          return false
        }
      } catch (error) {
        console.error(`Error starting ${serverName} server: ${error}`)
        logStream.write(`\n[ERROR] Failed to start: ${error}\n`)
        return false
      }
    }
    
    /**
     * Starts all configured MCP servers
     */
    async function startAllMCPServers(debug = false) {
      const config = getMCPConfig()
      const servers = Object.keys(config)
      
      if (servers.length === 0) {
        console.log('No MCP servers configured. Use "claude mcp add <server-name>" to add one.')
        // Add standard servers automatically
        const standardServers = ['github-search', 'architect', 'terminal-capture', 'sentry', 'lotus']
        
        if (fs.existsSync(path.join(getCwd(), 'github-search-server.js'))) {
          console.log('Found standard MCP server files. Would you like to add them? (y/n)')
          process.stdout.write('> ')
          
          const response = await new Promise<string>(resolve => {
            const stdin = process.stdin
            stdin.resume()
            stdin.setEncoding('utf8')
            stdin.once('data', data => {
              resolve(data.toString().trim().toLowerCase())
              stdin.pause()
            })
          })
          
          if (response === 'y' || response === 'yes') {
            console.log('Adding standard MCP servers...')
            for (const server of standardServers) {
              await addMCPServer(server, debug)
            }
            return
          }
        }
        
        return
      }
      
      console.log(`Starting ${servers.length} MCP servers...`)
      const results = []
      
      for (const server of servers) {
        const success = await startMCPServer(server, debug)
        results.push({ server, success })
      }
      
      // Summary
      console.log('\nMCP Server Start Summary:')
      const successful = results.filter(r => r.success).map(r => r.server)
      const failed = results.filter(r => !r.success).map(r => r.server)
      
      if (successful.length > 0) {
        console.log(`✅ Started ${successful.length} servers: ${successful.join(', ')}`)
      }
      
      if (failed.length > 0) {
        console.log(`❌ Failed to start ${failed.length} servers: ${failed.join(', ')}`)
        console.log('Check logs in the mcp-logs directory for details')
      }
    }
    
    /**
     * Stops an MCP server
     */
    async function stopMCPServer(serverName: string, debug = false) {
      console.log(`Stopping MCP server: ${serverName}...`)
      // This is simplified and would need process management in a real implementation
      console.log(`Please use your OS task manager to stop ${serverName} server processes`)
    }
    
    /**
     * Stops all configured MCP servers
     */
    async function stopAllMCPServers(debug = false) {
      const config = getMCPConfig()
      const servers = Object.keys(config)
      
      if (servers.length === 0) {
        console.log('No MCP servers configured')
        return
      }
      
      for (const server of servers) {
        await stopMCPServer(server, debug)
      }
    }
    
    /**
     * Adds a new MCP server configuration
     */
    async function addMCPServer(serverName: string, debug = false) {
      const config = getMCPConfig()
      
      if (config[serverName]) {
        console.log(`Server "${serverName}" already exists. Updating configuration...`)
      } else {
        console.log(`Adding new MCP server: ${serverName}...`)
      }
      
      // Standard server configurations for known servers
      let serverConfig: MCPToolConfig;
      
      switch(serverName) {
        case 'github-search':
          serverConfig = {
            type: 'stdio',
            command: 'node',
            args: ['github-search-server.js'],
            env: {}
          };
          break;
        case 'architect':
          serverConfig = {
            type: 'stdio',
            command: 'node',
            args: ['architect-server.js'],
            env: {}
          };
          break;
        case 'terminal-capture':
          serverConfig = {
            type: 'stdio',
            command: 'node',
            args: ['terminal-capture-server.js'],
            env: {}
          };
          break;
        case 'sentry':
          serverConfig = {
            type: 'stdio',
            command: 'node',
            args: ['sentry-mcp-server/index.js'],
            env: {}
          };
          break;
        case 'lotus':
          serverConfig = {
            type: 'stdio',
            command: 'node',
            args: ['mcp-servers/lotus-server.cjs'],
            env: {}
          };
          break;
        default:
          // Default configuration for unknown servers
          serverConfig = {
            type: 'stdio',
            command: 'node',
            args: [`${serverName}-server.js`],
            env: {}
          };
      }
      
      // Add to configuration
      config[serverName] = serverConfig
      
      // Save configuration
      const projectRoot = getCwd()
      const configPath = path.join(projectRoot, MCP_CONFIG_FILE)
      
      try {
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
        console.log(`Server "${serverName}" added to MCP configuration`)
        
        // Try to install the server automatically
        try {
          await installMCPServer(serverName, debug)
          
          // Try to start the server automatically
          console.log(`Starting server ${serverName}...`)
          await startMCPServer(serverName, debug)
        } catch (installError) {
          console.error(`Error during auto-install/start: ${installError}`)
          console.log('You can manually install and start the server with:')
          console.log(`  claude mcp install ${serverName}`)
          console.log(`  claude mcp start ${serverName}`)
        }
      } catch (error) {
        console.error(`Error saving MCP config: ${error}`)
      }
    }
    
    /**
     * GitHub Search server installation
     */
    async function installGitHubSearchServer(debug = false) {
      console.log('Installing GitHub Search MCP server...')
      
      try {
        // Check if server file exists
        const projectRoot = getCwd()
        const serverPath = path.join(projectRoot, 'github-search-server.js')
        
        if (!fs.existsSync(serverPath)) {
          console.error('Server file not found: github-search-server.js')
          return
        }
        
        // Check dependencies
        const { execSync } = require('child_process')
        
        try {
          execSync('npm list github-search-api', { stdio: 'ignore' })
          console.log('GitHub Search API dependency already installed')
        } catch (error) {
          console.log('Installing GitHub Search API dependency...')
          execSync('npm install --save github-search-api', { stdio: 'inherit' })
        }
        
        console.log('GitHub Search MCP server installed successfully')
      } catch (error) {
        console.error(`Installation error: ${error}`)
      }
    }
    
    /**
     * Architect server installation
     */
    async function installArchitectServer(debug = false) {
      console.log('Installing Architect MCP server...')
      
      try {
        // Check if server file exists
        const projectRoot = getCwd()
        const serverPath = path.join(projectRoot, 'architect-server.js')
        
        if (!fs.existsSync(serverPath)) {
          console.error('Server file not found: architect-server.js')
          return
        }
        
        // Check dependencies
        const { execSync } = require('child_process')
        
        try {
          execSync('npm list nodejs-file-downloader', { stdio: 'ignore' })
          console.log('Nodejs File Downloader dependency already installed')
        } catch (error) {
          console.log('Installing Nodejs File Downloader dependency...')
          execSync('npm install --save nodejs-file-downloader', { stdio: 'inherit' })
        }
        
        console.log('Architect MCP server installed successfully')
      } catch (error) {
        console.error(`Installation error: ${error}`)
      }
    }
    
    /**
     * Terminal Capture server installation
     */
    async function installTerminalCaptureServer(debug = false) {
      console.log('Installing Terminal Capture MCP server...')
      
      try {
        // Check if server file exists
        const projectRoot = getCwd()
        const serverPath = path.join(projectRoot, 'terminal-capture-server.js')
        
        if (!fs.existsSync(serverPath)) {
          console.error('Server file not found: terminal-capture-server.js')
          return
        }
        
        // No additional dependencies needed
        console.log('Terminal Capture MCP server installed successfully')
      } catch (error) {
        console.error(`Installation error: ${error}`)
      }
    }
    
    /**
     * Check server dependencies
     */
    async function checkServerDependencies(serverName: string, config: MCPToolConfig, debug = false) {
      console.log(`Checking dependencies for ${serverName}...`)
      
      const projectRoot = getCwd()
      const serverPath = path.join(projectRoot, `${serverName}-server.js`)
      
      if (!fs.existsSync(serverPath)) {
        console.error(`Server file not found: ${serverName}-server.js`)
        return
      }
      
      console.log(`Server file found: ${serverName}-server.js`)
      
      // Check if the command is available
      try {
        const { execSync } = require('child_process')
        execSync(`command -v ${config.command}`, { stdio: 'ignore' })
        console.log(`Command available: ${config.command}`)
      } catch (error) {
        console.error(`Command not found: ${config.command}`)
      }
      
      console.log('All dependency checks completed')
    }
    
    // Execute the appropriate action based on arguments
    switch (action) {
      case 'list':
        await listMCPServers(options.debug)
        break
      case 'install':
        if (server) {
          await installMCPServer(server, options.debug)
        } else if (options.all) {
          await installAllMCPServers(options.debug)
        } else {
          console.error('Please specify a server name or use --all flag')
        }
        break
      case 'start':
        if (server) {
          await startMCPServer(server, options.debug)
        } else if (options.all) {
          await startAllMCPServers(options.debug)
        } else {
          console.error('Please specify a server name or use --all flag')
        }
        break
      case 'stop':
        if (server) {
          await stopMCPServer(server, options.debug)
        } else if (options.all) {
          await stopAllMCPServers(options.debug)
        } else {
          console.error('Please specify a server name or use --all flag')
        }
        break
      case 'add':
        if (server) {
          await addMCPServer(server, options.debug)
        } else {
          console.error('Please specify a server name to add')
        }
        break
      default:
        console.error(`Unknown action: ${action}`)
        break
    }
    
    return "MCP server operation completed."
  }
}

export default function MCPCommand() {
  return (
    <Box flexDirection="column" padding={1}>
      <Text bold>Claude Code MCP Server Manager</Text>
      <Text>Manage Model Context Protocol (MCP) servers that extend Claude's capabilities</Text>
      <Box marginY={1}>
        <Text bold>Available Commands:</Text>
        <Text>  claude mcp list              - List all configured servers</Text>
        <Text>  claude mcp add [server]      - Add a server configuration</Text>
        <Text>  claude mcp start [server]    - Start a specific server</Text>
        <Text>  claude mcp start --all       - Start all configured servers</Text>
        <Text>  claude mcp stop [server]     - Stop a specific server</Text>
        <Text>  claude mcp install [server]  - Install a specific server</Text>
      </Box>
      <Box marginY={1}>
        <Text bold>Standard MCP Servers:</Text>
        <Text>  github-search    - Search GitHub repositories</Text>
        <Text>  architect        - Generate project templates and analyze code</Text>
        <Text>  terminal-capture - Capture and analyze terminal output</Text>
        <Text>  sentry           - Retrieve and analyze issues from Sentry</Text>
        <Text>  lotus            - Natural language data exploration</Text>
      </Box>
      <Box marginY={1}>
        <Text>Example: claude mcp add github-search</Text>
        <Text>Example: claude mcp start --all</Text>
      </Box>
    </Box>
  )
}