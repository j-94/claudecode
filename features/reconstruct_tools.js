#!/usr/bin/env node

/**
 * Tool Reconstructor
 * 
 * This script attempts to reconstruct source code for tools added in newer versions
 * based on patterns found in the original codebase and snippets from minified code.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const SNIPPETS_DIR = path.join(__dirname, 'version_analysis');
const ORIGINAL_CODEBASE = path.join(__dirname, '..', 'original_codebase');
const OUTPUT_DIR = path.join(__dirname, 'reconstructed');

// Create output directory
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// Tools to reconstruct
const TOOLS_TO_RECONSTRUCT = [
  'BatchTool',
  'WebFetch',
  'View' // This replaces FileReadTool in newer versions
];

/**
 * Analyzes original tool implementations to understand patterns
 */
function analyzeOriginalTools() {
  console.log('Analyzing original tool implementations...');
  
  const toolsDir = path.join(ORIGINAL_CODEBASE, 'src', 'tools');
  const patterns = {};
  
  if (!fs.existsSync(toolsDir)) {
    console.log('Original tools directory not found');
    return patterns;
  }
  
  // Get all tool directories
  const toolDirs = fs.readdirSync(toolsDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  // Analyze implementation patterns in each tool
  for (const toolDir of toolDirs) {
    const mainToolFile = path.join(toolsDir, toolDir, `${toolDir}.tsx`);
    
    if (fs.existsSync(mainToolFile)) {
      const content = fs.readFileSync(mainToolFile, 'utf8');
      
      // Extract key sections
      patterns[toolDir] = {
        imports: extractImports(content),
        interfaces: extractInterfaces(content),
        inputSchema: extractInputSchema(content),
        toolObject: extractToolObject(content),
        implementation: content
      };
    }
  }
  
  return patterns;
}

/**
 * Extract import statements from source
 */
function extractImports(content) {
  const importRegex = /import\s+.*?from\s+['"].*?['"]/g;
  return content.match(importRegex) || [];
}

/**
 * Extract interface definitions from source
 */
function extractInterfaces(content) {
  const interfaceRegex = /interface\s+\w+(\s+extends\s+\w+)?\s*{[\s\S]*?}/g;
  return content.match(interfaceRegex) || [];
}

/**
 * Extract input schema definition from source
 */
function extractInputSchema(content) {
  const schemaRegex = /const\s+inputSchema\s*=\s*z\..*?(?=const|export|$)/gs;
  const match = content.match(schemaRegex);
  return match ? match[0] : null;
}

/**
 * Extract tool object definition from source
 */
function extractToolObject(content) {
  const toolObjectRegex = /export\s+const\s+\w+Tool\s*=\s*{[\s\S]*?}\s*satisfies\s+Tool/g;
  const match = content.match(toolObjectRegex);
  return match ? match[0] : null;
}

/**
 * Find snippets for the given tool and version
 */
function findSnippets(tool, version) {
  const snippetsDir = path.join(SNIPPETS_DIR, `v${version}`, tool);
  
  if (!fs.existsSync(snippetsDir)) {
    return [];
  }
  
  const snippetFiles = fs.readdirSync(snippetsDir)
    .filter(file => file.startsWith('snippet_') && file.endsWith('.js'));
  
  return snippetFiles.map(file => {
    const filePath = path.join(snippetsDir, file);
    return fs.readFileSync(filePath, 'utf8');
  });
}

/**
 * Extract potential method implementations from snippets
 */
function extractMethodImplementations(snippets, toolName) {
  const methods = {
    call: null,
    isEnabled: null,
    needsPermissions: null,
    validateInput: null,
    renderToolUseMessage: null,
    renderToolResultMessage: null,
    renderToolUseRejectedMessage: null,
    renderResultForAssistant: null,
    userFacingName: null
  };
  
  // Regex patterns for different method types
  const methodPatterns = {
    call: new RegExp(`async\\s*\\*\\s*call\\s*\\([^)]*\\)\\s*{[\\s\\S]*?yield\\s*{[\\s\\S]*?}`, 'g'),
    isEnabled: /async\s*isEnabled\s*\(\s*\)\s*{[^}]*}/g,
    needsPermissions: /needsPermissions\s*\([^)]*\)\s*{[^}]*}/g,
    validateInput: /async\s*validateInput\s*\([^)]*\)[^{]*{[\s\S]*?return\s*{[\s\S]*?}/g,
    renderToolUseMessage: /renderToolUseMessage\s*\([^)]*\)\s*{[^}]*}/g,
    renderToolResultMessage: /renderToolResultMessage\s*\([^)]*\)\s*{[\s\S]*?return[\s\S]*?}/g,
    renderToolUseRejectedMessage: /renderToolUseRejectedMessage\s*\([^)]*\)\s*{[\s\S]*?return[\s\S]*?}/g,
    renderResultForAssistant: /renderResultForAssistant\s*\([^)]*\)\s*{[\s\S]*?return[\s\S]*?}/g,
    userFacingName: /userFacingName[^{]*{[^}]*}/g
  };
  
  // Extract methods from snippets
  for (const snippet of snippets) {
    for (const [methodName, pattern] of Object.entries(methodPatterns)) {
      if (methods[methodName]) continue; // Already found
      
      const match = snippet.match(pattern);
      if (match && match[0].includes(toolName)) {
        methods[methodName] = match[0];
      }
    }
  }
  
  return methods;
}

/**
 * Extract description and name from snippets
 */
function extractToolInfo(snippets, toolName) {
  const info = {
    name: toolName,
    description: null
  };
  
  // Look for description
  const descriptionPattern = new RegExp(`description:\\s*["']([^"']*)["']`, 'g');
  for (const snippet of snippets) {
    const match = descriptionPattern.exec(snippet);
    if (match && snippet.includes(toolName)) {
      info.description = match[1];
      break;
    }
  }
  
  return info;
}

/**
 * Reconstruct a tool implementation based on patterns and snippets
 */
function reconstructTool(toolName, version, originalPatterns, snippets) {
  console.log(`Reconstructing ${toolName} for version ${version}...`);
  
  // Extract tool information from snippets
  const toolInfo = extractToolInfo(snippets, toolName);
  
  // Extract method implementations
  const methods = extractMethodImplementations(snippets, toolName);
  
  // Choose a similar tool to base our reconstruction on
  const similarToolName = findSimilarTool(toolName, originalPatterns);
  const basePattern = originalPatterns[similarToolName];
  
  if (!basePattern) {
    console.log(`No similar tool found for ${toolName}`);
    return null;
  }
  
  // Start building the reconstructed source
  let source = '';
  
  // Add imports (based on similar tool)
  source += basePattern.imports.join('\n') + '\n\n';
  
  // Add interfaces (based on similar tool)
  if (basePattern.interfaces.length > 0) {
    source += basePattern.interfaces.join('\n\n') + '\n\n';
  }
  
  // Try to reconstruct input schema
  const inputSchema = reconstructInputSchema(snippets, toolName);
  if (inputSchema) {
    source += inputSchema + '\n\n';
  } else if (basePattern.inputSchema) {
    source += basePattern.inputSchema + '\n\n';
  }
  
  // Build tool object
  source += `export const ${toolName} = {\n`;
  source += `  name: '${toolName}',\n`;
  
  if (toolInfo.description) {
    source += `  description: '${toolInfo.description}',\n`;
  }
  
  // Add methods
  for (const [methodName, implementation] of Object.entries(methods)) {
    if (implementation) {
      // Clean up the implementation
      let cleanedImpl = implementation
        .replace(/^\s*\w+\s*:\s*/, '') // Remove method name prefix
        .trim();
      
      if (!cleanedImpl.endsWith(',')) {
        cleanedImpl += ',';
      }
      
      source += `  ${methodName}: ${cleanedImpl}\n`;
    }
  }
  
  source += `} satisfies Tool<typeof inputSchema>\n`;
  
  return source;
}

/**
 * Find a similar tool in the original codebase to use as a base
 */
function findSimilarTool(toolName, originalPatterns) {
  // Simple mapping for known tools
  const knownMappings = {
    'BatchTool': 'BashTool', // Both execute other code
    'WebFetch': 'FileReadTool', // Both fetch content
    'View': 'FileReadTool' // View is the rename of FileReadTool
  };
  
  if (knownMappings[toolName]) {
    return knownMappings[toolName];
  }
  
  // If no mapping, return the first tool we have
  return Object.keys(originalPatterns)[0];
}

/**
 * Try to reconstruct input schema from snippets
 */
function reconstructInputSchema(snippets, toolName) {
  const schemaPattern = /const\s+inputSchema\s*=\s*z\..*?[,;]/gs;
  
  for (const snippet of snippets) {
    const match = snippet.match(schemaPattern);
    if (match && snippet.includes(toolName)) {
      return match[0];
    }
  }
  
  return null;
}

/**
 * Save reconstructed source
 */
function saveReconstructedSource(toolName, version, source) {
  const toolDir = path.join(OUTPUT_DIR, `v${version}`, 'src', 'tools', `${toolName}`);
  fs.mkdirSync(toolDir, { recursive: true });
  
  const filePath = path.join(toolDir, `${toolName}.tsx`);
  fs.writeFileSync(filePath, source);
  
  console.log(`Saved reconstructed source to ${filePath}`);
}

/**
 * Main execution function
 */
async function main() {
  console.log('Tool Reconstructor');
  console.log('=================');
  
  // Analyze original tools to understand patterns
  const originalPatterns = analyzeOriginalTools();
  
  // Get all version directories from the snippets directory
  const versionDirs = fs.readdirSync(SNIPPETS_DIR)
    .filter(dir => dir.startsWith('v'))
    .map(dir => dir.substring(1)); // Remove 'v' prefix
  
  for (const version of versionDirs) {
    console.log(`\nProcessing version ${version}:`);
    
    for (const toolName of TOOLS_TO_RECONSTRUCT) {
      const snippets = findSnippets(toolName, version);
      
      if (snippets.length === 0) {
        console.log(`  No snippets found for ${toolName} in version ${version}`);
        continue;
      }
      
      const reconstructedSource = reconstructTool(toolName, version, originalPatterns, snippets);
      
      if (reconstructedSource) {
        saveReconstructedSource(toolName, version, reconstructedSource);
      } else {
        console.log(`  Failed to reconstruct ${toolName} for version ${version}`);
      }
    }
  }
  
  console.log('\nReconstruction complete!');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});