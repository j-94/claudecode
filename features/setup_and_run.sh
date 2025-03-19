#!/bin/bash

# Setup and run the Claude Code analysis tools

# Create a package.json file if it doesn't exist
if [[ ! -f package.json ]]; then
  echo "Creating package.json..."
  cat > package.json << EOF
{
  "name": "claude-code-analyzer",
  "version": "1.0.0",
  "description": "Analysis tools for Claude Code",
  "type": "commonjs",
  "dependencies": {
    "source-map": "^0.7.4"
  }
}
EOF
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Make scripts executable
chmod +x release_analyzer.js
chmod +x source_map_decoder.js

# Create reference data from original codebase
echo "Creating reference data from original codebase..."
mkdir -p releases/reference

# List all tools in original codebase
ORIGINAL_TOOLS_DIR="/Users/jobs/Desktop/claudecode/claude-code/original_codebase/src/tools"
if [[ -d "$ORIGINAL_TOOLS_DIR" ]]; then
  ls -la "$ORIGINAL_TOOLS_DIR" > releases/reference/original_tools.txt
  
  # Generate structure of original codebase
  find "/Users/jobs/Desktop/claudecode/claude-code/original_codebase" -type f -name "*.ts" -o -name "*.tsx" | sort > releases/reference/original_source_files.txt
  
  # Count original code statistics
  echo "Original codebase statistics:" > releases/reference/stats.txt
  echo "Tools: $(ls -1 $ORIGINAL_TOOLS_DIR | wc -l)" >> releases/reference/stats.txt
  echo "Commands: $(ls -1 /Users/jobs/Desktop/claudecode/claude-code/original_codebase/src/commands/*.ts 2>/dev/null | wc -l)" >> releases/reference/stats.txt
  echo "Components: $(find /Users/jobs/Desktop/claudecode/claude-code/original_codebase/src/components -name "*.tsx" | wc -l)" >> releases/reference/stats.txt
  echo "Utilities: $(find /Users/jobs/Desktop/claudecode/claude-code/original_codebase/src/utils -name "*.ts" | wc -l)" >> releases/reference/stats.txt
else
  echo "Original codebase not found at $ORIGINAL_TOOLS_DIR"
fi

# Run the release analyzer
echo "Running release analyzer..."
node release_analyzer.js

# Run the source map decoder
echo "Running source map decoder..."
node source_map_decoder.js

echo "Analysis complete! Check the 'releases' directory for results."
echo "Key reports:"
echo "- releases/reports/feature_comparison.md"
echo "- releases/reconstructed/source_analysis.md"
echo "- releases/reconstructed/original_comparison.md"