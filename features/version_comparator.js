#!/usr/bin/env node

/**
 * Claude Code Version Comparator
 * 
 * This script analyzes the minified CLI files across different Claude Code versions 
 * to identify and extract implementation details for all features.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const RELEASES_DIR = path.join(__dirname, 'releases', 'extracted');
const ORIGINAL_SRC = path.join(__dirname, '..', 'original_codebase');
const OUTPUT_DIR = path.join(__dirname, 'version_analysis');

// Features to analyze
const FEATURES = [
  {
    name: "BatchTool",
    patterns: [
      /name:\s*["']BatchTool["']/g,
      /userFacingName\(\)[^}]*return\s*["']Batch["']/g,
      /description:\s*["']Batch execution tool[^"']*/g
    ]
  },
  {
    name: "WebFetch",
    patterns: [
      /name:\s*["']WebFetch["']/g,
      /userFacingName\(\)[^}]*return\s*["']WebFetch["']/g,
      /description:\s*["'][^"']*fetch[^"']*/ig
    ]
  },
  {
    name: "View",
    patterns: [
      /name:\s*["']View["']/g,
      /userFacingName\(\)[^}]*return\s*["']View["']/g,
      /userFacingName\(\)[^}]*return\s*["']Read["']/g
    ]
  },
  {
    name: "MCP",
    patterns: [
      /name:\s*["']MCPTool["']/g,
      /userFacingName\(\)[^}]*return\s*["']mcp["']/g
    ]
  },
  {
    name: "PermissionSystem",
    patterns: [
      /needsPermissions\(/g,
      /PermissionRequest/g,
      /renderToolUseRejectedMessage/g
    ]
  }
];

// Create output directory
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

/**
 * Extracts the tools available in the original codebase
 */
function analyzeOriginalCodebase() {
  console.log(`Analyzing original codebase...`);
  
  const toolsDir = path.join(ORIGINAL_SRC, 'src', 'tools');
  const tools = {};
  
  if (fs.existsSync(toolsDir)) {
    const toolFolders = fs.readdirSync(toolsDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    for (const toolFolder of toolFolders) {
      const toolPath = path.join(toolsDir, toolFolder, `${toolFolder}.tsx`);
      if (fs.existsSync(toolPath)) {
        const content = fs.readFileSync(toolPath, 'utf8');
        let userFacingName = null;
        
        const nameMatch = content.match(/userFacingName\(\)[^}]*return\s*["']([^"']+)["']/);
        if (nameMatch) {
          userFacingName = nameMatch[1];
        }
        
        tools[toolFolder] = {
          name: toolFolder,
          userFacingName,
          sourcePath: toolPath
        };
      }
    }
  }
  
  return tools;
}

/**
 * Analyzes a CLI file to find feature implementations
 */
function analyzeFeatures(cliPath, version) {
  console.log(`Analyzing ${cliPath} for feature implementations...`);
  
  try {
    const fileContent = fs.readFileSync(cliPath, 'utf8');
    const results = {
      version,
      features: {},
      tools: [],
      commands: [],
      size: fileContent.length
    };
    
    // Extract all tools
    const toolNamePattern = /name:\s*["'](\w+Tool|\w+)["']/g;
    let match;
    while ((match = toolNamePattern.exec(fileContent)) !== null) {
      const toolName = match[1];
      if (!results.tools.includes(toolName) && toolName.includes('Tool')) {
        results.tools.push(toolName);
      }
    }
    
    // Extract user-facing tool names
    const userFacingNameMatches = fileContent.match(/userFacingName\(\)[^}]*return\s*["']([^"']+)["']/g) || [];
    const userFacingNames = userFacingNameMatches.map(match => {
      const nameMatch = match.match(/return\s*["']([^"']+)["']/);
      return nameMatch ? nameMatch[1] : null;
    }).filter(Boolean);
    
    results.userFacingNames = userFacingNames;
    
    // Extract commands
    const commandMatches = fileContent.match(/command\(["'][a-zA-Z-]+["']\)[^)]*description\(["']([^"']+)["']\)/g) || [];
    results.commands = commandMatches.map(match => {
      const descMatch = match.match(/description\(["']([^"']+)["']\)/);
      return descMatch ? descMatch[1] : null;
    }).filter(Boolean);
    
    // Analyze each feature
    for (const feature of FEATURES) {
      results.features[feature.name] = {
        found: false,
        snippets: [],
        references: []
      };
      
      for (const pattern of feature.patterns) {
        pattern.lastIndex = 0; // Reset regex
        
        while ((match = pattern.exec(fileContent)) !== null) {
          results.features[feature.name].found = true;
          
          // Extract surrounding code (500 chars before and after)
          const start = Math.max(0, match.index - 500);
          const end = Math.min(fileContent.length, match.index + 500);
          const snippet = fileContent.substring(start, end);
          
          if (!results.features[feature.name].snippets.includes(snippet)) {
            results.features[feature.name].snippets.push(snippet);
          }
        }
      }
    }
    
    return results;
  } catch (error) {
    console.error(`Error analyzing ${cliPath}:`, error.message);
    return null;
  }
}

/**
 * Extracts TypeScript-like code from minified JavaScript
 */
function extractTypeScriptCode(snippets, featureName) {
  const typeScriptCode = [];
  
  // Regular expressions to identify key patterns
  const patterns = [
    // Basic structure of a tool object
    new RegExp(`{[\\s\\S]*?name:\\s*["']${featureName}["'][\\s\\S]*?}`, 'g'),
    
    // Interface-like structures
    /interface[\s\S]*?{[\s\S]*?}/g,
    
    // Function implementations
    /function\s*\([\s\S]*?\)[\s\S]*?{[\s\S]*?}/g,
    
    // Method implementations
    /\w+\s*:\s*async\s*function[\s\S]*?{[\s\S]*?}/g
  ];
  
  for (const snippet of snippets) {
    for (const pattern of patterns) {
      const matches = snippet.match(pattern);
      if (matches) {
        typeScriptCode.push(...matches);
      }
    }
  }
  
  return typeScriptCode;
}

/**
 * Generates a comparative report of feature implementations across versions
 */
function generateReport(analysisResults, originalTools) {
  console.log('Generating feature comparison report...');
  
  const reportPath = path.join(OUTPUT_DIR, 'feature_comparison.md');
  
  let report = `# Claude Code Feature Evolution\n\n`;
  report += `This report analyzes feature implementations across Claude Code versions.\n\n`;
  
  // Version comparison table
  report += `## Version Comparison\n\n`;
  report += `| Version | File Size |`;
  for (const feature of FEATURES) {
    report += ` ${feature.name} |`;
  }
  report += ` Tool Count | Command Count |\n`;
  
  report += `|---------|-----------|`;
  for (const feature of FEATURES) {
    report += `----------|`;
  }
  report += `------------|---------------|\n`;
  
  for (const [version, results] of Object.entries(analysisResults)) {
    if (!results) continue;
    
    const fileSizeMb = (results.size / (1024 * 1024)).toFixed(2);
    report += `| ${version} | ${fileSizeMb} MB |`;
    
    for (const feature of FEATURES) {
      report += ` ${results.features[feature.name].found ? '✅' : '❌'} |`;
    }
    
    report += ` ${results.tools.length} | ${results.commands.length} |\n`;
  }
  
  // Tool evolution
  report += `\n## Tool Evolution\n\n`;
  
  // Get all unique tools across all versions
  const allTools = new Set();
  for (const [version, results] of Object.entries(analysisResults)) {
    if (!results) continue;
    results.tools.forEach(tool => allTools.add(tool));
  }
  // Add original tools
  Object.keys(originalTools).forEach(tool => allTools.add(tool));
  
  // Create tool presence table
  report += `| Tool | Original |`;
  for (const version of Object.keys(analysisResults)) {
    report += ` ${version} |`;
  }
  report += `\n|------|----------|`;
  for (const version of Object.keys(analysisResults)) {
    report += `----------|`;
  }
  report += `\n`;
  
  const sortedTools = Array.from(allTools).sort();
  for (const tool of sortedTools) {
    const originalName = originalTools[tool]?.userFacingName || '';
    report += `| ${tool} ${originalName ? `(${originalName})` : ''} | ${originalTools[tool] ? '✅' : '❌'} |`;
    
    for (const [version, results] of Object.entries(analysisResults)) {
      if (!results) {
        report += ` ? |`;
        continue;
      }
      const hasFeature = results.tools.includes(tool);
      report += ` ${hasFeature ? '✅' : '❌'} |`;
    }
    report += `\n`;
  }
  
  // User-facing names evolution
  report += `\n## User-Facing Names Evolution\n\n`;
  
  // Get all unique user-facing names across all versions
  const allUserFacingNames = new Set();
  for (const [version, results] of Object.entries(analysisResults)) {
    if (!results || !results.userFacingNames) continue;
    results.userFacingNames.forEach(name => allUserFacingNames.add(name));
  }
  
  // Create user-facing names presence table
  report += `| User-Facing Name |`;
  for (const version of Object.keys(analysisResults)) {
    report += ` ${version} |`;
  }
  report += `\n|-----------------|`;
  for (const version of Object.keys(analysisResults)) {
    report += `----------|`;
  }
  report += `\n`;
  
  const sortedNames = Array.from(allUserFacingNames).sort();
  for (const name of sortedNames) {
    report += `| ${name} |`;
    
    for (const [version, results] of Object.entries(analysisResults)) {
      if (!results || !results.userFacingNames) {
        report += ` ? |`;
        continue;
      }
      const hasName = results.userFacingNames.includes(name);
      report += ` ${hasName ? '✅' : '❌'} |`;
    }
    report += `\n`;
  }
  
  // Feature-specific code
  for (const feature of FEATURES) {
    report += `\n## ${feature.name} Implementation\n\n`;
    
    for (const [version, results] of Object.entries(analysisResults)) {
      if (!results || !results.features[feature.name].found) continue;
      
      report += `### Version ${version}\n\n`;
      
      // Extract TypeScript-like code from snippets
      const codeSnippets = extractTypeScriptCode(
        results.features[feature.name].snippets,
        feature.name
      );
      
      if (codeSnippets.length > 0) {
        report += `\`\`\`typescript\n`;
        report += codeSnippets.join('\n\n');
        report += `\n\`\`\`\n\n`;
      } else {
        report += `No structured code could be extracted.\n\n`;
        
        // Include raw snippets if structured extraction failed
        report += `#### Raw Snippets\n\n`;
        results.features[feature.name].snippets.forEach((snippet, index) => {
          report += `##### Snippet ${index + 1}\n\n`;
          report += `\`\`\`javascript\n${snippet}\n\`\`\`\n\n`;
        });
      }
    }
  }
  
  fs.writeFileSync(reportPath, report);
  console.log(`Report saved to ${reportPath}`);
  
  // Save raw snippets for detailed analysis
  for (const [version, results] of Object.entries(analysisResults)) {
    if (!results) continue;
    
    for (const feature of FEATURES) {
      if (!results.features[feature.name].found) continue;
      
      const snippetsDir = path.join(OUTPUT_DIR, `v${version}`, feature.name);
      fs.mkdirSync(snippetsDir, { recursive: true });
      
      results.features[feature.name].snippets.forEach((snippet, index) => {
        fs.writeFileSync(
          path.join(snippetsDir, `snippet_${index}.js`), 
          snippet
        );
      });
    }
  }
}

/**
 * Main execution function
 */
async function main() {
  console.log('Claude Code Version Comparator');
  console.log('=============================');
  
  // Analyze original codebase
  const originalTools = analyzeOriginalCodebase();
  
  // Get all version directories
  const versionDirs = fs.readdirSync(RELEASES_DIR);
  const analysisResults = {};
  
  for (const versionDir of versionDirs) {
    if (!versionDir.startsWith('v')) continue;
    
    const version = versionDir.substring(1); // Remove 'v' prefix
    console.log(`\nProcessing version ${version}:`);
    
    // Check for CLI files
    const packageDir = path.join(RELEASES_DIR, versionDir, 'package');
    const cliJs = path.join(packageDir, 'cli.js');
    const cliMjs = path.join(packageDir, 'cli.mjs');
    
    // Check which CLI file exists
    const cliPath = fs.existsSync(cliJs) ? cliJs : 
                   (fs.existsSync(cliMjs) ? cliMjs : null);
    
    if (!cliPath) {
      console.log(`  No CLI file found for version ${version}`);
      continue;
    }
    
    // Analyze features
    const results = analyzeFeatures(cliPath, version);
    if (results) {
      analysisResults[version] = results;
      
      // Log feature findings
      for (const feature of FEATURES) {
        console.log(`  ${feature.name}: ${results.features[feature.name].found ? 'Found' : 'Not found'}`);
      }
    }
  }
  
  // Generate comparison report
  generateReport(analysisResults, originalTools);
  
  console.log('\nAnalysis complete!');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});