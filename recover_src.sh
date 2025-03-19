#!/bin/bash

# Create output directory
mkdir -p recovered_source/src

# Tool files to recover (key components)
files=(
  "src/tools/BashTool/BashTool.tsx"
  "src/tools/BashTool/prompt.ts"
  "src/tools/BashTool/utils.ts"
  "src/tools/FileReadTool/FileReadTool.tsx"
  "src/tools/FileEditTool/FileEditTool.tsx"
  "src/tools/FileWriteTool/FileWriteTool.tsx"
  "src/tools/GlobTool/GlobTool.tsx"
  "src/tools/GrepTool/GrepTool.tsx"
  "src/tools/lsTool/lsTool.tsx"
  "src/tools/AgentTool/AgentTool.tsx"
  "src/tools/NotebookReadTool/NotebookReadTool.tsx"
  "src/tools/NotebookEditTool/NotebookEditTool.tsx"
  "src/Tool.js"
  "src/tools.ts"
  "src/utils/PersistentShell.ts"
  "src/utils/commands.ts"
  "src/utils/file.ts"
  "src/utils/permissions/filesystem.ts"
  "src/utils/state.ts"
  "src/constants/product.ts"
)

# Recover each file
for file in "${files[@]}"; do
  dir=$(dirname "recovered_source/$file")
  mkdir -p "$dir"
  git show HEAD:"$file" > "recovered_source/$file" 2>/dev/null
  if [ $? -eq 0 ]; then
    echo "Recovered $file"
  else
    echo "Failed to recover $file"
  fi
done

echo "Recovery complete"