#!/bin/bash

echo "Setting up MCP servers with commonjs type..."

# Create a new directory for MCP servers
mkdir -p mcp-servers-dir
cd mcp-servers-dir

# Copy the mcp-override.json as package.json
cp ../mcp-override.json package.json

# Copy all necessary files
cp ../github-search-server.js .
cp ../architect-server.js .
cp ../terminal-capture-server.js .
mkdir -p sentry-mcp-server
cp ../sentry-mcp-server/index.js sentry-mcp-server/
mkdir -p mcp-servers
cp ../mcp-servers/lotus-server.cjs mcp-servers/

# Install dependencies
npm install

# Create log directory if it doesn't exist
mkdir -p mcp-logs

# Kill any existing MCP server processes
pkill -f 'github-search|architect|terminal-capture|sentry|lotus' || true

# Start GitHub search server
echo "Starting GitHub search server..."
node github-search-server.js > mcp-logs/github-search.log 2>&1 &
echo "GitHub search server started with PID $!"

# Start Architect server
echo "Starting Architect server..."
node architect-server.js > mcp-logs/architect.log 2>&1 &
echo "Architect server started with PID $!"

# Start Terminal Capture server
echo "Starting Terminal Capture server..."
node terminal-capture-server.js > mcp-logs/terminal-capture.log 2>&1 &
echo "Terminal Capture server started with PID $!"

# Start Sentry server
echo "Starting Sentry server..."
node sentry-mcp-server/index.js > mcp-logs/sentry.log 2>&1 &
echo "Sentry server started with PID $!"

# Start Lotus server
echo "Starting Lotus server..."
node mcp-servers/lotus-server.cjs > mcp-logs/lotus.log 2>&1 &
echo "Lotus server started with PID $!"

echo "All MCP servers started! Logs available in the mcp-logs directory."
echo "Now run 'cd .. && npm run dev' in a new terminal window."