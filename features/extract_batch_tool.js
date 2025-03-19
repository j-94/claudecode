#!/usr/bin/env node

/**
 * BatchTool Extractor
 * 
 * This script analyzes the minified CLI files across different Claude Code versions 
 * to identify and extract BatchTool implementation details.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const RELEASES_DIR = path.join(__dirname, 'releases', 'extracted');
const ORIGINAL_SRC = path.join(__dirname, '..', 'original_codebase');
const OUTPUT_DIR = path.join(__dirname, 'batch_tool_analysis');

// Create output directory
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

/**
 * Analyzes a CLI file to find BatchTool implementation
 */
function analyzeBatchTool(cliPath, version) {
  console.log(`Analyzing ${cliPath} for BatchTool implementation...`);
  
  try {
    const fileContent = fs.readFileSync(cliPath, 'utf8');
    const results = {
      version,
      found: false,
      snippets: [],
      references: [],
      size: fileContent.length
    };
    
    // Search for BatchTool in minified code
    const batchToolPattern = /name:\s*["']BatchTool["']/g;
    let match;
    
    while ((match = batchToolPattern.exec(fileContent)) !== null) {
      results.found = true;
      
      // Extract surrounding code (500 chars before and after)
      const start = Math.max(0, match.index - 500);
      const end = Math.min(fileContent.length, match.index + 500);
      const snippet = fileContent.substring(start, end);
      results.snippets.push(snippet);
    }
    
    // Search for invocations array references
    const invocationsPattern = /invocations\s*:\s*\[/g;
    while ((match = invocationsPattern.exec(fileContent)) !== null) {
      const start = Math.max(0, match.index - 200);
      const end = Math.min(fileContent.length, match.index + 500);
      const reference = fileContent.substring(start, end);
      results.references.push(reference);
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
function extractTypeScriptCode(snippets) {
  const typeScriptCode = [];
  
  // Regular expressions to identify key patterns
  const patterns = [
    // Basic structure of a tool object
    /{[\s\S]*?name:\s*["']BatchTool["'][\s\S]*?}/g,
    
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
 * Generates a comparative report of BatchTool implementations
 */
function generateReport(analysisResults) {
  console.log('Generating BatchTool report...');
  
  const reportPath = path.join(OUTPUT_DIR, 'batch_tool_report.md');
  
  let report = `# BatchTool Implementation Analysis\n\n`;
  report += `This report analyzes the BatchTool implementations across Claude Code versions.\n\n`;
  
  // Version comparison table
  report += `## Version Comparison\n\n`;
  report += `| Version | Contains BatchTool | File Size | Snippet Count |\n`;
  report += `|---------|-------------------|-----------|---------------|\n`;
  
  for (const [version, results] of Object.entries(analysisResults)) {
    if (!results) continue;
    
    const fileSizeMb = (results.size / (1024 * 1024)).toFixed(2);
    report += `| ${version} | ${results.found ? '✅' : '❌'} | ${fileSizeMb} MB | ${results.snippets.length} |\n`;
  }
  
  // Reconstructed code
  report += `\n## Reconstructed BatchTool Code\n\n`;
  
  for (const [version, results] of Object.entries(analysisResults)) {
    if (!results || !results.found) continue;
    
    report += `### Version ${version}\n\n`;
    
    // Extract TypeScript-like code from snippets
    const codeSnippets = extractTypeScriptCode(results.snippets);
    
    if (codeSnippets.length > 0) {
      report += `\`\`\`typescript\n`;
      report += codeSnippets.join('\n\n');
      report += `\n\`\`\`\n\n`;
    } else {
      report += `No structured code could be extracted.\n\n`;
      
      // Include raw snippets if structured extraction failed
      report += `#### Raw Snippets\n\n`;
      results.snippets.forEach((snippet, index) => {
        report += `##### Snippet ${index + 1}\n\n`;
        report += `\`\`\`javascript\n${snippet}\n\`\`\`\n\n`;
      });
    }
  }
  
  // Save the full minified sections for reference
  for (const [version, results] of Object.entries(analysisResults)) {
    if (!results || !results.found) continue;
    
    const snippetsDir = path.join(OUTPUT_DIR, `v${version}`);
    fs.mkdirSync(snippetsDir, { recursive: true });
    
    results.snippets.forEach((snippet, index) => {
      fs.writeFileSync(
        path.join(snippetsDir, `batch_tool_snippet_${index}.js`), 
        snippet
      );
    });
    
    results.references.forEach((reference, index) => {
      fs.writeFileSync(
        path.join(snippetsDir, `invocations_reference_${index}.js`), 
        reference
      );
    });
  }
  
  fs.writeFileSync(reportPath, report);
  console.log(`Report saved to ${reportPath}`);
}

/**
 * Main execution function
 */
async function main() {
  console.log('BatchTool Extractor');
  console.log('==================');
  
  const analysisResults = {};
  
  // Get all version directories
  const versionDirs = fs.readdirSync(RELEASES_DIR);
  
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
    
    // Analyze for BatchTool
    const results = analyzeBatchTool(cliPath, version);
    if (results) {
      analysisResults[version] = results;
      console.log(`  Analysis complete: BatchTool ${results.found ? 'found' : 'not found'}`);
    }
  }
  
  // Generate comparative report
  generateReport(analysisResults);
  
  console.log('\nAnalysis complete!');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});