#!/usr/bin/env node

/**
 * Claude Code Release Analyzer
 * 
 * This script downloads and analyzes multiple versions of Claude Code to track
 * feature evolution and code changes over time.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const util = require('util');

// Configuration
const OUTPUT_DIR = path.join(__dirname, 'releases');
const VERSIONS_TO_ANALYZE = [
  '0.2.8', '0.2.9', '0.2.18', '0.2.25', '0.2.30', 
  '0.2.35', '0.2.40', '0.2.45', '0.2.49'
];
const ORIGINAL_SRC = path.join(__dirname, '..', 'original_codebase');

// Create output directory structure
fs.mkdirSync(OUTPUT_DIR, { recursive: true });
fs.mkdirSync(path.join(OUTPUT_DIR, 'extracted'), { recursive: true });
fs.mkdirSync(path.join(OUTPUT_DIR, 'reports'), { recursive: true });
fs.mkdirSync(path.join(OUTPUT_DIR, 'source_maps'), { recursive: true });

/**
 * Downloads a specific version of Claude Code from npm
 */
function downloadVersion(version) {
  console.log(`Downloading version ${version}...`);
  try {
    const outputPath = path.join(OUTPUT_DIR, `claude-code-${version}.tgz`);
    if (fs.existsSync(outputPath)) {
      console.log(`  Already downloaded.`);
      return outputPath;
    }
    
    execSync(`npm pack @anthropic-ai/claude-code@${version}`, { 
      cwd: OUTPUT_DIR,
      stdio: 'pipe' 
    });
    
    // Rename to a consistent pattern
    const packageFilename = `anthropic-ai-claude-code-${version}.tgz`;
    const packagePath = path.join(OUTPUT_DIR, packageFilename);
    if (fs.existsSync(packagePath)) {
      fs.renameSync(packagePath, outputPath);
    }
    
    console.log(`  Downloaded successfully.`);
    return outputPath;
  } catch (error) {
    console.error(`  Error downloading version ${version}:`, error.message);
    return null;
  }
}

/**
 * Extracts a downloaded package
 */
function extractPackage(packagePath, version) {
  if (!packagePath || !fs.existsSync(packagePath)) {
    console.error(`Package path does not exist: ${packagePath}`);
    return null;
  }
  
  const extractDir = path.join(OUTPUT_DIR, 'extracted', `v${version}`);
  console.log(`Extracting to ${extractDir}...`);
  
  if (fs.existsSync(extractDir)) {
    console.log(`  Already extracted.`);
    return extractDir;
  }
  
  fs.mkdirSync(extractDir, { recursive: true });
  
  try {
    execSync(`tar -xzf "${packagePath}" -C "${extractDir}"`, {
      stdio: 'pipe'
    });
    console.log(`  Extracted successfully.`);
    return extractDir;
  } catch (error) {
    console.error(`  Error extracting version ${version}:`, error.message);
    return null;
  }
}

/**
 * Extracts source map if present in the CLI file
 */
function extractSourceMap(extractDir, version) {
  const cliFile = path.join(extractDir, 'package', 'cli.js');
  const cliMjsFile = path.join(extractDir, 'package', 'cli.mjs');
  const sourceMapDir = path.join(OUTPUT_DIR, 'source_maps', `v${version}`);
  
  fs.mkdirSync(sourceMapDir, { recursive: true });
  
  // Check which CLI file exists
  const targetFile = fs.existsSync(cliFile) ? cliFile : 
                    (fs.existsSync(cliMjsFile) ? cliMjsFile : null);
  
  if (!targetFile) {
    console.log(`  No CLI file found for version ${version}`);
    return false;
  }
  
  console.log(`Looking for source map in ${targetFile}...`);
  
  try {
    // Read last 1000 bytes to check for source map reference
    const stats = fs.statSync(targetFile);
    const buffer = Buffer.alloc(1000);
    const fileDescriptor = fs.openSync(targetFile, 'r');
    fs.readSync(fileDescriptor, buffer, 0, 1000, Math.max(0, stats.size - 1000));
    fs.closeSync(fileDescriptor);
    
    const lastData = buffer.toString('utf8');
    const sourceMapMatch = lastData.match(/\/\/# sourceMappingURL=data:application\/json;base64,([A-Za-z0-9+/=]+)/);
    
    if (sourceMapMatch && sourceMapMatch[1]) {
      console.log(`  Source map found!`);
      const base64Data = sourceMapMatch[1];
      
      // Save the source map to a file
      const sourceMapPath = path.join(sourceMapDir, 'sourcemap.json');
      fs.writeFileSync(sourceMapPath, Buffer.from(base64Data, 'base64'));
      console.log(`  Source map extracted to ${sourceMapPath}`);
      
      return sourceMapPath;
    } else {
      console.log(`  No source map found in version ${version}`);
      
      // Check if entire file needs to be scanned (for very large source maps)
      if (stats.size > 15 * 1024 * 1024) { // If file is larger than 15MB
        console.log(`  File is large (${Math.round(stats.size/1024/1024)}MB), performing full scan...`);
        const content = fs.readFileSync(targetFile, 'utf8');
        const fullSourceMapMatch = content.match(/\/\/# sourceMappingURL=data:application\/json;base64,([A-Za-z0-9+/=]+)/);
        
        if (fullSourceMapMatch && fullSourceMapMatch[1]) {
          console.log(`  Source map found in full scan!`);
          const base64Data = fullSourceMapMatch[1];
          
          // Save the source map to a file
          const sourceMapPath = path.join(sourceMapDir, 'sourcemap.json');
          fs.writeFileSync(sourceMapPath, Buffer.from(base64Data, 'base64'));
          console.log(`  Source map extracted to ${sourceMapPath}`);
          
          return sourceMapPath;
        }
      }
    }
    
    return false;
  } catch (error) {
    console.error(`  Error extracting source map for version ${version}:`, error.message);
    return false;
  }
}

/**
 * Analyzes a CLI file to extract features and commands
 */
function analyzeCliFile(extractDir, version) {
  const cliFile = path.join(extractDir, 'package', 'cli.js');
  const cliMjsFile = path.join(extractDir, 'package', 'cli.mjs');
  
  // Check which CLI file exists
  const targetFile = fs.existsSync(cliFile) ? cliFile : 
                    (fs.existsSync(cliMjsFile) ? cliMjsFile : null);
  
  if (!targetFile) {
    console.log(`  No CLI file found for version ${version}`);
    return null;
  }
  
  console.log(`Analyzing CLI file for version ${version}...`);
  
  try {
    const content = fs.readFileSync(targetFile, 'utf8');
    
    // Extract potential tools
    const toolResults = {
      userFacingNames: [],
      commands: [],
      fileSize: fs.statSync(targetFile).size
    };
    
    // Extract user-facing tool names
    const userFacingNameMatches = content.match(/userFacingName\(\)[^}]*return\s*["']([^"']+)["']/g) || [];
    toolResults.userFacingNames = userFacingNameMatches.map(match => {
      const nameMatch = match.match(/return\s*["']([^"']+)["']/);
      return nameMatch ? nameMatch[1] : null;
    }).filter(Boolean);
    
    // Extract commands
    const commandMatches = content.match(/command\(["'][a-zA-Z-]+["']\)\.description\(["']([^"']+)["']\)/g) || [];
    toolResults.commands = commandMatches.map(match => {
      const descMatch = match.match(/description\(["']([^"']+)["']\)/);
      return descMatch ? descMatch[1] : null;
    }).filter(Boolean);
    
    return toolResults;
  } catch (error) {
    console.error(`  Error analyzing CLI file for version ${version}:`, error.message);
    return null;
  }
}

/**
 * Compares features across versions
 */
function generateFeatureComparisonReport(results) {
  console.log(`Generating feature comparison report...`);
  
  const reportPath = path.join(OUTPUT_DIR, 'reports', 'feature_comparison.md');
  
  let report = `# Claude Code Feature Evolution\n\n`;
  report += `This report shows how Claude Code's features have evolved across versions.\n\n`;
  
  // File size evolution
  report += `## File Size Evolution\n\n`;
  report += `| Version | CLI File Size | Has Source Map |\n`;
  report += `|---------|---------------|---------------|\n`;
  
  for (const [version, data] of Object.entries(results)) {
    const fileSize = data.fileSize ? (data.fileSize / (1024 * 1024)).toFixed(2) + ' MB' : 'N/A';
    const hasSourceMap = data.sourceMap ? '✅' : '❌';
    report += `| ${version} | ${fileSize} | ${hasSourceMap} |\n`;
  }
  
  // Tool evolution
  report += `\n## Tool Evolution\n\n`;
  
  // Get all unique tools across all versions
  const allTools = new Set();
  for (const data of Object.values(results)) {
    data.userFacingNames.forEach(tool => allTools.add(tool));
  }
  
  // Create tool presence table
  report += `| Tool | ${Object.keys(results).join(' | ')} |\n`;
  report += `|------|${Object.keys(results).map(() => '---').join('|')}|\n`;
  
  allTools.forEach(tool => {
    report += `| ${tool} | `;
    Object.entries(results).forEach(([version, data], index) => {
      const hasFeature = data.userFacingNames.includes(tool);
      report += hasFeature ? '✅' : '❌';
      report += index < Object.keys(results).length - 1 ? ' | ' : '';
    });
    report += ` |\n`;
  });
  
  // Command evolution
  report += `\n## Command Evolution\n\n`;
  
  // Get all unique commands across all versions
  const allCommands = new Set();
  for (const data of Object.values(results)) {
    data.commands.forEach(command => allCommands.add(command));
  }
  
  // Create command presence table
  report += `| Command | ${Object.keys(results).join(' | ')} |\n`;
  report += `|---------|${Object.keys(results).map(() => '---').join('|')}|\n`;
  
  allCommands.forEach(command => {
    report += `| ${command} | `;
    Object.entries(results).forEach(([version, data], index) => {
      const hasCommand = data.commands.includes(command);
      report += hasCommand ? '✅' : '❌';
      report += index < Object.keys(results).length - 1 ? ' | ' : '';
    });
    report += ` |\n`;
  });
  
  fs.writeFileSync(reportPath, report);
  console.log(`Report saved to ${reportPath}`);
}

/**
 * Main execution function
 */
async function main() {
  console.log('Claude Code Release Analyzer');
  console.log('===========================');
  
  const results = {};
  
  for (const version of VERSIONS_TO_ANALYZE) {
    console.log(`\nProcessing version ${version}:`);
    
    // Download
    const packagePath = downloadVersion(version);
    if (!packagePath) continue;
    
    // Extract
    const extractDir = extractPackage(packagePath, version);
    if (!extractDir) continue;
    
    // Extract source map
    const sourceMap = extractSourceMap(extractDir, version);
    
    // Analyze CLI
    const analysis = analyzeCliFile(extractDir, version);
    if (!analysis) continue;
    
    results[version] = {
      ...analysis,
      sourceMap: sourceMap
    };
  }
  
  // Generate comparison report
  generateFeatureComparisonReport(results);
  
  console.log('\nAnalysis complete!');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});