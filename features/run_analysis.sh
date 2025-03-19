#!/bin/bash

# Run the complete analysis pipeline for Claude Code versions

echo "Claude Code Analysis Pipeline"
echo "============================"
echo

# Step 1: Download and extract all versions
echo "Step 1: Downloading and extracting Claude Code versions..."
node release_analyzer.js

# Step 2: Compare versions to identify features
echo "Step 2: Comparing versions to identify features..."
node version_comparator.js

# Step 3: Attempt to reconstruct tools from minified code
echo "Step 3: Reconstructing tools from minified code..."
node reconstruct_tools.js

echo
echo "Analysis complete!"
echo "Results are available in the following directories:"
echo "- releases/: Downloaded and extracted packages"
echo "- version_analysis/: Detailed feature comparison and code snippets"
echo "- reconstructed/: Reconstructed tool implementations"