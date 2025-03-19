#!/bin/bash

echo "Starting MCP servers..."

# Create log directory if it doesn't exist
mkdir -p mcp-logs

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
echo "Now run 'npm run dev' in a new terminal window."